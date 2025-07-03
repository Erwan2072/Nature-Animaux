import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; //  Import du Router pour la redirection

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule, //  Assure la compatibilité avec *ngIf, *ngFor, etc.
    ReactiveFormsModule, //  Permet d'utiliser les formulaires réactifs
  ],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent {
  contactForm: FormGroup;
  isSubmitted = false;

  constructor(private fb: FormBuilder, private router: Router) { //  Injection du Router
    this.contactForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log("Message envoyé :", this.contactForm.value);
      this.isSubmitted = true;
    }
  }

  //  Fonction pour rediriger vers la page Support
  redirectToSupport() {
    this.router.navigate(['/support']);
    window.scrollTo(0, 0);
  }
}
