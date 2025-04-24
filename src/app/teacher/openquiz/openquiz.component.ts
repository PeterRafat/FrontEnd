import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-openquiz',
  imports: [CommonModule],
  templateUrl: './openquiz.component.html',
  styleUrl: './openquiz.component.css'
})
export class OpenquizComponent {
  subjectName = 'Mathematics ';
  userId = '12345';
  password = '******';
  quizzes = [
    { name: 'Quiz 1', start: '10am', end: '10:30am', status: 'Close' },
    { name: 'Quiz 2', start: '12pm', end: '12:35pm', status: 'Not Start Yet' },
    { name: 'Quiz 3', start: '10am', end: '10:30am', status: 'Close' }
  ];
}
