import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateMetaTags(config: {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    type?: string;
    url?: string;
    image?: string;
    
  }) {
    // Title
    if (config.title) {
      this.title.setTitle(config.title);
      this.meta.updateTag({ property: 'og:title', content: config.title });
      this.meta.updateTag({ name: 'twitter:title', content: config.title });
    }

    // Description
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
      this.meta.updateTag({ name: 'twitter:description', content: config.description });
    }

    // Keywords
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Author
    if (config.author) {
      this.meta.updateTag({ name: 'author', content: config.author });
    }

    // Open Graph
    if (config.type) {
      this.meta.updateTag({ property: 'og:type', content: config.type });
    }

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
      this.meta.updateTag({ name: 'twitter:url', content: config.url });
    }

    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  createStructuredData() {
    if (isPlatformBrowser(this.platformId)) {
      // LocalBusiness Schema
      const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        'name': 'Assistante Virtuelle & Digitale - Automatisation & Productivité',
        'description': 'Assistante virtuelle et digitale spécialisée en automatisation avec Notion, Make, Zapier et Canva. Optimisation de votre gestion administrative et workflows pour TPE/PME.',
        'url': 'https://votresite.com',
        'telephone': '+33-X-XX-XX-XX-XX',
        'email': 'contact@votresite.com',
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': 'FR'
        },
        'priceRange': '€€',
        'areaServed': 'France',
        'serviceType': ['Automatisation Notion', 'Automatisation Make', 'Gestion administrative', 'Gestion réseaux sociaux', 'Organisation digitale'],
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '5',
          'reviewCount': '4'
        }
      };

      // Person Schema
      const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Assistante Digitale Pro',
        'jobTitle': 'Assistante Virtuelle & Digitale',
        'description': 'Assistante virtuelle et digitale experte en automatisation Notion, Make, Zapier et création visuelle Canva',
        'email': 'contact@votresite.com',
        'url': 'https://votresite.com',
        'sameAs': [
          'https://www.malt.fr/profile/votreprofil',
          'https://www.linkedin.com/in/votreprofil'
        ],
        'knowsAbout': [
          'Automatisation Notion',
          'Make (Integromat)',
          'Zapier',
          'Canva',
          'Gestion administrative',
          'Réseaux sociaux',
          'Organisation digitale',
          'Workflow automation'
        ]
      };

      // Service Schema
      const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'serviceType': 'Assistante Virtuelle & Digitale',
        'provider': {
          '@type': 'Person',
          'name': 'Assistante Digitale Pro'
        },
        'areaServed': 'France',
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'Services d\'assistance virtuelle et digitale',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Automatisation & Productivité',
                'description': 'Configuration Notion, automatisations Make/Zapier, optimisation workflows'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Gestion Administrative & Réseaux Sociaux',
                'description': 'Gestion administrative complète, création visuelle Canva, planification réseaux sociaux'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Accompagnement Personnalisé',
                'description': 'Formation outils digitaux, support continu et optimisations régulières'
              }
            }
          ]
        }
      };

      this.insertSchema(localBusinessSchema, 'local-business-schema');
      this.insertSchema(personSchema, 'person-schema');
      this.insertSchema(serviceSchema, 'service-schema');
    }
  }

  private insertSchema(schema: any, id: string) {
    if (isPlatformBrowser(this.platformId)) {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (script) {
        script.textContent = JSON.stringify(schema);
      } else {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      }
    }
  }

  generateSitemap() {
    // Cette méthode sera utilisée pour générer un sitemap.xml
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://votresite.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://votresite.com/#services</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://votresite.com/#about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://votresite.com/#testimonials</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://votresite.com/#contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
  }
}
