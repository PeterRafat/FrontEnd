import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent {
  formData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onSubmit(form: NgForm) {
    // نعلم إن المستخدم حاول يقدّم الفورم علشان الرسائل تظهر
    form.form.markAllAsTouched();

    if (form.valid && this.formData.password === this.formData.confirmPassword) {
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Your account settings have been saved successfully.',
      });
    } else if (this.formData.password !== this.formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match. Please try again.',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill all required fields.',
      });
    }
  }
}
