import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal',
  imports: [],
  templateUrl: './legal.component.html',
  styleUrl: './legal.component.scss'
})
export class LegalComponent {

  constructor(private router: Router) {} // ✅ Injection du Router

  redirectToSupport() {
    this.router.navigate(['/support']);
    window.scrollTo(0, 0); // ✅ Redirection vers la page Support
  }

}
