import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService, Quiz, Question, QuizResult } from '../../../service/rooms.service';
import { Subscription, interval } from 'rxjs';
import { JwtService } from '../../../service/jwt.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quiz-exam-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-exam-student.component.html',
  styleUrls: ['./quiz-exam-student.component.css']
})
export class QuizExamStudentComponent implements OnInit, OnDestroy {
  quizId: number = 0;
  roomId: string = '';
  quiz: Quiz | null = null;
  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  userAnswers: { [key: number]: string } = {};
  timeLeft: number = 0;
  timerSubscription: Subscription | null = null;
  quizCompleted: boolean = false;
  score: number = 0;
  loading: boolean = true;
  errorMessage: string = '';
  studentId: string = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private roomsService: RoomsService,
    private jwtService: JwtService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtService.decodeToken(token);
      this.studentId = decodedToken?.sub || '';
    }
    this.quizId = Number(this.route.snapshot.params['quizId']);
    this.roomId = this.route.snapshot.params['roomId'];
    if (!this.quizId || !this.roomId) {
      this.router.navigate(['/student/studentRoom']);
      return;
    }
    this.loadQuizAndQuestions();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private loadQuizAndQuestions() {
    this.loading = true;
    // First load quiz details
    this.roomsService.getQuizzesByRoom(this.roomId).subscribe({
      next: (quizzes) => {
        const foundQuiz = quizzes.find(q => q.id === this.quizId);
        if (!foundQuiz) {
          this.handleError('Quiz not found');
          return;
        }
        this.quiz = foundQuiz;
        this.timeLeft = this.quiz.duration * 60; // minutes to seconds
        this.startTimer();
        this.loadQuestions();
      },
      error: () => {
        this.handleError('Failed to load quiz details');
      }
    });
  }

  private loadQuestions() {
    this.roomsService.getQuestionsByQuiz(this.quizId).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loading = false;
      },
      error: () => {
        this.handleError('Failed to load questions');
      }
    });
  }

  private startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.completeQuiz();
      }
    });
  }

  private handleError(message: string) {
    this.errorMessage = message;
    this.loading = false;
    // Optionally, show a modal or redirect
    setTimeout(() => {
      this.router.navigate(['/student/room', this.roomId, 'quizzes']);
    }, 2000);
  }

  selectAnswer(questionId: number, answer: string) {
    this.userAnswers[questionId] = answer;
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  completeQuiz() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    // Calculate score
    this.score = 0;
    this.questions.forEach(question => {
      if (this.userAnswers[question.id!] === question.correctAnswer) {
        this.score++;
      }
    });
    this.quizCompleted = true;

    // Submit result to backend
    const result: QuizResult = {
      score: this.score,
      studentId: this.studentId,
      quizId: this.quizId
    };

    this.roomsService.submitQuizResult(result).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Quiz Completed!',
          text: `Your score: ${this.score}/${this.questions.length}`,
          confirmButtonColor: '#332588'
        }).then(() => {
          this.router.navigate(['/student/room', this.roomId, 'quizzes']);
        });
      },
      error: (error) => {
        console.error('Error submitting quiz result:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to submit quiz result. Please try again.',
          confirmButtonColor: '#332588'
        });
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
