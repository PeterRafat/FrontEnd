import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomsService, Quiz } from '../../../service/rooms.service';
import { JwtService } from '../../../service/jwt.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-student-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-student-quiz.component.html',
  styleUrls: ['./create-student-quiz.component.css']
})
export class CreateStudentQuizComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = false;
  errorMessage = '';
  defaultRoomId = 'fb13d1e7-e9af-4704-8544-e01cc0140d6c';
  quizResults: { [quizId: number]: any } = {};
  studentId: string = '';

  constructor(
    private roomsService: RoomsService,
    private router: Router,
    private jwtService: JwtService
  ) {}

  ngOnInit() {
    // Extract studentId from JWT
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = this.jwtService.decodeToken(token);
      this.studentId = decoded?.nameid || decoded?.sub || '';
    }
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.loading = true;
    this.roomsService.getQuizzesByRoom(this.defaultRoomId).subscribe({
      next: (quizzes: any) => {
        this.quizzes = quizzes;
        this.loading = false;
        // Fetch results for each quiz
        this.quizzes.forEach(q => {
          this.roomsService.getQuizResult(q.id, this.studentId).subscribe(result => {
            this.quizResults[q.id] = result;
          });
        });
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load quizzes';
        this.loading = false;
        console.error('Error loading quizzes:', error);
      }
    });
  }

  navigateToCreateQuizWithAI() {
    this.router.navigate(['/student/quiz-ai-student']);
  }

  navigateToStudentQuizAIUpload(quizId: number) {
    this.router.navigate(['/student/add-question', quizId]);
  }

  deleteQuiz(quizId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this quiz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.roomsService.deleteQuizFromRoom(quizId, this.defaultRoomId).subscribe({
          next: () => {
            this.quizzes = this.quizzes.filter(q => q.id !== quizId);
            Swal.fire('Deleted!', 'Quiz has been deleted.', 'success');
          },
          error: (error: any) => {
            Swal.fire('Error!', 'Failed to delete quiz.', 'error');
            console.error('Error deleting quiz:', error);
          }
        });
      }
    });
  }
}