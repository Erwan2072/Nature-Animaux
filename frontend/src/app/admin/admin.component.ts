import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductsComponent } from './admin-products/admin-products.component'; // ✅ Chemin et nom corrigés

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    imports: [CommonModule, AdminProductsComponent] // ✅ même nom
})
export class AdminComponent {
    activeTab: string = 'products';

    selectTab(tab: string): void {
        this.activeTab = tab;
    }
}
