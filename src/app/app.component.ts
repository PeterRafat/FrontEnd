import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicNavbarComponent } from './component/dynamic-navbar/dynamic-navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,DynamicNavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gradProject';
}
