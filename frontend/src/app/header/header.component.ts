import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isAuthenticated = false;
  userInitials: string | null = null;
  isAdmin = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.isAuthenticated = true;
        this.userInitials = this.getInitials(user.first_name, user.last_name);
        this.isAdmin = user.is_admin;
      } else {
        this.isAuthenticated = false;
        this.userInitials = null;
        this.isAdmin = false;
      }
    });
  }

  // 🔥 Fonction pour extraire les initiales de l'utilisateur
  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  // ✅ Déconnexion utilisateur
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // 🔥 Redirection vers la page admin
  goToAdmin(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin-dashboard']);
    }
  }
}
