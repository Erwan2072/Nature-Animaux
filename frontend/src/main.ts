import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('🚀 Application Angular démarrée avec succès !'))
  .catch((err) => console.error('❌ Erreur lors du démarrage de l\'application :', err));
