import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-quizes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './student-quizes.component.html',
  styleUrls: ['./student-quizes.component.css']
})
export class StudentQuizesComponent {
  formdata = { ID: '', password: '' };
  submit = false;
  errorMessage = '';
  loading = false;

  constructor(private router: Router, private http: HttpClient) {}

  rooms = [
    { id: 1, name: 'Network', opendate: 'Sunday, 17 September 2024', closedate:'Monday, 18 September 2024'},
    { id: 2, name: 'Math', opendate: 'Sunday, 20 September 2024', closedate:'Tuesday, 22 September 2024' },
    { id: 3, name: 'English', opendate: 'Saturday, 15 October 2024', closedate:'Sunday, 1 November 2024' }
  ];

  openQuiz(id: number) {
    console.log(`Opening quiz with ID: ${id}`);
  }

  goToAttempt(id: number) {
    console.log(`Attempting quiz with ID: ${id}`);
    this.router.navigate(['/quiz-attempt', id]);
  }

  goToContinue(id: number) {
    console.log(`Continuing quiz with ID: ${id}`);
    this.router.navigate(['/quiz-continue', id]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
