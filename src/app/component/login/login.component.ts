import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // Import FormsModule and NgForm
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Import FormsModule for template-driven forms
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private http: HttpClient, private router: Router) { }

  onSubmit(form: NgForm) {
    // Check if the form is valid
    if (form.valid) {
      const loginData = {
        email: form.value.email,
        password: form.value.password
      };

      // Send a get request to the mock API to check login credentials
      this.http.get<any[]>('http://quizgenerator.runasp.net/Auth/login')
        .subscribe({
          next: (users: any[]) => {
            const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
            if (user) {
              // Show success alert
              Swal.fire({
                title: "Login successful!",
                text: "Welcome back!",
                icon: "success"
              });
              // Redirect to the home page or any other page
              this.router.navigateByUrl("/home");
            } else {
              // Show error alert if credentials are invalid
              Swal.fire({
                icon: "error",
                title: "Invalid credentials",
                text: "Please check your email and password.",
              });
            }
          },
          error: (error) => {
            // Show error alert
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Something went wrong!",
              footer: '<a href="#">Why do I have this issue?</a>'
            });
          }
        });
    } else {
      // Show alert if the form is invalid
      Swal.fire({
        icon: "error",
        title: "Form is invalid",
        text: "Please fill in all required fields correctly.",
      });
    }
  }
}