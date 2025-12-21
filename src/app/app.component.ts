/**
 * ============================================================================
 * Elilouche Assistante Digitale - Landing Page
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * @author    nonodevco (https://nonodevco.com)
 * @license   Propriétaire - Reproduction et distribution interdites
 *
 * Ce code source est la propriété exclusive de nonodevco.
 * Toute reproduction, modification, distribution ou utilisation
 * non autorisée de ce code est strictement interdite.
 *
 * Développé avec Angular 18+ et Tailwind CSS
 * ============================================================================
 */

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { ServicesComponent } from './components/services/services.component';
import { ProcessComponent } from './components/process/process.component';
import { AboutComponent } from './components/about/about.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { BookingComponent } from './components/booking/booking.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
import { AboutStoryComponent } from './components/about-story/about-story.component';
import { SeoService } from './services/seo.service';
import { AnalyticsService } from './services/analytics.service';
import { WhoAmIComponent } from "./pages/who-am-i/who-am-i.component";
import { RecognitionComponent } from "./components/recognition/recognition.component";
import { SplashScreenComponent } from "./components/splash-screen/splash-screen.component";
import { ProcessReworkComponent } from "./components/process-rework/process-rework.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    AboutMeComponent,
    AboutStoryComponent,
    ServicesComponent,
    ProcessComponent,
    AboutComponent,
    TestimonialsComponent,
    BookingComponent,
    ContactComponent,
    FooterComponent,
    WhoAmIComponent,
    RecognitionComponent,
    SplashScreenComponent,
    ProcessReworkComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Mon Entreprise Landing';
  showSplash = true;
  private initialHash: string | null = null;

  constructor(
    private seoService: SeoService,
    private analyticsService: AnalyticsService
  ) {
    // Si l'URL contient un hash (ex: /#services), on skip le splash screen
    if (typeof window !== 'undefined' && window.location.hash) {
      this.showSplash = false;
      this.initialHash = window.location.hash.substring(1); // Enlève le #
    }
  }

  ngAfterViewInit(): void {
    // Si on a un hash initial, scroll vers la section après le rendu
    if (this.initialHash) {
      setTimeout(() => {
        const element = document.getElementById(this.initialHash!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Petit délai pour s'assurer que le DOM est prêt
    }
  }

  onEnterSite(): void {
    this.showSplash = false;
    // Scroll en haut de la page
    window.scrollTo(0, 0);
  }

  ngOnInit() {
    // Initialise Google Analytics 4 pour elisassist.com
    this.analyticsService.initialize({
      measurementId: 'G-DTNWB96R8W',
      debug: false
    });

    this.seoService.updateMetaTags({
      title: 'Assistante Virtuelle & Digitale | Automatisation Notion Make Canva',
      description: 'Assistante virtuelle & digitale spécialisée en automatisation avec Notion, Make, Zapier et Canva. Optimisez votre gestion administrative, réseaux sociaux et workflows. Gagnez du temps pour votre business.',
      keywords: 'assistante virtuelle, assistante digitale, automatisation, notion, make, zapier, canva, gestion administrative, réseaux sociaux, automation, workflow, productivité, freelance, gestion tâches, organisation digitale',
      author: 'Elis Assist',
      type: 'website',
      url: 'https://elisassist.com',
      image: 'https://elisassist.com/assets/og-image.jpg'
    });

    this.seoService.createStructuredData();
  }
}
