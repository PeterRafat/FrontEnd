import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../service/auth-service.service';
import { RegisterUser } from '../../models/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private router: Router, private registrationService: AuthServiceService) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      const user: RegisterUser = {
        email: form.value.email,
        password: form.value.password,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        gradLevel: form.value.gradLevel, // match HTML name="gradLevel"
        entollmentDate: new Date().toISOString(), // ISO string
      };

      console.log('Sending user:', user);

      this.registrationService.postRegister(user).subscribe({
        next: (res:any) => {
          console.log('Backend response:', res);
          Swal.fire('Success!', 'Registration successful!', 'success');
          this.router.navigateByUrl('/login');
        },
        error: (err:any) => {
          console.log('Sending user:', user);
          console.error('Registration error:', err);
          Swal.fire('Error', err.error?.message || 'Something went wrong', 'error');
        },
      });
    } else {
      Swal.fire('Invalid Form', 'Please check your inputs.', 'error');
    }
  }
}
