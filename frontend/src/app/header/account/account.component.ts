import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class AccountComponent implements OnInit {
  activeTab: string = 'profile';
  accountForm!: FormGroup;
  addressForm!: FormGroup;
  paymentForm!: FormGroup;
  passwordForm!: FormGroup;
  passwordMismatch: boolean = false;
  apiUrl: string = 'http://127.0.0.1:8000/users'; // ✅ corrigé vers ton backend
  message: string = ''; // ✅ pour afficher les retours utilisateur

  countries: string[] = [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola",
    "France", "Canada", "États-Unis", "Royaume-Uni", "Japon", "Italie", "Espagne", "Brésil",
    "Russie", "Chine", "Inde", "Mexique", "Argentine", "Australie", "Nouvelle-Zélande"
  ];

  savedCards: { last4: string; cardName: string; cardExpiry: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService // ✅ injection du service
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserData();
  }

  private initForms() {
    this.accountForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      company: ['']
    });

    this.addressForm = this.fb.group({
      country: ['France', Validators.required],
      address: ['', Validators.required],
      addressComplement: [''],
      intercom: [''],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      city: ['', Validators.required],
      region: ['']
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardName: ['', Validators.required],
      cardExpiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])/[0-9]{2}$')]],
      cardCVV: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required]
    });
  }

  private checkPasswordMatch() {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmNewPassword = this.passwordForm.get('confirmNewPassword')?.value;
    this.passwordMismatch = newPassword !== confirmNewPassword;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  loadUserData() {
    this.http.get<any>(`${this.apiUrl}/profile/`).subscribe(
      (data) => {
        this.accountForm.patchValue({
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone || '',
          company: data.company || ''
        });
        this.addressForm.patchValue(data.address || {});
        this.paymentForm.patchValue(data.payment || {});
        if (data.savedCards) {
          this.savedCards = data.savedCards;
        }
      },
      (error) => console.error('Erreur lors du chargement des données :', error)
    );
  }

  saveProfile() {
    if (this.accountForm.valid) {
      this.http.patch(`${this.apiUrl}/profile/update/`, this.accountForm.value).subscribe(
        () => this.message = 'Profil enregistré ✅',
        (error) => console.error('❌ Erreur lors de l\'enregistrement du profil', error)
      );
    }
  }

  saveAddress() {
    if (this.addressForm.valid) {
      this.http.put(`${this.apiUrl}/update-address`, this.addressForm.value).subscribe(
        () => this.message = 'Adresse enregistrée ✅',
        (error) => console.error('❌ Erreur lors de l\'enregistrement de l\'adresse', error)
      );
    }
  }

  savePayment() {
    if (this.paymentForm.valid) {
      const newCard = {
        last4: this.paymentForm.value.cardNumber.slice(-4),
        cardName: this.paymentForm.value.cardName,
        cardExpiry: this.paymentForm.value.cardExpiry
      };
      this.savedCards.push(newCard);

      this.http.put(`${this.apiUrl}/update-payment`, this.paymentForm.value).subscribe(
        () => this.message = 'Paiement enregistré ✅',
        (error) => console.error(' Erreur lors de l\'enregistrement du paiement', error)
      );
    }
  }

  editCard(index: number) {
    const card = this.savedCards[index];
    this.paymentForm.patchValue({
      cardNumber: '',
      cardName: card.cardName,
      cardExpiry: card.cardExpiry,
      cardCVV: ''
    });
  }

  deleteCard(index: number) {
    this.savedCards.splice(index, 1);
    this.http.delete(`${this.apiUrl}/delete-card/${index}`).subscribe(
      () => this.message = 'Carte supprimée ✅',
      (error) => console.error('Erreur lors de la suppression de la carte', error)
    );
  }

  changePassword() {
    this.checkPasswordMatch();
    if (this.passwordForm.valid && !this.passwordMismatch) {
      this.http.put(`${this.apiUrl}/change-password`, this.passwordForm.value).subscribe(
        () => this.message = 'Mot de passe mis à jour ✅',
        (error) => console.error('Erreur lors de la mise à jour du mot de passe', error)
      );
    } else {
      console.warn('Erreur : les mots de passe ne correspondent pas.');
    }
  }

  // ✅ Nouvelle méthode : demande de changement d’email
  changeEmail() {
    const newEmail = this.accountForm.value.email;
    this.authService.requestEmailChange(newEmail).subscribe({
      next: (res) => this.message = res.message,
      error: (err) => console.error('❌ Erreur lors du changement d’email', err)
    });
  }
}
