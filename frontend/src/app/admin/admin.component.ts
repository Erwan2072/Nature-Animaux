import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterModule]
})
export class AdminComponent {
    constructor(private router: Router) {}

    goTo(path: string): void {
        this.router.navigate([`/${path}`]);
    }
}
