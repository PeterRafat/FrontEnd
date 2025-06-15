import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomsService } from '../../../service/rooms.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quiz-ai-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-ai-student.component.html',
  styleUrls: ['./quiz-ai-student.component.css']
})
export class QuizAiStudentComponent {
  public quizData = {
    title: '',
    description: '',
    totalQuestions: 0,
    startAt: '',
    endAt: '',
    duration: 0,
    ai: true
  };
  public loading = false;
  public errorMessage = '';
  private defaultRoomId = 'fb13d1e7-e9af-4704-8544-e01cc0140d6c';

  constructor(
    private roomsService: RoomsService,
    public router: Router,
    private http: HttpClient
  ) {}

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Format dates to ISO string and ensure all fields match the API schema
    const formattedData = {
      title: this.quizData.title,
      description: this.quizData.description,
      totalQuestions: Number(this.quizData.totalQuestions),
      startAt: new Date(this.quizData.startAt).toISOString(),
      endAt: new Date(this.quizData.endAt).toISOString(),
      duration: Number(this.quizData.duration),
      ai: true
    };

    console.log('Submitting quiz data:', formattedData);

    this.roomsService.createQuiz(this.defaultRoomId, formattedData).subscribe({
      next: (response: any) => {
        this.loading = false;
        Swal.fire('Success', 'Quiz created successfully!', 'success').then(() => {
          this.router.navigate(['/student/createStudentQuiz']);
        });
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = 'Failed to create quiz.';
        Swal.fire('Error', this.errorMessage, 'error');
      }
    });
  }

  private validateForm(): boolean {
    if (!this.quizData.title || !this.quizData.description || !this.quizData.startAt || !this.quizData.endAt) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    if (this.quizData.totalQuestions <= 0) {
      this.errorMessage = 'Total questions must be greater than 0';
      return false;
    }

    if (this.quizData.duration <= 0) {
      this.errorMessage = 'Duration must be greater than 0';
      return false;
    }

    const startDate = new Date(this.quizData.startAt);
    const endDate = new Date(this.quizData.endAt);
    const now = new Date();

    if (startDate < now) {
      this.errorMessage = 'Start date must be in the future';
      return false;
    }

    if (endDate <= startDate) {
      this.errorMessage = 'End date must be after start date';
      return false;
    }

    return true;
  }
}
