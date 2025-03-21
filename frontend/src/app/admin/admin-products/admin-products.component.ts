import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { catchError, of, Observable, startWith, map } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';

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
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule
  ]
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  activeTab: string = 'add';

  // Contrôles pour suppression
  selectedProductControl = new FormControl('');
  filteredProductTitles!: Observable<string[]>;
  selectedProductSKU: string = '';

  // Contrôles pour modification
  editProductControl = new FormControl('');
  filteredEditTitles!: Observable<string[]>;

  // Objet produit
  product: any = {
    title: '',
    image_url: '',
    category: '',
    subCategory: '',
    brand: '',
    variations: [{ sku: '', price: null, weight: '', stock: 0 }],
    description: '',
  };

  // Données statiques
  animals = ['Chien', 'Chat', 'Oiseau', 'Rongeur, Lapin, Furet', 'Basse cour', 'Jardins aquatiques'];
  categories = ['Alimentation sèche', 'Alimentation humide', 'Friandises', 'Accessoires', 'Hygiènes & Soins', 'Jouets'];
  subCategories = ['A définir'];
  brands = ['Winner', 'Ownat', 'Authentics'];
  weights = ['1kg', '2.5kg', '5kg', '10kg', '3kg', '7kg', '15kg', '20kg', '25kg', '30kg'];

  imagePreview: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getProducts();

    // Autocomplétion suppression
    this.filteredProductTitles = this.selectedProductControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProductTitles(value || ''))
    );

    // Autocomplétion modification
    this.filteredEditTitles = this.editProductControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filterProductTitles(value || ''))
    );
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'add') {
      this.resetProductForm();
    }
  }

  getProducts() {
    this.apiService.getProducts()
      .pipe(catchError(error => {
        console.error("Erreur API :", error);
        return of({ products: [] });
      }))
      .subscribe({
        next: (response: any) => {
          this.products = response.products || [];
        }
      });
  }

  private filterProductTitles(value: string): string[] {
    const filterValue = value.trim().toLowerCase();

    if (!filterValue) {
      return []; // Affiche rien si champ vide
    }

    return this.products
      .map(prod => prod.title)
      .filter(title => title.toLowerCase().includes(filterValue));
    // → Utilise startsWith(filterValue) si tu veux commencer par la lettre uniquement
  }

  updateSelectedProductSKU() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);
    if (selectedProduct && selectedProduct.variations && selectedProduct.variations.length > 0) {
      this.selectedProductSKU = selectedProduct.variations[0].sku;
    } else {
      this.selectedProductSKU = 'N/A';
    }
  }

  deleteProduct() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);

    if (!selectedProduct) {
      alert("Veuillez sélectionner un produit valide à supprimer.");
      return;
    }

    this.apiService.deleteProduct(selectedProduct.id)
      .pipe(catchError(error => {
        console.error("Erreur suppression :", error);
        alert("Erreur lors de la suppression.");
        return of(null);
      }))
      .subscribe({
        next: (response) => {
          if (response) {
            alert("Produit supprimé !");
            this.getProducts();
            this.selectedProductControl.setValue('');
            this.selectedProductSKU = '';
          }
        }
      });
  }

  trackByIndex(index: number, item: any) { return index; }

  addVariation() {
    this.product.variations.push({ sku: '', price: null, weight: '', stock: 0 });
  }

  removeVariation(index: number) {
    if (this.product.variations.length > 1) {
      this.product.variations.splice(index, 1);
    } else {
      alert("Il faut au moins une variation.");
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.product.image_url = this.imagePreview;
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
      alert("Remplis tous les champs obligatoires !");
      return;
    }

    const isEdit = this.activeTab === 'edit' && this.product.id;
    const apiCall = isEdit
      ? this.apiService.updateProduct(this.product.id, this.product)
      : this.apiService.addProduct(this.product);

    apiCall.pipe(
      catchError(error => {
        console.error("Erreur sauvegarde :", error);
        alert("Erreur sauvegarde !");
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          alert(isEdit ? "Produit modifié !" : "Produit ajouté !");
          this.getProducts();
          this.resetProductForm();
          this.editProductControl.setValue('');
        }
      }
    });
  }

  loadProductDetails(title: string) {
    const productToEdit = this.products.find(prod => prod.title === title);

    if (productToEdit) {
      this.product = JSON.parse(JSON.stringify(productToEdit));
      this.imagePreview = this.product.image_url || null;
    }
  }

  resetProductForm() {
    this.product = {
      title: '',
      image_url: '',
      category: '',
      subCategory: '',
      brand: '',
      variations: [{ sku: '', price: null, weight: '', stock: 0 }],
      description: '',
    };
    this.imagePreview = null;
  }
}
