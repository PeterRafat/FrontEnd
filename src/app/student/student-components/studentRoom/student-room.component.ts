import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomsService, Room } from '../../../service/rooms.service';
import { JwtService } from '../../../service/jwt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-room.component.html',
  styleUrls: ['./student-room.component.css']
})
export class StudentRoomComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  studentId: string = '';
  showModal = false;
  formdata = { roomId: '', studentId: '' };
  submit = false;
  errorMessage = '';
  loading = false;
  selectedRoomId: string = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private jwtService: JwtService,
    private router: Router,
    private roomsService: RoomsService
  ) {}
  openJoinModal(): void {
    this.formdata.roomId = '';
    this.formdata.studentId = this.studentId;
    this.submit = false;
    this.errorMessage = '';
    this.showModal = true;
  }

  closeJoinModal(): void {
    this.showModal = false;
    this.formdata.roomId = '';
    this.errorMessage = '';
    this.submit = false;
  }

  // ... (constructor remains the same)

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtService.decodeToken(token);
      this.studentId = decodedToken?.sub || '';
      if (this.studentId) {
        this.loadRooms();
      } else {
        this.errorMessage = 'Could not get student ID from token';
      }
    } else {
      this.errorMessage = 'No authentication token found';
    }
  }

  loadRooms(): void {
    // Stub: implement your logic to load rooms if needed
  }

  // ... (other methods remain the same until onSubmit)

  onSubmit(f: NgForm): void {
    this.submit = true;
    this.errorMessage = '';
    if (f.valid) {
      this.loading = true;
      // Only use roomId for navigation, studentId is available in component
      this.router.navigate(['/student/room', this.formdata.roomId, 'quizzes'], {
        state: { studentId: this.studentId }
      }).then((success: boolean) => {
        this.loading = false;
        if (!success) {
          this.errorMessage = 'Failed to navigate to quizzes page';
        }
      }).catch((err: unknown) => {
        this.loading = false;
        this.errorMessage = 'Navigation error';
        console.error('Navigation error:', err);
      });
    } else {
      this.errorMessage = 'Please enter a valid room ID.';
    }
  }

  // ... (rest of the component remains the same)
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}