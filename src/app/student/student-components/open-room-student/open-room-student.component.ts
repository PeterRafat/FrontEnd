import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService, Quiz } from '../../../service/rooms.service';
import { JwtService } from '../../../service/jwt.service';

@Component({
  selector: 'app-open-room-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './open-room-student.component.html',
  styleUrls: ['./open-room-student.component.css']
})
export class OpenRoomStudentComponent implements OnInit {
  navigateToQuiz(quizId: number): void {
    // Navigate to the quiz exam page for the student
    this.router.navigate([`/student/room/${this.roomId}/quiz/${quizId}/exam`]);
  }

  goBack(): void {
    // Navigate back to the student room list
    this.router.navigate(['/student/studentRoom']);
  }
  roomId: string = '';
  quizzes: Quiz[] = [];
  loading = false;
  errorMessage = '';
  studentId: string = ''; // Keep studentId available

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsService,
    private jwtService: JwtService
  ) {}

  ngOnInit(): void {
    // Try to get studentId from token first
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtService.decodeToken(token);
      this.studentId = decodedToken?.sub || '';
      // Debug: log the decoded token and role
      console.log('Decoded token:', decodedToken);
      console.log('Role in token:', decodedToken?.Role);
    }

    // Fallback: get studentId from navigation state if not found in token
    if (!this.studentId) {
      const nav = this.router.getCurrentNavigation();
      if (nav && nav.extras && nav.extras.state && nav.extras.state['studentId']) {
        this.studentId = nav.extras.state['studentId'];
        console.log('StudentId from navigation state:', this.studentId);
      }
    }

    // Get roomId from route
    this.route.paramMap.subscribe(params => {
      this.roomId = params.get('roomId') || '';
      if (this.roomId) {
        this.loadQuizzes();
      } else {
        this.errorMessage = 'No room ID provided';
      }
    });

    // Alternative: get studentId from navigation state
    // this.studentId = this.router.getCurrentNavigation()?.extras.state?.['studentId'] || '';
  }

  loadQuizzes(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Only send roomId to the API
    this.roomsService.getQuizzesByRoom(this.roomId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        this.loading = false;
        
        // StudentId is available here if needed for other purposes
        console.log('Student ID:', this.studentId); 
      },
      error: (error) => {
        this.errorMessage = 'Failed to load quizzes for this room';
        this.loading = false;
        console.error('Error loading quizzes:', error);
      }
    });
  }

  // ... (rest of the component remains the same)
}