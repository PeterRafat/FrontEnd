import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule], // Import FormsModule for template-driven forms
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: NgForm) {
    // Check if the form is valid
    if (form.valid) {
      // Create a user object with only the required fields
      const user = {
        email: form.value.email,
        password: form.value.password,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
      };
      console.log(user);
      // Send a POST request to the backend API
      this.http.post('http://quizgenerator.runasp.net/Auth/register', user).subscribe({
        next: (response: any) => {
          // Show success alert
          Swal.fire({
            title: 'Registration successful!',
            text: 'You have been successfully registered.',
            icon: 'success',
          });
          // Redirect to the login page
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          // Show error alert
          Swal.fire({
            icon: 'error',
            title: 'Registration failed',
            text: error.error.message ,
            footer: '<a href="#">Why do I have this issue?</a>',
          });
        },
      });
    } else {
      // Show alert if the form is invalid
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill out all required fields correctly.',
      });
    }
  }
}

