import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common'; // ✅ Ajout pour éviter les erreurs *ngIf

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule] // ✅ Ajout pour *ngIf et autres directives
})
export class HeaderComponent {
  isAuthenticated = false;
  userInitials: string | null = null;
  isAdmin = false;
  isDropdownOpen = false;

  constructor(private authService: AuthService, public router: Router) { // ✅ `router` doit être public pour le template
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

  // ✅ Récupérer les initiales de l'email
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

  // ✅ Aller à l'espace admin
  goToAdmin(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin-dashboard']);
    }
  }

  // ✅ Ouvrir/fermer le menu déroulant
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // ✅ Fermer le menu quand on clique en dehors
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isDropdownOpen = false;
    }
  }
}
