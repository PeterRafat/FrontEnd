import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-manually',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './quiz-manually.component.html',
  styleUrl: './quiz-manually.component.css'
})
export class QuizManuallyComponent {
  quizForm: FormGroup;
  editingQuestionIndex: number | null = null; 

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

  addQuestion() {
    const questionGroup = this.fb.group({
      questionText: '',
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
      text: '',
      isCorrect: false
    });
  }

  editQuestion(questionIndex: number) {
    if (this.editingQuestionIndex === questionIndex) {
      console.log(`end edit : ${questionIndex}`);
      this.editingQuestionIndex = null; 
    } else {
      console.log(`start edit: ${questionIndex}`);
      this.editingQuestionIndex = questionIndex; 
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
}
