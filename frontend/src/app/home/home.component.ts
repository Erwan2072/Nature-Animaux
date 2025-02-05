import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // ✅ Importation de RouterModule

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true, // ✅ Standalone activé
  imports: [RouterModule] // ✅ Ajout dans `Component()`, pas en dehors !
})
export class HomeComponent {}
