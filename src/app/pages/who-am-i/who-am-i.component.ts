/**
 * ============================================================================
 * Elilouche Assistante Digitale - Page Qui suis-je
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * @author    nonodevco (https://nonodevco.com)
 * @license   Propriétaire - Reproduction et distribution interdites
 *
 * ============================================================================
 */

import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface JourneyCard {
  id: number;
  period: string;
  title: string;
  frontText: string;
  backText: string;
  icon: string;
  isFlipped: boolean;
}

@Component({
  selector: 'app-who-am-i',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './who-am-i.component.html',
  styleUrl: './who-am-i.component.css'
})
export class WhoAmIComponent implements OnInit, OnDestroy {

  journeyCards: JourneyCard[] = [
    {
      id: 1,
      period: 'Le début',
      title: 'Tout faire seule',
      frontText: 'Je faisais tout moi-même. Je testais, je bidouillais, j\'empilais les outils.',
      backText: 'Sans vraie structure durable. J\'avais l\'impression d\'avancer… mais jamais sereinement.',
      icon: '🌱',
      isFlipped: false
    },
    {
      id: 2,
      period: 'La prise de conscience',
      title: 'Comprendre le digital',
      frontText: 'À force de chercher des solutions, j\'ai commencé à comprendre les outils digitaux.',
      backText: 'Pas comme des gadgets, mais comme des leviers pour alléger le quotidien et clarifier les décisions.',
      icon: '💡',
      isFlipped: false
    },
    {
      id: 3,
      period: 'L\'apprentissage',
      title: 'Créer mes systèmes',
      frontText: 'J\'ai appris à organiser mes idées et automatiser ce qui pouvait l\'être.',
      backText: 'Des systèmes simples, adaptés à mon fonctionnement — pas l\'inverse.',
      icon: '⚙️',
      isFlipped: false
    },
    {
      id: 4,
      period: 'Aujourd\'hui',
      title: 'À ton service',
      frontText: 'Je mets cette expérience au service de projets qui ont besoin de clarté.',
      backText: 'Pas pour tout révolutionner, mais pour faire fonctionner ce qui existe déjà, sans surcharger.',
      icon: '✨',
      isFlipped: false
    }
  ];

  private scrollHandler: (() => void) | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.scrollHandler = () => this.checkCardsVisibility();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    // Initial check
    setTimeout(() => this.checkCardsVisibility(), 100);
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private checkCardsVisibility(): void {
    const cards = this.elementRef.nativeElement.querySelectorAll('.journey-card');

    cards.forEach((card: Element, index: number) => {
      const rect = card.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Flip la carte quand elle est visible à 40% dans la fenêtre
      const visibilityThreshold = windowHeight * 0.6;

      if (rect.top < visibilityThreshold && rect.bottom > 0) {
        if (!this.journeyCards[index].isFlipped) {
          // Ajouter un délai pour un effet cascade
          setTimeout(() => {
            this.journeyCards[index].isFlipped = true;
          }, index * 150);
        }
      }
    });
  }

  toggleCard(index: number): void {
    this.journeyCards[index].isFlipped = !this.journeyCards[index].isFlipped;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goBack(): void {
    this.scrollToSection('hero');
  }

  goToContact(): void {
    this.scrollToSection('contact');
  }

  goToBooking(): void {
    this.scrollToSection('booking');
  }
}
