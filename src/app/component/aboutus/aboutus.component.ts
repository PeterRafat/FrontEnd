import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aboutus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aboutus.component.html',
  styleUrl: './aboutus.component.css'
})
export class AboutusComponent {
  images = [
    { name: 'Rafek Naim', role: 'Backend Developer', image: "/photo/photo_2025-02-04_06-13-19.jpg"},
    { name: 'Steven Ayman', role: 'Backend Developer', image: "/photo/photo_2025-02-04_06-13-54.jpg" },
    { name: 'Mena Safwat', role: 'Backend Developer', image: "/photo/photo_2025-02-04_06-13-17.jpg" },
    { name: 'Peter Rafat', role: 'Frontend Developer', image: "/photo/photo_2025-02-04_06-14-26.jpg" },
    { name: 'Sara Ezzat', role: 'Frontend Developer', image: "/photo/50.jpg" },
    { name: 'Asmaa Hamdalla', role: 'Frontend Developer', image: "/photo/photo_2025-02-05_02-57-08.jpg" },
    { name: 'Mira Mamdoh', role: 'AI Developer', image: "/photo/photo_2025-02-04_05-13-38.jpg" },
  ];
  
 

}

