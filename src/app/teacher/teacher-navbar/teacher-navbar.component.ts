import { Component } from '@angular/core';
import { AuthServiceService } from '../../service/auth-service.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './teacher-navbar.component.html',
  styleUrls: ['./teacher-navbar.component.css']
})
export class TeacherNavbarComponent {
  constructor(private authService: AuthServiceService) {}

  logout() {
    this.authService.logout();
  }
}