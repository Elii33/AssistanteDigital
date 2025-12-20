/**
 * ============================================================================
 * Service Google Analytics 4
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * ============================================================================
 */

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export interface AnalyticsConfig {
  measurementId: string;
  debug?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private initialized = false;
  private measurementId = 'G-XXXXXXXXXX'; // Remplacer par ton ID GA4

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  /**
   * Initialise Google Analytics 4
   */
  initialize(config?: AnalyticsConfig): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return;
    }

    if (config?.measurementId) {
      this.measurementId = config.measurementId;
    }

    // Charge le script GA4
    this.loadGtagScript();

    // Configure gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      send_page_view: false, // On gère manuellement
      debug_mode: config?.debug || false
    });

    // Track les changements de route
    this.trackPageViews();

    this.initialized = true;
    console.log('Google Analytics 4 initialisé avec ID:', this.measurementId);
  }

  /**
   * Charge le script gtag.js
   */
  private loadGtagScript(): void {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);
  }

  /**
   * Track automatiquement les pages vues
   */
  private trackPageViews(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.trackPageView(event.urlAfterRedirects);
    });
  }

  /**
   * Envoie un événement de page vue
   */
  trackPageView(path: string, title?: string): void {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    });
  }

  /**
   * Envoie un événement personnalisé
   */
  trackEvent(eventName: string, params?: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) return;

    window.gtag('event', eventName, params);
  }

  /**
   * Track un clic sur un bouton CTA
   */
  trackCTAClick(ctaName: string, location?: string): void {
    this.trackEvent('cta_click', {
      cta_name: ctaName,
      cta_location: location || 'unknown'
    });
  }

  /**
   * Track une soumission de formulaire
   */
  trackFormSubmission(formName: string, success: boolean): void {
    this.trackEvent('form_submission', {
      form_name: formName,
      success: success
    });
  }

  /**
   * Track le scroll depth
   */
  trackScrollDepth(percentage: number): void {
    this.trackEvent('scroll_depth', {
      depth_percentage: percentage
    });
  }

  /**
   * Track le temps passé sur une section
   */
  trackSectionEngagement(sectionName: string, timeSpent: number): void {
    this.trackEvent('section_engagement', {
      section_name: sectionName,
      time_spent_seconds: timeSpent
    });
  }

  /**
   * Track une recherche interne
   */
  trackSearch(searchTerm: string, resultsCount?: number): void {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  /**
   * Track un téléchargement
   */
  trackDownload(fileName: string, fileType: string): void {
    this.trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    });
  }

  /**
   * Track un clic sur un lien externe
   */
  trackOutboundLink(url: string): void {
    this.trackEvent('outbound_click', {
      link_url: url
    });
  }

  /**
   * Track une conversion (prise de RDV, contact, etc.)
   */
  trackConversion(conversionType: string, value?: number): void {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value: value
    });
  }

  /**
   * Définit les propriétés utilisateur
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId) || !this.initialized) return;

    window.gtag('set', 'user_properties', properties);
  }
}
