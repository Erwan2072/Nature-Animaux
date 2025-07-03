import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  standalone: true
})
export class AboutComponent {

  constructor(private router: Router) {} //  Injection du Router

  redirectToSupport() {
    this.router.navigate(['/support']);
    window.scrollTo(0, 0); //  Redirection vers la page Support
  }

}
