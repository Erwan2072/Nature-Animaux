import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  activeMenu: string | null = null;
  burgerMenuOpen: boolean = false;

  // 🔹 Champ lié à la recherche
  searchTerm: string = '';

  constructor(private router: Router) {}

  // Catégories
  animals = [
    {
      name: 'chien',
      label: 'Chien',
      categories: [
        { label: 'Alimentation sèche', link: 'alimentationseche' },
        { label: 'Alimentation humide', link: 'alimentationhumide' },
        { label: 'Friandises', link: 'friandises' },
        { label: 'Accessoires', link: 'accessoires' },
        { label: 'Hygiènes & soins', link: 'hygienesetsoins' },
        { label: 'Jouets', link: 'jouets' }
      ]
    },
    {
      name: 'chat',
      label: 'Chat',
      categories: [
        { label: 'Alimentation sèche', link: 'alimentationseche' },
        { label: 'Alimentation humide', link: 'alimentationhumide' },
        { label: 'Friandises', link: 'friandises' },
        { label: 'Accessoires', link: 'accessoires' },
        { label: 'Hygiènes & soins', link: 'hygienesetsoins' },
        { label: 'Jouets', link: 'jouets' }
      ]
    },
    {
      name: 'oiseau',
      label: 'Oiseau',
      categories: [
        { label: 'Graines', link: 'graines' },
        { label: 'Cages', link: 'cages' },
        { label: 'Perchoirs', link: 'perchoirs' }
      ]
    },
    {
      name: 'rongeur',
      label: 'Rongeur, Lapin, Furet',
      categories: [
        { label: 'Foin', link: 'foin' },
        { label: 'Maisons', link: 'maisons' },
        { label: 'Jouets', link: 'jouets' }
      ]
    },
    {
      name: 'bassecour',
      label: 'Basse cour',
      categories: [
        { label: 'Aliments', link: 'aliments' },
        { label: 'Pondeuses', link: 'pondeuses' },
        { label: 'Clôtures', link: 'clotures' }
      ]
    },
    {
      name: 'derives',
      label: 'Jardins aquatiques',
      categories: [
        { label: 'Sacs', link: 'sacs' },
        { label: 'T-shirts', link: 'tshirts' },
        { label: 'Mugs', link: 'mugs' }
      ]
    }
  ];

  /** 🔹 Ouvrir/fermer un sous-menu (desktop + mobile) */
  toggleMenu(category: string) {
    // ouvre ou ferme le menu choisi
    this.activeMenu = this.activeMenu === category ? null : category;
  }


  /** 🔹 Fermer tout */
  closeMenu() {
    this.activeMenu = null;
    this.burgerMenuOpen = false;
  }

  /** 🔹 Ouvrir/fermer le burger */
  toggleBurgerMenu() {
    this.burgerMenuOpen = !this.burgerMenuOpen;
    if (!this.burgerMenuOpen) {
      this.activeMenu = null;
    }
  }

  /** 🔹 Fermer quand on clique à l’extérieur */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (
      !target.closest('.animal-btn') &&   // ✅ mobile
      !target.closest('.category-btn') && // ✅ desktop
      !target.closest('.subcategory-btn') && // ✅ sous-catégories
      !target.closest('.burger-icon') &&
      !target.closest('.burger-menu')
    ) {
      this.closeMenu();
    }
  }

  /** 🔹 Sélection d’une sous-catégorie */
  selectCategory(animal: string, category: string): void {
    this.router.navigate(['/products'], { queryParams: { animal, category } });
    this.closeMenu();
  }

  /** 🔹 Recherche */
  onSearch(): void {
    if (this.searchTerm.trim() !== '') {
      this.router.navigate(['/products'], { queryParams: { search: this.searchTerm } });
    }
  }
}
