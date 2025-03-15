import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { catchError, of, Observable, startWith, map } from 'rxjs';
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
  products: any[] = [];
  activeTab: string = 'add';

  selectedProductControl = new FormControl('');
  filteredProductTitles!: Observable<string[]>;
  selectedProductSKU: string = '';

  productTitleControl = new FormControl('');
  filteredProducts!: Observable<string[]>;

  // ✅ Ajout du champ `image_url`
  product: any = {
    title: '',
    image_url: '',  // ✅ Nouveau champ pour stocker l'URL de l'image
    category: '',
    subCategory: '',
    brand: '',
    variations: [{ sku: '', price: null, weight: '', stock: 0 }],
    description: '',
  };

  animals = ['Chien', 'Chat', 'Oiseau', 'Rongeur, Lapin, Furet', 'Basse cour', 'Jardins aquatiques'];
  categories = ['Alimentation sèche', 'Alimentation humide', 'Friandises', 'Accessoires', 'Hygiènes & Soins', 'Jouets'];
  subCategories = ['A définir'];
  brands = ['Winner', 'Ownat', 'Authentics'];
  weights = ['1kg', '2.5kg', '5kg', '10kg', '3kg', '7kg', '15kg', '20kg', '25kg', '30kg'];

  imagePreview: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getProducts();

    this.filteredProducts = this.productTitleControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProducts(value || ''))
    );

    this.filteredProductTitles = this.selectedProductControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProductTitles(value || ''))
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getProducts() {
    this.apiService.getProducts()
      .pipe(catchError(error => {
        console.error("Erreur API :", error);
        return of([]);
      }))
      .subscribe({
        next: (response: any) => {
          this.products = response || [];
        }
      });
  }

  private filterProducts(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.products
      .map(prod => prod.title)
      .filter(title => title.toLowerCase().includes(filterValue));
  }

  private filterProductTitles(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.products
      .map(prod => prod.title)
      .filter(title => title.toLowerCase().includes(filterValue));
  }

  updateSelectedProductSKU() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);
    this.selectedProductSKU = selectedProduct ? selectedProduct.sku : 'N/A';
  }

  deleteProduct() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);

    if (!selectedProduct) {
      alert("Veuillez sélectionner un produit valide à supprimer.");
      return;
    }

    this.apiService.deleteProduct(selectedProduct.id)
      .pipe(catchError(error => {
        console.error("Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression du produit.");
        return of(null);
      }))
      .subscribe({
        next: (response) => {
          if (response) {
            alert("Produit supprimé avec succès !");
            this.getProducts();
            this.selectedProductControl.setValue('');
            this.selectedProductSKU = '';
          }
        }
      });
  }

  trackByIndex(index: number, item: any) {
    return index;
  }

  addVariation() {
    this.product.variations.push({ sku: '', price: null, weight: '', stock: 0 });
  }

  removeVariation(index: number) {
    if (this.product.variations.length > 1) {
      this.product.variations.splice(index, 1);
    } else {
      alert("Il doit y avoir au moins une variation.");
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.product.image_url = this.imagePreview;  // ✅ Stocke l'URL de l'image
      };
      reader.readAsDataURL(file);
    }
  }

  isValidProduct(): boolean {
    return (
      this.product.title.trim() !== '' &&
      this.product.variations.every((variation: any) =>
        variation.sku.trim() !== '' &&
        Number(variation.price) > 0 &&
        Number(variation.stock) >= 0
      )
    );
  }

  saveProduct() {
    if (!this.isValidProduct()) {
      alert("Veuillez remplir tous les champs obligatoires avant d'enregistrer.");
      return;
    }

    this.apiService.addProduct(this.product)
      .pipe(catchError(error => {
        console.error("Erreur lors de l'enregistrement :", error);
        alert("Erreur lors de l'enregistrement du produit.");
        return of(null);
      }))
      .subscribe({
        next: (response) => {
          if (response) {
            alert("Produit enregistré avec succès !");
            this.getProducts();
            this.productTitleControl.setValue('');
            this.imagePreview = null;  // ✅ Réinitialisation de l'aperçu de l'image
          }
        }
      });
  }
}
