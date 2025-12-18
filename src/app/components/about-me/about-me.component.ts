/**
 * ============================================================================
 * Elilouche Assistante Digitale - Composant About Me
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * @author    nonodevco (https://nonodevco.com)
 * @license   Propriétaire - Reproduction et distribution interdites
 *
 * ============================================================================
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css'
})
export class AboutMeComponent {

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
