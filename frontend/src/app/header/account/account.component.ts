import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; //  Importation d'HttpClient

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
  apiUrl: string = 'https://api.tonsite.com/users'; //  URL API à modifier selon ton backend

  //  Liste des pays pour le champ "Pays"
  countries: string[] = [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola",
    "France", "Canada", "États-Unis", "Royaume-Uni", "Japon", "Italie", "Espagne", "Brésil",
    "Russie", "Chine", "Inde", "Mexique", "Argentine", "Australie", "Nouvelle-Zélande"
  ];

  //  Gestion des cartes enregistrées
  savedCards: { last4: string; cardName: string; cardExpiry: string }[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUserData(); //  Charge les données utilisateur au démarrage
  }

  //  Initialisation des formulaires
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

  //  Vérification de la correspondance des mots de passe
  private checkPasswordMatch() {
    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmNewPassword = this.passwordForm.get('confirmNewPassword')?.value;
    this.passwordMismatch = newPassword !== confirmNewPassword;
  }

  //  Change l'onglet actif
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  //  Chargement des données utilisateur depuis l'API
  loadUserData() {
    this.http.get<any>(`${this.apiUrl}/me`).subscribe(
      (data) => {
        this.accountForm.patchValue(data.account);
        this.addressForm.patchValue(data.address);
        this.paymentForm.patchValue(data.payment);
        if (data.savedCards) {
          this.savedCards = data.savedCards;
        }
      },
      (error) => console.error('Erreur lors du chargement des données :', error)
    );
  }

  //  Sauvegarde des modifications (envoi des données au backend)
  saveProfile() {
    if (this.accountForm.valid) {
      this.http.put(`${this.apiUrl}/update-profile`, this.accountForm.value).subscribe(
        () => console.log(' Profil enregistré'),
        (error) => console.error('❌ Erreur lors de l\'enregistrement du profil', error)
      );
    }
  }

  saveAddress() {
    if (this.addressForm.valid) {
      this.http.put(`${this.apiUrl}/update-address`, this.addressForm.value).subscribe(
        () => console.log(' Adresse enregistrée'),
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
      console.log(' Paiement enregistré', this.savedCards);

      this.http.put(`${this.apiUrl}/update-payment`, this.paymentForm.value).subscribe(
        () => console.log(' Paiement enregistré'),
        (error) => console.error(' Erreur lors de l\'enregistrement du paiement', error)
      );
    }
  }

  //  Modifier une carte
  editCard(index: number) {
    const card = this.savedCards[index];
    this.paymentForm.patchValue({
      cardNumber: '', // On ne peut pas récupérer un numéro de carte complet pour des raisons de sécurité
      cardName: card.cardName,
      cardExpiry: card.cardExpiry,
      cardCVV: '' //  CVV doit être re-saisi
    });
    console.log('📝 Modification de la carte :', card);
  }


  //  Supprimer une carte enregistrée
  deleteCard(index: number) {
    this.savedCards.splice(index, 1); //  Supprime la carte localement

    //  Envoie la suppression au backend
    this.http.delete(`${this.apiUrl}/delete-card/${index}`).subscribe(
      () => console.log('Carte supprimée'),
      (error) => console.error('Erreur lors de la suppression de la carte', error)
    );
  }

  //  Mise à jour du mot de passe
  changePassword() {
    this.checkPasswordMatch();

    if (this.passwordForm.valid && !this.passwordMismatch) {
      this.http.put(`${this.apiUrl}/change-password`, this.passwordForm.value).subscribe(
        () => console.log('Mot de passe mis à jour'),
        (error) => console.error('Erreur lors de la mise à jour du mot de passe', error)
      );
    } else {
      console.warn('Erreur : les mots de passe ne correspondent pas.');
    }
  }
}
