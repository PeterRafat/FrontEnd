import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quiz-manually',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './quiz-manually.component.html',
  styleUrl: './quiz-manually.component.css'
})
export class QuizManuallyComponent {
  quizForm: FormGroup;
  editingQuestionIndex: number | null = null; 
  saveSuccess = false
  constructor(private fb: FormBuilder) {
    this.quizForm = this.fb.group({
      quizName: '',
      startTime: '',
      endTime: '',
      duration: '',
      questions: this.fb.array([])
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getOptions(question: any): FormArray {
    return question.get('options') as FormArray;
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index); 
  }
  

  addQuestion() {
    const questionGroup = this.fb.group({
      questionText: [{ value: '', disabled: true }],
      options: this.fb.array([
        this.createOption(),
        this.createOption(),
        this.createOption(),
        this.createOption()
      ])
    });
  
    this.questions.push(questionGroup);
  }
  

  createOption(): FormGroup {
    return this.fb.group({
      text: [{ value: '', disabled: true }],
      isCorrect: [{ value: false, disabled: true }]
    });
  }
  

  editQuestion(questionIndex: number) {
    const questionFormGroup = this.questions.at(questionIndex);
  
    if (this.editingQuestionIndex === questionIndex) {
      console.log(`end edit : ${questionIndex}`);
      this.editingQuestionIndex = null;
  
      
      questionFormGroup.get('questionText')?.disable();
  
      
      const options = questionFormGroup.get('options') as FormArray;
      options.controls.forEach(option => {
        option.get('text')?.disable();
        option.get('isCorrect')?.disable();
      });
  
    } else {
      console.log(`start edit: ${questionIndex}`);
      this.editingQuestionIndex = questionIndex;
  
      
      questionFormGroup.get('questionText')?.enable();
  
      
      const options = questionFormGroup.get('options') as FormArray;
      options.controls.forEach(option => {
        option.get('text')?.enable();
        option.get('isCorrect')?.enable();
      });
    }
  }


  deleteQuestion(index: number) {
    this.questions.removeAt(index);
    if (this.editingQuestionIndex === index) {
      this.editingQuestionIndex = null;
    }
  }
  
  exitQuiz() {
    console.log("exited successfully"); 
    
  }

  saveQuiz() {
    if (this.quizForm.valid) {
      const quizData = this.quizForm.getRawValue();
      console.log('Quiz saved:', quizData);
  
      
      Swal.fire({
        title: 'Quiz Saved!',
        text: 'Your quiz and options have been saved successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
  
      
  
    } else {
      
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill in all required fields correctly.'
      });
    }
  }
  
}
