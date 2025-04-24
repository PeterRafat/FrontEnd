import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-student-quizes',
  imports: [],
  templateUrl: './student-quizes.component.html',
  styleUrl: './student-quizes.component.css'
})
export class StudentQuizesComponent {
  formdata = { subject: '', password: '', ID: '' };
  submit = false;
  errorMessage = '';
  loading = false;

  constructor(private router: Router, private http: HttpClient) {}
  rooms= [
    { id: 1, name: 'Subject', opendate: 'Sunday, 17 September 2024', closedate:'Monday, 18 September 2024'},
    { id: 2, name: 'Subject', opendate: 'Sunday, 20 September 2024', closedate:'Tuseday, 22 September 2024' },
    { id: 3, name: 'Subject', opendate: 'saturday, 15 October 2024', closedate:'Sunday, 1 November 2024' }
  ];

  openQuiz(id: number) {
    console.log(`Opening quiz with ID: ${id}`);
  }

  leaveQuiz(id: number) {
    this.rooms = this.rooms.filter(room => room.id !== id);
  }

  Room() {
    console.log('Joining The room..');
  }

  onSubmit(f: NgForm): void {
      this.submit = true;

      if (f.valid) {
        this.loading = true;

        const payload = {
          email: this.formdata.subject,
          password: this.formdata.password,
        };


        this.http.post('data/login.json', payload).subscribe(
          (response) => {
            console.log('Login successful:', response);
            this.loading = false;


            this.formdata = {subject: '', ID: '', password: '' };
            f.resetForm();
            alert('Join room successful!');


            this.router.navigate(['/home']).then(() => {
              console.log('Navigated to /createquiz');
            });

          },
          (error) => {
            console.error('Login error:', error);
            this.errorMessage = 'Invalid ID or password.';
            this.loading = false;
          }
        );
      } else {
        this.errorMessage = 'Please fill out the form correctly.';
      }
    }
}

