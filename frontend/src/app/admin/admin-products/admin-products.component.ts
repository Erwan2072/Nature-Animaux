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
    imageUrl: '',  // ✅ cohérence avec backend
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
  imageFile: File | null = null; // ✅ garde le fichier pour Cloudinary

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
          // ✅ uniformiser l’ID Mongo
          this.products = (response.products || []).map((p: any) => ({
            ...p,
            id: p._id || p.id
          }));
        }
      });
  }

  private filterProductTitles(value: string): string[] {
    const filterValue = value.trim().toLowerCase();
    if (!filterValue) return [];
    return this.products
      .map(prod => prod.title)
      .filter(title => title.toLowerCase().includes(filterValue));
  }

  updateSelectedProductSKU() {
    const selectedProduct = this.products.find(prod => prod.title === this.selectedProductControl.value);
    if (selectedProduct?.variations?.length > 0) {
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
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
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

  const formData = new FormData();

  // ✅ Ajouter les variations correctement
  this.product.variations.forEach((v: any, index: number) => {
    formData.append(`variations[${index}][sku]`, v.sku || '');
    formData.append(`variations[${index}][price]`, v.price !== null ? String(v.price) : '');
    formData.append(`variations[${index}][weight]`, v.weight || '');
    formData.append(`variations[${index}][stock]`, v.stock !== null ? String(v.stock) : '0');
  });

  // Autres champs
  Object.keys(this.product).forEach(key => {
    if (key !== 'variations' && this.product[key] !== null && this.product[key] !== undefined) {
      formData.append(key, this.product[key]);
    }
  });

  if (this.imageFile) {
    formData.append('image', this.imageFile);
  }


  console.log("🟡 Données envoyées via FormData :");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  
  const isEdit = this.activeTab === 'edit' && this.product.id;
  const apiCall = isEdit
    ? this.apiService.updateProduct(this.product.id, formData)
    : this.apiService.addProduct(formData);

  apiCall.pipe(
    catchError(error => {
      console.error("❌ Erreur sauvegarde :", error);
      alert("Erreur sauvegarde !");
      return of(null);
    })
  ).subscribe({
    next: (response) => {
      if (response) {
        alert(isEdit ? "✅ Produit modifié !" : "✅ Produit ajouté !");
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

    // ✅ Toujours normaliser les variations
    this.product.variations = (this.product.variations || []).map((v: any) => ({
      sku: v.sku || '',
      price: v.price !== null ? Number(v.price) : null,
      weight: v.weight || '',
      stock: v.stock !== null ? Number(v.stock) : 0,
    }));

    this.imagePreview = this.product.imageUrl || null;
    this.imageFile = null;
  }
}


  resetProductForm() {
    this.product = {
      title: '',
      imageUrl: '',
      category: '',
      subCategory: '',
      brand: '',
      variations: [{ sku: '', price: null, weight: '', stock: 0 }],
      description: '',
    };
    this.imagePreview = null;
    this.imageFile = null;
  }
}