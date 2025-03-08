import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService } from '../../services/api.service'; // ✅ Service API
import { catchError, of, Observable, startWith, map } from 'rxjs'; // ✅ Gestion des erreurs et filtrage RxJS
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule
  ]
})
export class AdminProductsComponent implements OnInit {
  products: any[] = []; // ✅ Liste des produits récupérés de l'API
  activeTab: string = 'add'; // ✅ Onglet actif (Ajout, Modification, Suppression)

  // ✅ Sélection du produit pour suppression avec autocomplétion
  selectedProductControl = new FormControl('');
  filteredProductTitles!: Observable<string[]>;
  selectedProductSKU: string = '';

  // ✅ Champ de recherche avec autocomplétion pour l'ajout/modification
  productTitleControl = new FormControl('');
  filteredProducts!: Observable<string[]>;

  // ✅ Modèle pour un produit
  product = {
    title: '',
    animal: '',
    category: '',
    subCategory: '',
    brand: '',
    variations: [{ sku: '', price: 0, weight: '', stock: 0 }],
    description: '',
    image: null
  };

  // ✅ Listes déroulantes
  animals = ['Chien', 'Chat', 'Oiseau', 'Rongeur, Lapin, Furet', 'Basse cour', 'Jardins aquatiques'];
  categories = ['Alimentation sèches', 'Alimentation humides', 'Friandises', 'Accessoires', 'Hygiènes & Soins', 'Jouets'];
  subCategories = ['A définir'];
  brands = ['Dr Clauder_s', 'Ownat', 'Authentics'];
  weights = ['1kg', '2.5kg', '5kg', '10kg'];

  imagePreview: string | null = null; // ✅ Prévisualisation de l'image

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getProducts(); // ✅ Chargement des produits au démarrage

    // ✅ Configuration de l'autocomplétion pour l'ajout/modification
    this.filteredProducts = this.productTitleControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProducts(value || ''))
    );

    // ✅ Configuration de l'autocomplétion pour la suppression
    this.filteredProductTitles = this.selectedProductControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProductTitles(value || ''))
    );
  }

  // ✅ Changer d'onglet (Ajout, Modification, Suppression)
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // ✅ Récupérer tous les produits depuis l'API
  getProducts() {
    console.log("📡 Envoi de la requête GET vers l'API...");

    this.apiService.getProducts()
      .pipe(
        catchError(error => {
          console.error("❌ Erreur API :", error);
          return of([]); // ✅ Retourne un tableau vide en cas d’erreur
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log("📥 Réponse API reçue :", response);
          this.products = response || []; // ✅ Mise à jour correcte
        }
      });
  }

  // ✅ Filtrer les produits pour l'autocomplétion (Ajout/Modification)
  private filterProducts(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.products
      .map(prod => prod.title) // ✅ On récupère uniquement les titres
      .filter(title => title.toLowerCase().includes(filterValue));
  }

  // ✅ Filtrer les produits pour l'autocomplétion (Suppression)
  private filterProductTitles(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.products
      .map(prod => prod.title)
      .filter(title => title.toLowerCase().includes(filterValue));
  }

  // ✅ Mettre à jour le SKU du produit sélectionné pour suppression
  updateSelectedProductSKU() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);
    this.selectedProductSKU = selectedProduct ? selectedProduct.sku : 'N/A';
  }

  // ✅ Supprimer un produit
  deleteProduct() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);

    if (!selectedProduct) {
      alert("⚠️ Veuillez sélectionner un produit valide à supprimer.");
      return;
    }

    console.log("🗑️ Suppression du produit :", selectedProduct);

    this.apiService.deleteProduct(selectedProduct.id)
      .pipe(
        catchError(error => {
          console.error("❌ Erreur lors de la suppression :", error);
          alert("Erreur lors de la suppression du produit.");
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log("✅ Produit supprimé avec succès !");
            alert("Produit supprimé avec succès !");
            this.getProducts(); // ✅ Recharger la liste après suppression
            this.selectedProductControl.setValue(''); // ✅ Réinitialisation de la sélection
            this.selectedProductSKU = '';
          }
        }
      });
  }

  // ✅ Optimisation de la boucle *ngFor pour éviter un re-rendu inutile
  trackByIndex(index: number, item: any) {
    return index;
  }

  // ✅ Ajouter une variation
  addVariation() {
    this.product.variations.push({ sku: '', price: 0, weight: '', stock: 0 });
  }

  // ✅ Supprimer une variation
  removeVariation(index: number) {
    if (this.product.variations.length > 1) {
      this.product.variations.splice(index, 1);
    } else {
      alert("⚠️ Il doit y avoir au moins une variation.");
    }
  }

  // ✅ Gestion de l'image sélectionnée avec prévisualisation
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.product.image = file;
    }
  }

  // ✅ Vérifier si tous les champs obligatoires sont remplis avant d'enregistrer
  isValidProduct(): boolean {
    return (
      this.product.title.trim() !== '' &&
      this.product.animal.trim() !== '' &&
      this.product.category.trim() !== '' &&
      this.product.subCategory.trim() !== '' &&
      this.product.brand.trim() !== '' &&
      this.product.variations.length > 0 &&
      this.product.variations.every(variation =>
        variation.sku.trim() !== '' &&
        Number(variation.price) > 0 &&
        Number(variation.stock) >= 0
      )
    );
  }

  // ✅ Enregistrer un produit
  saveProduct() {
    if (!this.isValidProduct()) {
      alert("⚠️ Veuillez remplir tous les champs obligatoires avant d'enregistrer.");
      return;
    }

    console.log("📡 Envoi du produit à l'API :", this.product);

    this.apiService.addProduct(this.product)
      .pipe(
        catchError(error => {
          console.error("❌ Erreur lors de l'enregistrement :", error);
          alert("Erreur lors de l'enregistrement du produit.");
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response) {
            console.log("✅ Produit enregistré :", response);
            alert("Produit enregistré avec succès !");
            this.getProducts();
            this.productTitleControl.setValue('');
          }
        }
      });
  }
}
