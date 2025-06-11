import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomsService, Quiz } from '../../service/rooms.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quiz-manually',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './quiz-manually.component.html',
  styleUrl: './quiz-manually.component.css'
})
export class QuizManuallyComponent implements OnInit {
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
    // Get roomId from route parameters
    this.route.paramMap.subscribe(params => {
      const roomId = params.get('roomId');
      console.log('Received roomId from route params:', roomId);
      if (roomId) {
        this.roomId = roomId;
        console.log('RoomId set successfully:', this.roomId);
      } else {
        console.error('No roomId found in route params');
        // Show error if no roomId found
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
      console.log('Form data:', formData);
      console.log('Duration time value:', formData.durationTime);
      console.log('Duration time type:', typeof formData.durationTime);
      
      // Prepare quiz data for API - only send what backend expects
      const quizData = {
        title: formData.quizName,
        description: formData.quizDescription,
        totalQuestions: parseInt(formData.totalQuestions),
        startAt: new Date(formData.startTime).toISOString(),
        endAt: new Date(formData.endTime).toISOString(),
        duration: parseInt(formData.durationTime),
        ai: false
      };

      console.log('Quiz data to send:', quizData);

      this.roomsService.createQuiz(this.roomId, quizData).subscribe({
        next: (response: Quiz) => {
          this.loading = false;
          console.log('Quiz created successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'Quiz Created!',
            text: 'Your quiz has been created successfully.',
            confirmButtonColor: '#332588'
          }).then(() => {
            // Navigate back to openquiz component
            this.router.navigate(['/teacher/openquiz', this.roomId]);
          });
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error creating quiz:', error);
          console.error('Error details:', error.error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          
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
      // Mark all fields as touched to show validation errors
      Object.keys(this.quizForm.controls).forEach(key => {
        const control = this.quizForm.get(key);
        control?.markAsTouched();
      });
      
      console.log('Form validation errors:', this.quizForm.errors);
      console.log('Form controls:', this.quizForm.controls);
      
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
