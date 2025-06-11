import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RoomsService, Question } from '../../service/rooms.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

enum QuestionType {
  MULTIPLE_CHOICE = 1,
  TRUE_FALSE = 2
}

interface QuestionFormData extends Omit<Question, 'type'> {
  type: QuestionType;
}

interface QuestionOption {
  text: string;
}

@Component({
  selector: 'app-quiz-test-ai-teacher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './quiz-test-ai-teacher.component.html',
  styleUrl: './quiz-test-ai-teacher.component.css'
})
export class QuizTestAiTeacherComponent implements OnInit {
  readonly QUESTION_TYPE = QuestionType;
  
  quizId!: number;
  roomId!: string;
  questions: Question[] = [];
  loading = false;
  errorMessage = '';
  pdfFile: File | null = null;
  uploading = false;
  questionForm: FormGroup;
  originalQuestions: Map<number, Question> = new Map();

  constructor(
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private fb: FormBuilder
  ) {
    this.questionForm = this.fb.group({
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.params['quizId']);
    this.roomId = this.route.snapshot.params['roomId'];
    if (!this.quizId) {
      this.errorMessage = 'Quiz ID not found.';
      return;
    }
    this.loadQuestions();
  }

  get questionsArray() {
    return this.questionForm.get('questions') as FormArray;
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('options') as FormArray;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.pdfFile = file;
    } else {
      Swal.fire('Error', 'Please upload a valid PDF file.', 'error');
    }
  }

  generateQuestions() {
    if (!this.pdfFile) {
      Swal.fire('Error', 'Please select a PDF file first.', 'error');
      return;
    }
    this.uploading = true;
    this.roomsService.generateQuestionsFromPDF(this.quizId, this.pdfFile).subscribe({
      next: (questions: any) => {
        this.uploading = false;
        Swal.fire('Success', 'Questions generated from PDF!', 'success');
        this.questions = questions;
        this.initializeForm();
      },
      error: (err: any) => {
        this.uploading = false;
        Swal.fire('Error', 'Failed to generate questions.', 'error');
      }
    });
  }

  loadQuestions() {
    this.loading = true;
    this.roomsService.getQuestionsByQuiz(this.quizId).subscribe({
      next: (questions) => {
        this.questions = questions;
        questions.forEach(q => { if (q.id) this.originalQuestions.set(q.id, { ...q }); });
        this.initializeForm();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load questions.';
      }
    });
  }

  initializeForm() {
    const arr = this.questions.map(q => this.createQuestionFormGroup(q));
    this.questionForm.setControl('questions', this.fb.array(arr));
  }

  createQuestionFormGroup(question?: Question): FormGroup {
    const type = question?.type || QuestionType.MULTIPLE_CHOICE;
    let options: QuestionOption[] = question?.options || [];
    let correctAnswer = question?.correctAnswer || '';
    
    if (!question) {
      if (type === QuestionType.TRUE_FALSE) {
        options = [{ text: 'True' }, { text: 'False' }];
        correctAnswer = 'True';
      } else {
        options = [{ text: '' }, { text: '' }];
      }
    }

    const optionsArray = this.fb.array(
      options.map((opt: QuestionOption) => this.fb.group({ 
        text: [opt.text, Validators.required] 
      }))
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

  addNewQuestion() {
    const questionsArray = this.questionForm.get('questions') as FormArray;
    const newQuestion = this.createQuestionFormGroup();
    questionsArray.push(newQuestion);
    // Initialize options based on type
    this.onQuestionTypeChange(questionsArray.length - 1);
  }

  onQuestionTypeChange(questionIndex: number) {
    const question = this.questionsArray.at(questionIndex);
    const type = question.get('type')?.value;
    const options = question.get('options') as FormArray;
    
    // Clear existing options
    while (options.length) {
      options.removeAt(0);
    }

    if (type === QuestionType.TRUE_FALSE) {
      // Add True and False options
      options.push(this.fb.group({ text: ['True', Validators.required] }));
      options.push(this.fb.group({ text: ['False', Validators.required] }));
      // Set default correct answer to True
      question.patchValue({ correctAnswer: 'True' });
    } else {
      // Add two empty options for Multiple Choice
      options.push(this.fb.group({ text: ['', Validators.required] }));
      options.push(this.fb.group({ text: ['', Validators.required] }));
    }
  }

  addOption(questionIndex: number) {
    const question = this.questionsArray.at(questionIndex);
    const options = question.get('options') as FormArray;
    options.push(this.fb.group({
      text: ['', Validators.required]
    }));
  }

  removeOption(questionIndex: number, optionIndex: number) {
    const question = this.questionsArray.at(questionIndex);
    const options = question.get('options') as FormArray;
    if (options.length > 2) { // Maintain minimum of 2 options
      const optionToRemove = options.at(optionIndex);
      const optionText = optionToRemove.get('text')?.value;
      const currentCorrectAnswer = question.get('correctAnswer')?.value;

      // If removing the correct answer option, clear the correct answer
      if (optionText === currentCorrectAnswer) {
        question.patchValue({ correctAnswer: '' });
      }
      options.removeAt(optionIndex);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Remove Option',
        text: 'Multiple choice questions must have at least 2 options',
        confirmButtonColor: '#332588'
      });
    }
  }

