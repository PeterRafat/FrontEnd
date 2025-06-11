import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService, Quiz, Question } from '../../service/rooms.service';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-test-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-quiz.component.html',
  styleUrl: './test-quiz.component.css'
})
export class TestQuizComponent implements OnInit, OnDestroy {
  quizId: number = 0;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsService
  ) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.params['quizId']);
    if (!this.quizId) {
      this.router.navigate(['/teacher/rooms']);
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
    this.roomsService.getQuizzesByRoom(this.route.snapshot.params['roomId']).subscribe({
      next: (quizzes) => {
        console.log('Received quizzes:', quizzes); // Debug log
        console.log('Looking for quiz ID:', this.quizId); // Debug log
        const foundQuiz = quizzes.find(q => q.id === this.quizId);
        if (!foundQuiz) {
          this.handleError('Quiz not found');
          return;
        }
        this.quiz = foundQuiz;
        this.timeLeft = this.quiz.duration * 60; // Convert minutes to seconds
        this.startTimer();
        
        // Then load questions
        this.loadQuestions();
      },
      error: (error) => {
        console.error('Error loading quizzes:', error); // Debug log
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
      error: (error) => {
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
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#332588'
    }).then(() => {
      this.router.navigate(['/teacher/rooms']);
    });
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
    
    // Show results
    Swal.fire({
      title: 'Quiz Completed!',
      html: `
        <div class="text-center">
          <h3>Your Score: ${this.score}/${this.questions.length}</h3>
          <p>Percentage: ${((this.score / this.questions.length) * 100).toFixed(2)}%</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#332588'
    }).then(() => {
      this.router.navigate(['/teacher/openquiz', this.route.snapshot.params['roomId']]);
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
