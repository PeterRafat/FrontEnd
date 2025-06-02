import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../service/auth-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {
    
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      const { email, password } = form.value;
      
      this.authService.postLogin({ email, password }).subscribe({
        next: (res: any) => {
          // Token storage and authState update is now handled in AuthService
          const role = this.authService.getCurrentUserRole();
          
          Swal.fire({
            title: 'Login Successful',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate([role === 'teacher' ? '/teacher' : '/student']);
          });
        },
        error: (err) => {
          let errorMessage = 'Login failed. Please try again.';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 401) {
            errorMessage = 'Invalid email or password';
          }
          
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
    }
  }
}