  removeQuestion(index: number) {
    const question = this.questionsArray.at(index);
    const questionId = question.get('id')?.value;

    if (questionId) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this question?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.roomsService.deleteQuestion(questionId).subscribe({
            next: () => {
              this.questionsArray.removeAt(index);
              this.originalQuestions.delete(questionId);
              Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Question has been deleted.' });
              this.loadQuestions();
            },
            error: (error) => {
              Swal.fire('Error', 'Failed to delete question.', 'error');
            }
          });
        }
      });
    } else {
      this.questionsArray.removeAt(index);
    }
  }

  private isQuestionModified(question: any): boolean {
    if (!question.id) return true; // New question
    const original = this.originalQuestions.get(question.id);
    if (!original) return true;

    // Compare all relevant fields
    return question.text !== original.text ||
           question.type !== original.type ||
           question.correctAnswer !== original.correctAnswer ||
           JSON.stringify(question.options) !== JSON.stringify(original.options);
  }

  async saveSingleQuestion(index: number) {
    try {
      const question = this.questionsArray.at(index);
      if (!question || !question.valid) {
        throw new Error('Invalid question data');
      }

      const questionData: Question = {
        text: question.get('text')?.value,
        type: question.get('type')?.value,
        correctAnswer: question.get('correctAnswer')?.value,
        quizId: this.quizId,
        options: question.get('options')?.value
      };

      if (question.get('id')?.value) {
        await this.roomsService.updateQuestion(question.get('id')?.value, questionData).toPromise();
        this.originalQuestions.set(question.get('id')?.value, { ...questionData });
      } else {
        const result = await this.roomsService.addQuestions([questionData]).toPromise();
        if (result && (result as any).id) {
          question.patchValue({ id: (result as any).id });
          this.originalQuestions.set((result as any).id, { ...questionData });
        }
      }

      Swal.fire('Success', 'Question saved successfully!', 'success');
      this.loadQuestions();
    } catch (error) {
      Swal.fire('Error', 'Failed to save question. Please try again.', 'error');
    }
  }

  async saveAll() {
    try {
      const questions = this.questionsArray.value;
      const updates: Promise<any>[] = [];
      const creates: Promise<any>[] = [];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionData: Question = {
          text: question.text,
          type: question.type,
          correctAnswer: question.correctAnswer,
          quizId: this.quizId,
          options: question.options
        };

        if (question.id) {
          if (this.isQuestionModified(question)) {
            updates.push(this.roomsService.updateQuestion(question.id, questionData).toPromise());
          }
        } else {
          creates.push(this.roomsService.addQuestions([questionData]).toPromise());
        }
      }

      await Promise.all([...updates, ...creates]);
      Swal.fire('Success', 'All questions saved successfully!', 'success');
      this.loadQuestions();
    } catch (error) {
      Swal.fire('Error', 'Failed to save questions. Please try again.', 'error');
    }
  }

  goBack() {
    window.history.back();
  }
}