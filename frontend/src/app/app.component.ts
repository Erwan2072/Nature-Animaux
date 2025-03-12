import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './header/header.component'; // ✅ Import du HeaderComponent
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent] // ✅ Ajout du HeaderComponent
})
export class AppComponent implements OnInit {
  title: string = 'Nature & Animaux';
  isMenuOpen: boolean = false;
  isAdminPage: boolean = false;
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // ✅ Vérifie si l'utilisateur est connecté
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // ✅ Détection des pages admin
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminPage = event.url.startsWith('/admin');
      });
  }

  // ✅ Affichage/caché du menu burger
  toggleMenu(): void {
    if (this.isAdminPage) return;
    this.isMenuOpen = !this.isMenuOpen;
  }
}
