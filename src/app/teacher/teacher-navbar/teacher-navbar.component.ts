import { Component } from '@angular/core';
import { AuthServiceService } from '../../service/auth-service.service';

@Component({
  selector: 'app-teacher-navbar',
  standalone: true,
  imports: [],
  templateUrl: './teacher-navbar.component.html',
  styleUrl: './teacher-navbar.component.css'
})
export class TeacherNavbarComponent {
  constructor(private authService: AuthServiceService) {}

  logout() {
    this.authService.logout();
  }
}