import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AccountSettingService, ChangePasswordData, UserProfile } from '../../../service/account-setting.service';
import { JwtService } from '../../../service/jwt.service';
import { AuthServiceService } from '../../../service/auth-service.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {
  userProfile: UserProfile = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    photoUrl: '/photo/tom.jpg'
  };
  
  displayPhotoUrl: string = '/photo/tom.jpg';
  isEditingProfile = false;
  isChangingPassword = false;
  isLoading = false;
  isUploadingPhoto = false;
  photoTimestamp = Date.now();
  hasPhotoError = false;
  userId: string | null = null;
  
  profileFormData = {
    firstName: '',
    lastName: ''
  };
  
  passwordFormData: ChangePasswordData & { confirmPassword: string } = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private accountService: AccountSettingService,
    private jwtService: JwtService,
    private authService: AuthServiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeUser();
  }

  initializeUser(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const decoded = this.jwtService.decodeToken(token);
      if (!decoded) {
        throw new Error('Invalid token format');
      }

      // Try different possible properties for user ID
      this.userId = decoded.sub || decoded.userId || decoded.id;
      if (!this.userId) {
        throw new Error('No user ID found in token');
      }

      // Load saved photo from localStorage first
      const savedPhoto = this.accountService.getPhotoFromLocalStorage(this.userId);
      if (savedPhoto) {
        this.displayPhotoUrl = savedPhoto;
        this.userProfile.photoUrl = savedPhoto;
      }

      this.loadUserProfile();
    } catch (error) {
      console.error('Error initializing user:', error);
      Swal.fire('Error', 'Please login again to continue', 'error');
      this.authService.logout();
    }
  }

  loadUserProfile(): void {
    if (!this.userId) {
      console.error('No user ID available');
      return;
    }

    this.isLoading = true;
    this.accountService.getUserProfile(this.userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (profile) => {
          try {
            // Update the user profile with the latest data
            this.userProfile = {
              ...profile,
              id: this.userId!,
              photoUrl: this.displayPhotoUrl // Keep the current photo URL
            };
            
            // Update the form data to match the latest profile
            this.profileFormData = {
              firstName: profile.firstName,
              lastName: profile.lastName
            };
            
            // Force change detection
            this.cdr.detectChanges();
            
            this.updatePhotoTimestamp();
          } catch (error) {
            console.error('Error loading profile:', error);
            this.handlePhotoError();
          }
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          Swal.fire('Error', 'Failed to load user profile. Please try again.', 'error');
        }
      });
  }

  onPhotoSelected(event: Event): void {
    if (!this.userId) {
      Swal.fire('Error', 'Please login again to continue', 'error');
      this.authService.logout();
      return;
    }

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset error state
    this.hasPhotoError = false;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select a valid image file (JPEG, PNG, etc.)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image size should be less than 5MB', 'error');
      return;
    }

    this.uploadPhoto(file);
    input.value = '';
  }

  uploadPhoto(file: File): void {
    if (!this.userId) {
      Swal.fire('Error', 'Please login again to continue', 'error');
      this.authService.logout();
      return;
    }

    this.isUploadingPhoto = true;
    this.hasPhotoError = false;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const base64Photo = e.target.result;
        
        // Validate base64 string
        if (!base64Photo.startsWith('data:image/')) {
          throw new Error('Invalid image format');
        }

        // Save to localStorage first
        this.accountService.savePhotoToLocalStorage(this.userId!, base64Photo);
        
        // Update both URLs
        this.userProfile.photoUrl = base64Photo;
        this.displayPhotoUrl = base64Photo;
        
        // Force update timestamp and change detection
        this.photoTimestamp = Date.now();
        this.cdr.detectChanges();
        
        this.isUploadingPhoto = false;
        Swal.fire({
          title: 'Success',
          text: 'Profile photo updated successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error processing photo:', error);
        this.handlePhotoError();
        Swal.fire('Error', 'Failed to process the image. Please try again.', 'error');
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      this.handlePhotoError();
      Swal.fire('Error', 'Failed to read the image file. Please try again.', 'error');
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      this.handlePhotoError();
      Swal.fire('Error', 'Failed to read the image file. Please try again.', 'error');
    }
  }

  updatePhotoTimestamp(): void {
    this.photoTimestamp = Date.now();
    this.cdr.detectChanges();
  }

  getCurrentPhotoUrl(): string {
    return `${this.displayPhotoUrl}?t=${this.photoTimestamp}`;
  }

  handlePhotoError(): void {
    this.hasPhotoError = true;
    this.displayPhotoUrl = '/photo/tom.jpg';
    this.userProfile.photoUrl = '/photo/tom.jpg';
    this.updatePhotoTimestamp();
    this.isUploadingPhoto = false;
    
    // Remove the invalid photo from localStorage
    if (this.userId) {
      this.accountService.removePhotoFromLocalStorage(this.userId);
    }
  }

  updateProfile(): void {
    if (!this.userId) {
      Swal.fire('Error', 'Please login again to continue', 'error');
      this.authService.logout();
      return;
    }
    
    this.isLoading = true;
    this.accountService.updateProfile(this.userId, this.profileFormData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (updatedProfile) => {
          // Update the local profile with the response
          this.userProfile = {
            ...this.userProfile,
            ...updatedProfile,
            firstName: this.profileFormData.firstName,
            lastName: this.profileFormData.lastName
          };
          
          // Reset form state
          this.isEditingProfile = false;
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Show success message
          Swal.fire({
            title: 'Success',
            text: 'Profile updated successfully',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            // Reload the profile to ensure we have the latest data
            this.loadUserProfile();
          });
        },
        error: (err) => {
          console.error('Error updating profile:', err);
          const errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
  }

  changePassword(): void {
    if (!this.userId) {
      Swal.fire('Error', 'Please login again to continue', 'error');
      this.authService.logout();
      return;
    }

    // Validate passwords match
    if (this.passwordFormData.newPassword !== this.passwordFormData.confirmPassword) {
      Swal.fire('Error', 'New password and confirm password do not match', 'error');
      return;
    }

    // Validate password strength
    const strengthError = this.passwordStrengthError();
    if (strengthError) {
      Swal.fire('Error', strengthError, 'error');
      return;
    }
    
    this.isLoading = true;
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...passwordData } = this.passwordFormData;
    
    this.accountService.changePassword(this.userId, passwordData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          // Reset form state
          this.isChangingPassword = false;
          this.passwordFormData = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          
          // Show success message
          Swal.fire({
            title: 'Success',
            text: 'Password changed successfully',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error changing password:', err);
          const errorMessage = err.error?.message || 'Failed to change password. Please try again.';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
  }

  passwordStrengthError(): string | null {
    const password = this.passwordFormData.newPassword;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChars) return 'Password must contain at least one special character';

    return null;
  }

  getPasswordStrengthClass(): string {
    const password = this.passwordFormData.newPassword;
    if (!password) return '';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
    
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.profileFormData = {
      firstName: this.userProfile.firstName,
      lastName: this.userProfile.lastName
    };
  }

  cancelPasswordChange(): void {
    this.isChangingPassword = false;
    this.passwordFormData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  handleImageError(): void {
    console.log('Image error occurred, falling back to default');
    this.displayPhotoUrl = '/photo/tom.jpg';
    this.userProfile.photoUrl = '/photo/tom.jpg';
    this.updatePhotoTimestamp();
  }
}