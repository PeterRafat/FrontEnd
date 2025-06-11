import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService } from '../../service/rooms.service';
import Swal from 'sweetalert2';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
@Component({
  selector: 'app-quiz-ai',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './quiz-ai.component.html',
  styleUrl: './quiz-ai.component.css'
})
export class QuizAiComponent implements OnInit {
  quizForm: FormGroup;
  roomId: string = '';
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private roomsService: RoomsService
  ) {
    this.quizForm = this.fb.group({
      quizName: ['', [Validators.required]],
      quizDescription: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      durationTime: ['', [Validators.required, Validators.min(1)]],
      totalQuestions: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const roomId = params.get('roomId');
      if (roomId) {
        this.roomId = roomId;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Room ID not found. Please go back and try again.',
          confirmButtonColor: '#332588'
        }).then(() => {
          this.router.navigate(['/teacher/rooms']);
        });
      }
    });
  }

  createQuiz() {
    if (this.quizForm.valid) {
      this.loading = true;
      const formData = this.quizForm.value;
      const quizData = {
        title: formData.quizName,
        description: formData.quizDescription,
        totalQuestions: parseInt(formData.totalQuestions),
        startAt: new Date(formData.startTime).toISOString(),
        endAt: new Date(formData.endTime).toISOString(),
        duration: parseInt(formData.durationTime),
        ai: true
      };
      this.roomsService.createQuiz(this.roomId, quizData).subscribe({
        next: () => {
          this.loading = false;
          Swal.fire({
            icon: 'success',
            title: 'Quiz Created!',
            text: 'Your AI quiz has been created successfully.',
            confirmButtonColor: '#332588'
          }).then(() => {
            this.router.navigate(['/teacher/openquiz', this.roomId]);
          });
        },
        error: (error: any) => {
          this.loading = false;
          let errorMessage = 'Failed to create quiz. Please try again.';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonColor: '#332588'
          });
        }
      });
    } else {
      Object.keys(this.quizForm.controls).forEach(key => {
        const control = this.quizForm.get(key);
        control?.markAsTouched();
      });
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill in all required fields correctly.',
        confirmButtonColor: '#332588'
      });
    }
  }

  goBack() {
    this.router.navigate(['/teacher/openquiz', this.roomId]);
  }
}
