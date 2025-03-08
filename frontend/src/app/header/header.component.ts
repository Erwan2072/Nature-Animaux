import { Component, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent {
  isAuthenticated = false;
  userInitials: string | null = null;
  isAdmin = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, public router: Router, private eRef: ElementRef) {
    this.authService.user$.subscribe(user => {
      console.log("🔍 Utilisateur connecté :", user);

      if (user && user.email) {
        this.isAuthenticated = true;
        this.userInitials = this.getInitialsFromEmail(user.email);
        this.isAdmin = user.is_admin;
      } else {
        this.isAuthenticated = false;
        this.userInitials = null;
        this.isAdmin = false;
      }
    });
  }

  // ✅ Récupérer les deux premières lettres de l'email
  getInitialsFromEmail(email: string): string {
    if (!email || email.length < 2) return '??';
    return email.slice(0, 2).toUpperCase();
  }

  // ✅ Déconnexion
  logout(): void {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/']);
  }

  // ✅ Aller à l'espace admin (route corrigée)
  goToAdmin(): void {
    console.log("🔍 Tentative d'accès à l'admin - isAdmin:", this.isAdmin);

    if (this.isAdmin) {
      this.router.navigate(['/admin']); // ✅ Redirection Angular
    } else {
      console.error("🚨 Accès refusé : l'utilisateur n'est pas admin");
    }
  }


  // ✅ Ouvrir/fermer le menu déroulant
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // ✅ Fermer le menu déroulant lorsqu'on clique en dehors
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
