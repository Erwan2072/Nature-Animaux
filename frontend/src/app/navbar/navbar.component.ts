import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  activeMenu: string | null = null;
  burgerMenuOpen: boolean = false; // ✅ Gestion du menu burger

  // ✅ Définition des catégories dynamiques
  animals = [
    {
      name: 'chien',
      label: 'Chien',
      categories: [
        { label: 'Alimentation sèches', link: 'alimentationseches' },
        { label: 'Alimentation humides', link: 'alimentationhumides' },
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
        { label: 'Alimentation sèche', link: 'alimentationseches' },
        { label: 'Alimentation humide', link: 'alimentationhumides' },
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

  // ✅ Ouvre ou ferme le menu déroulant des catégories
  toggleMenu(category: string) {
    if (this.burgerMenuOpen) {
      // ✅ Mode mobile : Affiche le sous-menu dans le menu burger
      this.activeMenu = this.activeMenu === category ? null : category;
    } else {
      // ✅ Mode desktop : Affiche le sous-menu au survol/clic
      this.activeMenu = this.activeMenu === category ? null : category;
    }
  }

  // ✅ Ferme les menus déroulants ET le menu burger quand on clique sur une sous-catégorie
  closeMenu() {
    this.activeMenu = null;
    this.burgerMenuOpen = false; // ✅ Ferme aussi le menu burger
  }

  // ✅ Gère l'affichage du menu burger
  toggleBurgerMenu() {
    this.burgerMenuOpen = !this.burgerMenuOpen;
    if (!this.burgerMenuOpen) {
      this.activeMenu = null; // ✅ Ferme les sous-menus si on ferme le burger
    }
  }

  // ✅ Ferme les menus quand on clique en dehors (uniquement si le clic est à l'extérieur du menu)
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // Vérifie si l'élément cliqué est DANS un menu, un bouton burger ou un sous-menu
    if (
      !target.closest('.category-item') &&
      !target.closest('.burger-icon') &&
      !target.closest('.burger-menu')
    ) {
      this.activeMenu = null;
      this.burgerMenuOpen = false;
    }
  }
}
