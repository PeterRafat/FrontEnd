import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule,FormsModule,HttpClientModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent {
  formdata = { subject: '', password: '' };
  submit = false;
  errorMessage = '';
  loading = false; 
  
  constructor(private router: Router, private http: HttpClient) {}
  rooms= [
    { id: 1, name: 'Subject', date: '17 Sep 2024' },
    { id: 2, name: 'Subject', date: '20 Sep 2024' },
    { id: 3, name: 'Subject', date: '15 Oct 2024' }
  ];

  openQuiz(id: number) {
    console.log(`Opening quiz with ID: ${id}`);
  }

  deleteQuiz(id: number) {
    this.rooms = this.rooms.filter(room => room.id !== id);
    console.log(`Deleted quiz with ID: ${id}`);
  }

  createRoom() {
    console.log('Creating a new room...');
  }

  close() {
    console.log('Closing...');
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
  
            
            this.formdata = { subject: '', password: '' };
            f.resetForm(); 
            alert('create room successful!');
  
            
            this.router.navigate(['/home']).then(() => {
              console.log('Navigated to /createquiz');
            });
            
          },
          (error) => {
            console.error('Login error:', error);
            this.errorMessage = 'Invalid subject or password.';
            this.loading = false;
          }
        );
      } else {
        this.errorMessage = 'Please fill out the form correctly.';
      }
    }
}
