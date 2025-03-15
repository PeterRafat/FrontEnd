import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./component/navbar/navbar.component";
import { RegisterComponent } from './component/register/register.component';
import { CreateStudentQuizComponent } from "./student/student-components/create-student-quiz/create-student-quiz.component";

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, RouterOutlet, CreateStudentQuizComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gradProject';
}
