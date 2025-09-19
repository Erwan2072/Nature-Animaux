import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service'; // adapte le chemin si besoin

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {
  message: string = 'Validation en cours...';
  status: 'pending' | 'success' | 'error' = 'pending'; // ✅ ajouté

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.confirmEmailChange(token).subscribe({
        next: (res) => {
          this.message = res.message;
          this.status = 'success'; // ✅ succès
        },
        error: () => {
          this.message = '❌ Lien invalide ou expiré';
          this.status = 'error'; // ✅ erreur
        }
      });
    } else {
      this.message = '❌ Aucun token fourni.';
      this.status = 'error';
    }
  }
}
