import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService, Quiz, QuizResult } from '../../../service/rooms.service';
import { JwtService } from '../../../service/jwt.service';

@Component({
  selector: 'app-open-room-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-room-student.component.html',
  styleUrls: ['./open-room-student.component.css']
})
export class OpenRoomStudentComponent implements OnInit {
  roomId: string = '';
  quizzes: Quiz[] = [];
  quizResults: { [key: number]: QuizResult } = {};
  loading = false;
  errorMessage = '';
  studentId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsService,
    private jwtService: JwtService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtService.decodeToken(token);
      this.studentId = decodedToken?.sub || '';
    }
    this.roomId = this.route.snapshot.params['roomId'];
    if (this.roomId) {
      this.loadQuizzes();
    }
  }

  loadQuizzes(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.roomsService.getQuizzesByRoom(this.roomId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        // Load results for each quiz
        quizzes.forEach(quiz => {
          this.loadQuizResult(quiz.id);
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load quizzes for this room';
        this.loading = false;
        console.error('Error loading quizzes:', error);
      }
    });
  }

  loadQuizResult(quizId: number): void {
    this.roomsService.getQuizResult(quizId, this.studentId).subscribe({
      next: (result) => {
        if (result && result.score !== undefined) {
          this.quizResults[quizId] = result;
        }
      },
      error: (error) => {
        // Only log the error, don't show it to the user
        // This is expected for quizzes that haven't been taken yet
        console.log(`No result found for quiz ${quizId}`);
      }
    });
  }

  navigateToQuiz(quizId: number): void {
    // Only allow navigation if the quiz hasn't been completed
    if (!this.quizResults[quizId]) {
      this.router.navigate([`/student/room/${this.roomId}/quiz/${quizId}/exam`]);
    }
  }

  isQuizCompleted(quizId: number): boolean {
    return !!this.quizResults[quizId] && this.quizResults[quizId].score !== undefined;
  }

  getCompletedQuizzesCount(): number {
    return Object.values(this.quizResults).filter(result => result.score !== undefined).length;
  }

  getPendingQuizzesCount(): number {
    return this.quizzes.length - this.getCompletedQuizzesCount();
  }

  getAverageScore(): number {
    const completedQuizzes = Object.values(this.quizResults).filter(result => result.score !== undefined);
    if (completedQuizzes.length === 0) return 0;

    const totalScore = completedQuizzes.reduce((sum, result) => {
      const quiz = this.quizzes.find(q => q.id === result.quizId);
      if (!quiz) return sum;
      return sum + (result.score / quiz.totalQuestions) * 100;
    }, 0);

    return Math.round(totalScore / completedQuizzes.length);
  }

  goBack(): void {
    this.router.navigate(['/student/studentRoom']);
  }
}