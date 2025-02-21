import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment'; // ✅ Import du fichier d'env

declare const google: any; // ✅ Évite les erreurs TypeScript

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  private userSubscription: Subscription | null = null;
  private googleButtonInitialized = false; // ✅ Empêche l'affichage multiple du bouton Google

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // ✅ Écoute l'état de connexion de l'utilisateur et redirige après login
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.redirectUser(user);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initGoogleSignIn(); // ✅ Initialise Google Sign-In après l'affichage du DOM
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe(); // ✅ Évite les fuites mémoire
  }

  // ✅ Connexion normale avec email/mot de passe
  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        console.log("✅ Connexion réussie !");
        this.authService.fetchAndStoreUserInfo(); // 🔥 Récupérer les infos utilisateur après connexion
      },
      error: (error) => {
        console.error('❌ Erreur de connexion :', error);
        this.errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      }
    });
  }

  // ✅ Connexion avec Google
  loginWithGoogle(): void {
    if (!google?.accounts?.id) {
      console.error('❌ Google Sign-In non chargé.');
      this.errorMessage = 'Connexion Google indisponible.';
      return;
    }

    google.accounts.id.prompt(); // ✅ Affiche la popup Google Sign-In
  }

  // ✅ Redirection après connexion selon le rôle utilisateur
  private redirectUser(user: any): void {
    console.log("🔀 Redirection en fonction du rôle utilisateur :", user);
    if (user.is_admin) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // ✅ Initialisation de Google Sign-In
  private initGoogleSignIn(): void {
    if (!google?.accounts?.id) {
      console.error('❌ Google Sign-In non disponible.');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId, // ✅ Utilisation correcte du Client ID
      callback: (response: any) => this.handleGoogleCallback(response)
    });

    const googleButton = document.getElementById('google-signin-button');
    if (googleButton && !this.googleButtonInitialized) {
      google.accounts.id.renderButton(googleButton, {
        theme: 'outline',
        size: 'large'
      });
      this.googleButtonInitialized = true; // ✅ Empêche d'afficher plusieurs boutons
    } else if (!this.googleButtonInitialized) {
      console.warn('⚠️ Élément Google Sign-In introuvable. Affichage forcé de la popup.');
      google.accounts.id.prompt();
    }
  }

  // ✅ Traitement du callback de Google Sign-In
  private handleGoogleCallback(response: any): void {
    const token = response.credential;
    if (!token) {
      console.error('❌ Token Google invalide.');
      this.errorMessage = 'Échec de connexion avec Google.';
      return;
    }

    this.authService.loginWithGoogle(token).subscribe({
      next: () => {
        console.log("✅ Connexion Google réussie !");
        this.authService.fetchAndStoreUserInfo();
      },
      error: (error) => {
        console.error('❌ Erreur de connexion Google :', error);
        this.errorMessage = 'Échec de connexion avec Google.';
      }
    });
  }
}
