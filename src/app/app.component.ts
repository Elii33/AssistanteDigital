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

import { Component, OnInit } from '@angular/core';
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
import { WhoAmIComponent } from "./pages/who-am-i/who-am-i.component";
import { RecognitionComponent } from "./components/recognition/recognition.component";

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
    RecognitionComponent
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Mon Entreprise Landing';

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Assistante Virtuelle & Digitale | Automatisation Notion Make Canva',
      description: 'Assistante virtuelle & digitale spécialisée en automatisation avec Notion, Make, Zapier et Canva. Optimisez votre gestion administrative, réseaux sociaux et workflows. Gagnez du temps pour votre business.',
      keywords: 'assistante virtuelle, assistante digitale, automatisation, notion, make, zapier, canva, gestion administrative, réseaux sociaux, automation, workflow, productivité, freelance, gestion tâches, organisation digitale',
      author: 'Assistante Digitale Pro',
      type: 'website',
      url: 'https://votresite.com',
      image: 'https://votresite.com/assets/og-image.jpg'
    });

    this.seoService.createStructuredData();
  }
}
