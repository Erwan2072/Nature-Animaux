import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HomeComponent {
  images = [
    'assets/images/Biovetol1.png',
    'assets/images/Biovetol2.png',
    'assets/images/Biovetol3.png',
    'assets/images/Biovetol4.png',
    'assets/images/Biovetol5.png',
  ];

  getRotation(index: number): string {
    const angle = (index * 360) / this.images.length;
    return `rotateY(${angle}deg) translateZ(300px)`;
  }
}
