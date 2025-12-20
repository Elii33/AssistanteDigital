/**
 * ============================================================================
 * Elilouche Assistante Digitale - Configuration des routes
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * @author    nonodevco (https://nonodevco.com)
 * @license   Propriétaire - Reproduction et distribution interdites
 *
 * ============================================================================
 */

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { WhoAmIComponent } from './pages/who-am-i/who-am-i.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'qui-suis-je',
    component: WhoAmIComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
