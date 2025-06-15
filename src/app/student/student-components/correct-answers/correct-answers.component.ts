import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomsService, Question, Quiz } from '../../../service/rooms.service';

@Component({
  selector: 'app-correct-answers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './correct-answers.component.html',
  styleUrls: ['./correct-answers.component.css']
})
export class CorrectAnswersComponent implements OnInit {
  quizId: number = 0;
  roomId: string = '';
  questions: Question[] = [];
  quiz: Quiz | null = null;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private roomsService: RoomsService) {}

  ngOnInit() {
    this.quizId = Number(this.route.snapshot.params['quizId']);
    this.roomId = this.route.snapshot.params['roomId'];
    if (!this.quizId || !this.roomId) {
      this.errorMessage = 'Invalid quiz or room.';
      this.loading = false;
      return;
    }
    this.loadQuizAndQuestions();
  }

  private loadQuizAndQuestions() {
    this.roomsService.getQuizzesByRoom(this.roomId).subscribe({
      next: (quizzes) => {
        this.quiz = quizzes.find(q => q.id === this.quizId) || null;
        if (!this.quiz) {
          this.errorMessage = 'Quiz not found.';
          this.loading = false;
          return;
        }
        this.roomsService.getQuestionsByQuiz(this.quizId).subscribe({
          next: (questions) => {
            this.questions = questions.slice(0, this.quiz?.totalQuestions || 10);
            this.loading = false;
          },
          error: () => {
            this.errorMessage = 'Failed to load questions.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load quiz.';
        this.loading = false;
      }
    });
  }
}
