import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ✅ Adapter le chemin si besoin
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  register(): void {
    if (this.registerForm.invalid) return;

    const { email, password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.register(email, password).subscribe({
      next: () => {
        console.log('✅ Inscription réussie !');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('❌ Erreur d’inscription :', error);
        this.errorMessage = "L'inscription a échoué.";
      }
    });
  }
}
