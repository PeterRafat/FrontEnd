import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomsService } from '../../service/rooms.service';
import { JwtService } from '../../service/jwt.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: any[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  teacherId: string = '';
  private subscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private roomsService: RoomsService,
    public jwtService: JwtService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.validateTokenAndLoadData();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

    this.loadRooms();
    
    // Subscribe to room updates
    this.subscription.add(
      this.roomsService.rooms$.subscribe(rooms => {
        this.rooms = rooms;
      })
    );
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

  private loadRooms() {
    this.loading = true;
    this.roomsService.getTeacherRooms(this.teacherId).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.errorMessage = 'Failed to load rooms. Please try again.';
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

  createRoom(name: string) {
    this.loading = true;
    this.roomsService.createRoom(name, this.teacherId).subscribe({
      next: (res:any) => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Room created successfully!',
          confirmButtonColor: '#332588'
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating room:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to create room. Please try again.',
          confirmButtonColor: '#332588'
        });
      }
    });
  }

  deleteRoom(roomId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#332588',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.roomsService.deleteRoom(roomId, this.teacherId).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Room has been deleted.',
              confirmButtonColor: '#332588'
            });
          },
          error: (error) => {
            this.loading = false;
            console.error('Error deleting room:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'Failed to delete room. Please try again.',
              confirmButtonColor: '#332588'
            });
          }
        });
      }
    });
  }

  goToOpenQuiz(roomId: string) {
    this.router.navigate(['/teacher/openquiz', roomId]);
  }
}
