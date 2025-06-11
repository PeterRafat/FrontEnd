import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService, Question, QuestionOption } from '../../service/rooms.service';
import Swal from 'sweetalert2';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-edit-question',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-edit-question.component.html',
  styleUrls: ['./add-edit-question.component.css']
})
export class AddEditQuestionComponent implements OnInit {
  quizId: number = 0;
  roomId: string = '';
  questions: Question[] = [];
  questionForm: FormGroup;
  loading: boolean = true;
  errorMessage: string = '';
  originalQuestions: Map<number, Question> = new Map();
  isEditMode: boolean = false;
  selectedQuestions: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    
    if (!this.quizId || !this.roomId) {
      this.router.navigate(['/teacher/rooms']);
      return;
    }
    this.loadQuestions();
  }

  private loadQuestions() {
    this.loading = true;
    this.roomsService.getQuestionsByQuiz(this.quizId).subscribe({
      next: (questions) => {
        this.questions = questions;
        // Store original questions for comparison
        questions.forEach(q => {
          if (q.id) {
            this.originalQuestions.set(q.id, { ...q });
          }
        });
        this.initializeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.errorMessage = 'Failed to load questions. Please try again.';
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
          confirmButtonColor: '#332588'
        });
      }
    });
  }

  private initializeForm() {
    const questionsArray = this.questionForm.get('questions') as FormArray;
    questionsArray.clear();

    this.questions.forEach(question => {
      questionsArray.push(this.createQuestionFormGroup(question));
    });
  }

  private createQuestionFormGroup(question?: Question): FormGroup {
    return this.fb.group({
      id: [question?.id],
      text: [question?.text || '', Validators.required],
      type: [question?.type || 1, Validators.required],
      correctAnswer: [question?.correctAnswer || '', Validators.required],
      quizId: [this.quizId],
      options: this.fb.array(
        (question?.options || []).map(option => 
          this.fb.group({
            text: [option.text, Validators.required]
          })
        )
      )
    });
  }

  get questionsArray() {
    return this.questionForm.get('questions') as FormArray;
  }

  getOptionsArray(questionIndex: number): FormArray {
    return this.questionsArray.at(questionIndex).get('options') as FormArray;
  }

  onQuestionTypeChange(questionIndex: number) {
    const question = this.questionsArray.at(questionIndex);
    const type = question.get('type')?.value;
    const options = question.get('options') as FormArray;
    
    // Clear existing options
    while (options.length) {
      options.removeAt(0);
    }

    if (type === 2) { // True/False
      // Add True and False options
      options.push(this.fb.group({ text: ['True', Validators.required] }));
      options.push(this.fb.group({ text: ['False', Validators.required] }));
      // Set default correct answer to True
      question.patchValue({ correctAnswer: 'True' });
    }
  }

  addNewQuestion() {
    const questionsArray = this.questionForm.get('questions') as FormArray;
    const newQuestion = this.createQuestionFormGroup();
    questionsArray.push(newQuestion);
    // Initialize options based on type
    this.onQuestionTypeChange(questionsArray.length - 1);
  }

  removeQuestion(index: number) {
    const question = this.questionsArray.at(index);
    const questionId = question.get('id')?.value;

    if (questionId) {
      // If it's an existing question, show confirmation and delete from backend
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this question?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.roomsService.deleteQuestion(questionId).subscribe({
            next: () => {
              // Remove from form array
              this.questionsArray.removeAt(index);
              // Remove from original questions map
              this.originalQuestions.delete(questionId);
              
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Question has been deleted.',
                confirmButtonColor: '#332588'
              });

              // Reload questions to ensure we have the latest data
              this.loadQuestions();
            },
            error: (error: any) => {
              console.error('Error deleting question:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete question. Please try again.',
                confirmButtonColor: '#332588'
              });
            }
          });
        }
      });
    } else {
      // If it's a new question (no ID), just remove from form array
      this.questionsArray.removeAt(index);
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
    options.removeAt(optionIndex);
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

  onSubmit() {
    if (this.questionForm.valid) {
      const formQuestions = this.questionForm.value.questions;
      
      // Only collect new questions (those without an ID)
      const newQuestions: Question[] = formQuestions
        .filter((q: any) => !q.id)
        .map((q: any) => ({
          text: q.text,
          type: Number(q.type),
          correctAnswer: q.correctAnswer,
          quizId: this.quizId,
          options: q.type === 2 ? 
            [{ text: 'True' }, { text: 'False' }] : 
            q.options
        }));

      if (newQuestions.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No New Questions',
          text: 'There are no new questions to save.',
          confirmButtonColor: '#332588'
        });
        return;
      }

      this.roomsService.addQuestions(newQuestions).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'New questions added successfully!',
            confirmButtonColor: '#332588'
          });
          
          // Clear the form array
          this.questionsArray.clear();
          
          // Reload questions to get the new IDs and latest data
          this.loadQuestions();
        },
        error: (error: any) => {
          console.error('Error adding new questions:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to add new questions. Please try again.',
            confirmButtonColor: '#332588'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        confirmButtonColor: '#332588'
      });
    }
  }

  goBack() {
    this.router.navigate(['/teacher/openquiz', this.roomId]);
  }

  saveSingleQuestion(index: number) {
    const question = this.questionsArray.at(index);
    if (question.valid) {
      const questionData = {
        id: question.get('id')?.value,
        text: question.get('text')?.value,
        type: Number(question.get('type')?.value),
        correctAnswer: question.get('correctAnswer')?.value,
        quizId: this.quizId,
        options: question.get('type')?.value === 2 ? 
          [{ text: 'True' }, { text: 'False' }] : 
          question.get('options')?.value
      };

      this.roomsService.updateQuestion(questionData.id, questionData).subscribe({
        next: () => {
          // Update the original question in our map
          this.originalQuestions.set(questionData.id, { ...questionData });
          
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Question updated successfully!',
            confirmButtonColor: '#332588'
          });
          
          // Reload questions to ensure we have the latest data
          this.loadQuestions();
        },
        error: (error: any) => {
          console.error('Error updating question:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update question. Please try again.',
            confirmButtonColor: '#332588'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields correctly.',
        confirmButtonColor: '#332588'
      });
    }
  }

  toggleQuestionSelection(index: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedQuestions.push(index);
    } else {
      const position = this.selectedQuestions.indexOf(index);
      if (position > -1) {
        this.selectedQuestions.splice(position, 1);
      }
    }
  }

  deleteSelectedQuestions() {
    if (this.selectedQuestions.length === 0) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete ${this.selectedQuestions.length} selected question(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Sort indices in descending order to avoid index shifting issues
        const sortedIndices = [...this.selectedQuestions].sort((a, b) => b - a);
        
        // Create an array of promises for delete operations
        const deletePromises = sortedIndices.map(index => {
          const question = this.questionsArray.at(index);
          const questionId = question.get('id')?.value;
          
          if (questionId) {
            return this.roomsService.deleteQuestion(questionId).toPromise();
          } else {
            // For new questions, just remove from form array
            this.questionsArray.removeAt(index);
            return Promise.resolve();
          }
        });

        // Execute all delete operations
        Promise.all(deletePromises)
          .then(() => {
            // Clear selection
            this.selectedQuestions = [];
            
            // Reload questions to ensure we have the latest data
            this.loadQuestions();
            
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Selected questions have been deleted.',
              confirmButtonColor: '#332588'
            });
          })
          .catch(error => {
            console.error('Error deleting questions:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete some questions. Please try again.',
              confirmButtonColor: '#332588'
            });
          });
      }
    });
  }
}
