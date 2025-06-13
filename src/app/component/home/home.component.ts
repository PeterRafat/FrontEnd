import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthServiceService } from '../../service/auth-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isLoggedIn = false;

  constructor(private authService: AuthServiceService) {
    this.authService.authState$.subscribe(state => {
      this.isLoggedIn = state;
    });
  }
}
