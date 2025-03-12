import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  imports: [],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {

  constructor(private router: Router) {}

  redirectToSupport() {
    this.router.navigate(['/support']).then(() => {
      window.scrollTo(0, 0);
    });
  }

}
