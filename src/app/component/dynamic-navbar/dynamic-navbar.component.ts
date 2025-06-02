// dynamic-navbar.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../../service/auth-service.service';
import { Subscription } from 'rxjs';
import { TeacherNavbarComponent } from '../../teacher/teacher-navbar/teacher-navbar.component';
import { StudentNavbarComponent } from '../../student/student-components/student-navbar/student-navbar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dynamic-navbar',
  standalone: true,
  imports: [
    CommonModule,
    TeacherNavbarComponent,
    StudentNavbarComponent,
    NavbarComponent
  ],
  templateUrl: './dynamic-navbar.component.html',
  styleUrls: ['./dynamic-navbar.component.css']
})
// dynamic-navbar.component.ts
export class DynamicNavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userRole: string | null = null;
  private authSubscription!: Subscription;

  constructor(private authService: AuthServiceService) {}

  ngOnInit() {
    this.updateAuthState();
    this.authSubscription = this.authService.authState$.subscribe(() => {
      this.updateAuthState();
    });
  }

  private updateAuthState() {
    this.isLoggedIn = this.authService.checkToken(); // Now using public method
    this.userRole = this.authService.getCurrentUserRole();
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }
}