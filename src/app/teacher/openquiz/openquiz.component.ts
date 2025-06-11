import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomsService, Room, Quiz } from '../../service/rooms.service';
import { JwtService } from '../../service/jwt.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-openquiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './openquiz.component.html',
  styleUrls: ['./openquiz.component.css']
})
export class OpenquizComponent implements OnInit {
  // Route to AI question editing for AI quizzes
  editAIQuiz(quizId: number) {
    this.router.navigate([`/teacher/quiz-test-ai-teacher`, this.roomId, quizId]);
  }
  roomId: string = '';
  room: Room | null = null;
  quizzes: Quiz[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  teacherId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomsService: RoomsService,
    private jwtService: JwtService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.params['roomId'];
    if (!this.roomId) {
      this.router.navigate(['/teacher/rooms']);
      return;
    }
    this.validateTokenAndLoadData();
  }

  private validateTokenAndLoadData() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.handleAuthError('No authentication token found');
      return;
    }

    if (this.jwtService.isTokenExpired(token)) {
      this.handleAuthError('Your session has expired. Please login again.');
      return;
    }

    const decodedToken = this.jwtService.decodeToken(token);
    if (!decodedToken) {
      this.handleAuthError('Failed to decode token');
      return;
    }

    this.teacherId = decodedToken.id || decodedToken.sub || decodedToken.userId;
    if (!this.teacherId) {
      this.handleAuthError('No teacher ID found in token');
      return;
    }

    this.loadRoomAndQuizzes();
  }

  private handleAuthError(message: string) {
    console.error('Authentication error:', message);
    Swal.fire({
      icon: 'error',
      title: 'Authentication Error',
      text: message,
      confirmButtonColor: '#332588'
    }).then(() => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    });
  }

  private loadRoomAndQuizzes() {
    this.loading = true;
    
    // First load the room details
    this.roomsService.getTeacherRooms(this.teacherId).subscribe({
      next: (rooms) => {
        const foundRoom = rooms.find(r => r.id === this.roomId);
        if (!foundRoom) {
          Swal.fire({
            icon: 'error',
            title: 'Room Not Found',
            text: 'The requested room could not be found.',
            confirmButtonColor: '#332588'
          });
          this.router.navigate(['/teacher/rooms']);
          return;
        }
        this.room = foundRoom;
        
        // Then load quizzes for this room
        this.loadQuizzes();
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.errorMessage = 'Failed to load room data. Please try again.';
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
          confirmButtonColor: '#332588'
        });
      }
    });
  }

  private loadQuizzes() {
    this.roomsService.getQuizzesByRoom(this.roomId).subscribe({
      next: (quizzes) => {
        console.log('Quizzes received from backend:', quizzes);
        this.quizzes = quizzes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.errorMessage = 'Failed to load quizzes. Please try again.';
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage,
          confirmButtonColor: '#332588'
        });
      }
    });
  }

  createManualQuiz() {
    console.log('Creating manual quiz for roomId:', this.roomId);
    // Navigate to quiz creation page with roomId as route parameter
    this.router.navigate(['/teacher/quizManually', this.roomId]);
  }

  createQuizWithAI() {
    // Navigate to quiz-ai creation page with roomId as route parameter
    this.router.navigate(['/teacher/quiz-ai', this.roomId]);
  }

  createQuizViaAPI(quizData: Partial<Quiz>) {
    this.loading = true;
    this.roomsService.createQuiz(this.roomId, quizData).subscribe({
      next: (response: Quiz) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Quiz Created',
          text: 'Quiz has been created successfully!',
          confirmButtonColor: '#332588'
        });
        // Reload quizzes to show the new one
        this.loadQuizzes();
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error creating quiz:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create quiz. Please try again.',
          confirmButtonColor: '#332588'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/teacher/rooms']);
  }

  openQuiz(quizId: number) {
    this.router.navigate(['/teacher/test-quiz', this.roomId, quizId]);
  }

  deleteQuiz(quizId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this quiz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.roomsService.deleteQuizFromRoom(quizId, this.roomId).subscribe({
          next: () => {
            this.quizzes = this.quizzes.filter(q => +q.id !== quizId);
            Swal.fire('Deleted!', 'The quiz has been deleted.', 'success');
          },
          error: () => {
            Swal.fire('Failed!', 'Failed to delete the quiz. Please try again.', 'error');
          }
        });
      }
    });
  }

  editQuiz(quizId: number) {
    this.router.navigate(['/teacher/edit-questions', this.roomId, quizId]);
  }
}