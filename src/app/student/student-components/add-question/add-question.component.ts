import { Component, ChangeDetectorRef } from '@angular/core';
import { RoomsService, Question } from '../../../service/rooms.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { switchMap, take, filter } from 'rxjs/operators';
import { JwtService } from '../../../service/jwt.service';

@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-question.component.html',
  styleUrl: './add-question.component.css'
})
export class AddQuestionComponent {
  quizId!: number;
  pdfFile: File | null = null;
  questions: Question[] = [];
  loading = false;
  errorMessage = '';
  testStarted = false;
  testCompleted = false;
  currentQuestionIndex = 0;
  studentAnswers: string[] = [];
  score: number = 0;
  uploading = false;
  uploaded = false;
  questionForm: FormGroup;
  studentId: string = '';
  quizResult: any = null;

  constructor(
    private route: ActivatedRoute,
    public roomsService: RoomsService,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private jwtService: JwtService // Inject JwtService
  ) {
    this.questionForm = this.fb.group({
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.params['quizId']);
    // Extract studentId from JWT
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.jwtService.decodeToken(token);
      this.studentId = decoded?.nameid || decoded?.sub || '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    console.log('Selected file:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });
    
    if (!file) {
      Swal.fire('Error', 'No file selected.', 'error');
      this.pdfFile = null;
      return;
    }

    if (file.type !== 'application/pdf') {
      Swal.fire('Error', `Invalid file type: ${file.type}. Please upload a PDF file.`, 'error');
      this.pdfFile = null;
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      Swal.fire('Error', 'File is too large. Maximum size is 10MB.', 'error');
      this.pdfFile = null;
      return;
    }

    this.pdfFile = file;
    console.log('PDF file set successfully');
  }

  generateQuestions() {
    if (!this.pdfFile) {
      Swal.fire('Error', 'Please select a PDF file first.', 'error');
      return;
    }

    if (!this.quizId || this.quizId <= 0) {
      Swal.fire('Error', 'Invalid quiz ID.', 'error');
      return;
    }

    this.uploading = true;
    this.roomsService.generateQuestionsForStudent(this.quizId, this.pdfFile).subscribe({
      next: (response) => {
        if (response.questions && response.questions.length > 0) {
          this.questions = response.questions;
          this.uploading = false;
          this.uploaded = true;
          Swal.fire('Success', 'Questions generated from PDF!', 'success');
          this.testStarted = true;
          this.studentAnswers = new Array(this.questions.length).fill('');
          this.initializeForm();
          this.cdr.markForCheck();
        } else {
          throw new Error('No questions returned');
        }
      },
      error: (error) => {
        console.error('Error uploading PDF:', error);
        this.uploading = false;
        let errorMessage = 'Failed to generate questions.';
        if (error.status === 400) {
          errorMessage = error.message || 'Invalid PDF file or quiz ID. Please check and try again.';
        }
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  initializeForm() {
    const arr = this.questions.map(q => this.createQuestionFormGroup(q));
    this.questionForm.setControl('questions', this.fb.array(arr));
  }

  createQuestionFormGroup(question?: Question): FormGroup {
    const type = question?.type || 1;
    let options = question?.options || [];
    let correctAnswer = question?.correctAnswer || '';
    if (!question) {
      if (type === 2) {
        options = [{ text: 'True' }, { text: 'False' }];
        correctAnswer = 'True';
      } else {
        options = [{ text: '' }, { text: '' }];
      }
    }
    const optionsArray = this.fb.array(
      options.map((opt: any) => this.fb.group({ text: [opt.text, Validators.required] }))
    );
    return this.fb.group({
      id: [question?.id],
      text: [question?.text || '', Validators.required],
      type: [type, Validators.required],
      correctAnswer: [correctAnswer, Validators.required],
      quizId: [this.quizId],
      options: optionsArray
    });
  }

  submitTest() {
    let correct = 0;
    this.questions.forEach((q, i) => {
      if (q.correctAnswer === this.studentAnswers[i]) correct++;
    });
    this.score = correct;
    this.testCompleted = true;
    // Submit result
    this.roomsService.submitQuizResult({
      score: correct,
      studentId: this.studentId,
      quizId: this.quizId
    }).subscribe({
      next: () => {
        // Fetch and display result after submit
        this.roomsService.getQuizResult(this.quizId, this.studentId).subscribe(result => {
          this.quizResult = result;
          this.cdr.markForCheck();
        });
      }
    });
  }

  calculateScorePercentage(): number {
    if (!this.score || !this.questions.length) {
      return 0;
    }
    return (this.score / this.questions.length) * 100;
  }
}
