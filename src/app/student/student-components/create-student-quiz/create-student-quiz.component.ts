import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IquizStudentDetails } from '../../../models/iquiz-student-details';

export interface FilePreview {
  name: string;
  url: string; // URL for preview (e.g., PDF icon or thumbnail)
}

@Component({
  selector: 'app-create-student-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-student-quiz.component.html',
  styleUrls: ['./create-student-quiz.component.css']
})
export class CreateStudentQuizComponent {
  // Define the quiz object using the Quiz interface
  quiz: IquizStudentDetails = {
    quizName: '',
    startTime: '',
    endTime: '',
    difficultyLevel: '',
    duration: null,
    files: []
  };

  previewFiles: FilePreview[] = []; // Store file previews

  // Handle file selection
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type === 'application/pdf') { // Only allow PDF files
          this.quiz.files.push(files[i]);
          this.previewFiles.push({
            name: files[i].name,
            url: '/photo/pdf.png' // Use a PDF icon or thumbnail
          });
        } else {
          alert('Only PDF files are allowed.');
        }
      }
    }
  }

  // Remove a file
  removeFile(index: number): void {
    this.quiz.files.splice(index, 1);
    this.previewFiles.splice(index, 1);
  }

  // Handle drag and drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files) {
      const files = event.dataTransfer.files;
      for (let i = 0; i < files.length; i++) {
        if (files[i].type === 'application/pdf') { // Only allow PDF files
          this.quiz.files.push(files[i]);
          this.previewFiles.push({
            name: files[i].name,
            url: '/photo/pdf.png' // Use a PDF icon or thumbnail
          });
        } else {
          alert('Only PDF files are allowed.');
        }
      }
    }
  }

  // Handle form submission
  onSubmit(form: any) {
    if (form.valid) {
      console.log('Form Submitted!', this.quiz);
      console.log('Selected Files:', this.quiz.files);
      // Add your logic to handle the form data (e.g., send to an API)
    } else {
      console.log('Form is invalid');
    }
  }
}