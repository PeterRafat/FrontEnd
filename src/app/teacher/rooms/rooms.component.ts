import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {  Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  goToOpenQuiz(): void {
    this.router.navigate(['/openquiz']);
  }
  

  deleteQuiz(id: number) {
    this.rooms = this.rooms.filter(room => room.id !== id);
    console.log(`Deleted quiz with ID: ${id}`);
  }

  createRoom() {
    console.log('Creating a new room...');
  }

  close() : void {
    this.router.navigate(['/quizManually']);
  
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const room = {
        subject: form.value.subject,
        password: form.value.password
      };
  
      console.log(room);
  
      this.http.post('http://quizgenerator.runasp.net/Room/create', room).subscribe({
        next: (response: any) => {
          Swal.fire({
            title: 'Room created!',
            text: 'Your room has been created successfully.',
            icon: 'success',
          });
          this.router.navigateByUrl('/rooms'); 
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Room creation failed',
            text: error.error.message || 'Something went wrong.',
            footer: '<a href="#">Why do I have this issue?</a>',
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill out all required fields correctly.',
      });
    }
  }
  
}
