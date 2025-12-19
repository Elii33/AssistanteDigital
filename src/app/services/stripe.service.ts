import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  stripePriceId: string;
  description: string;
}

export interface HourlyService {
  id: string;
  name: string;
  hourlyRate: number | null;
  minHours: number;
  maxHours: number;
  configured: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any = null;
  private stripeInitPromise: Promise<void> | null = null;

  // URL de l'API backend
  // En production sur Vercel, l'API est sur le même domaine (/api/...)
  // En local, utiliser http://localhost:3000
  private readonly apiUrl = this.isProduction() ? '' : 'http://localhost:3000';

  private isProduction(): boolean {
    return window.location.hostname === 'elisassist.com' || window.location.hostname.includes('vercel.app');
  }

  constructor() {
    this.stripeInitPromise = this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      // Récupérer la clé publique depuis l'API
      const response = await fetch(`${this.apiUrl}/api/stripe-config`);
      if (!response.ok) {
        throw new Error('Impossible de récupérer la configuration Stripe');
      }
      const config = await response.json();
      this.stripe = await loadStripe(config.publishableKey);
      console.log(`Stripe initialisé en mode: ${config.mode}`);
    } catch (error) {
      console.error('Erreur initialisation Stripe:', error);
      // Fallback sur la clé de test en cas d'erreur
      this.stripe = await loadStripe('pk_test_51SfLq4K0M4NmGmuGldL3m0KAVZPUwnkLOWZ4BCtEDBIJrJppu3VcmvpNkDnUM9JXBLigeg5tJq9k3opAm6dgZUUK00QyRhJ6Kg');
    }
  }

  private async ensureStripeInitialized(): Promise<void> {
    if (this.stripeInitPromise) {
      await this.stripeInitPromise;
    }
  }

  // Plans avec leurs prix Stripe
  // Vous devrez créer ces prix dans votre Dashboard Stripe
  private pricingPlans: PricingPlan[] = [
    {
      id: 'hourly',
      name: 'Tarif Horaire',
      price: 45,
      stripePriceId: 'price_VOTRE_PRICE_ID_HORAIRE', // À remplacer
      description: 'Facturation à l\'heure'
    },
    {
      id: 'essential',
      name: 'Pack Essentiel',
      price: 450,
      stripePriceId: 'price_VOTRE_PRICE_ID_ESSENTIAL', // À remplacer
      description: '10h/mois - Idéal pour démarrer'
    },
    {
      id: 'pro',
      name: 'Pack Pro',
      price: 850,
      stripePriceId: 'price_VOTRE_PRICE_ID_PRO', // À remplacer
      description: '20h/mois - Pour une collaboration régulière'
    },
    {
      id: 'premium',
      name: 'Pack Premium',
      price: 1500,
      stripePriceId: 'price_VOTRE_PRICE_ID_PREMIUM', // À remplacer
      description: '40h/mois - Assistance dédiée complète'
    }
  ];

  getPricingPlans(): PricingPlan[] {
    return this.pricingPlans;
  }

  // Récupérer les services horaires avec leurs prix depuis Stripe
  async getHourlyServices(): Promise<HourlyService[]> {
    try {
      const response = await fetch(`${this.apiUrl}/api/hourly-services`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des services');
      }
      const data = await response.json();
      return data.services;
    } catch (error) {
      console.error('Erreur lors de la récupération des services horaires:', error);
      return [];
    }
  }

  async redirectToCheckout(planId: string): Promise<void> {
    const plan = this.pricingPlans.find(p => p.id === planId);

    if (!plan) {
      console.error('Plan non trouvé');
      alert('Plan non trouvé. Veuillez contacter le support.');
      return;
    }

    try {
      // Attendre que Stripe soit initialisé
      await this.ensureStripeInitialized();

      if (!this.stripe) {
        throw new Error('Impossible d\'initialiser Stripe');
      }

      // Appel au backend pour créer une session Stripe
      const response = await fetch(`${this.apiUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la session');
      }

      const session = await response.json();

      // Redirection vers Stripe Checkout via l'URL de session
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de session manquante');
      }
    } catch (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}.\n\nAssurez-vous que le serveur backend est démarré (npm start dans le dossier backend).`);
    }
  }

  // Méthode alternative: créer une session de paiement via votre backend
  // Cette méthode est plus sécurisée et recommandée pour la production
  async createCheckoutSession(planId: string): Promise<void> {
    const plan = this.pricingPlans.find(p => p.id === planId);

    if (!plan) {
      console.error('Plan non trouvé');
      return;
    }

    // TODO: Appeler votre API backend pour créer une session Stripe
    // Example:
    /*
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: plan.stripePriceId,
        planId: plan.id
      })
    });

    const session = await response.json();

    if (this.stripe) {
      await this.stripe.redirectToCheckout({
        sessionId: session.id
      });
    }
    */

    console.log('Backend non configuré. Utilisez redirectToCheckout() pour les tests.');
  }

  // Paiement horaire - permet de payer un nombre d'heures spécifique pour un service
  // Le prix est récupéré depuis Stripe (pas besoin de le passer en paramètre)
  async redirectToHourlyCheckout(
    serviceId: string,
    hours: number
  ): Promise<void> {
    try {
      // Attendre que Stripe soit initialisé
      await this.ensureStripeInitialized();

      if (!this.stripe) {
        throw new Error('Impossible d\'initialiser Stripe');
      }

      // Appel au backend pour créer une session de paiement horaire
      const response = await fetch(`${this.apiUrl}/api/create-hourly-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          hours
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la session');
      }

      const session = await response.json();

      // Redirection vers Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('URL de session manquante');
      }
    } catch (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}.\n\nAssurez-vous que le serveur backend est démarré (npm start dans le dossier backend).`);
    }
  }

  // Ouvrir le portail client Stripe pour gérer l'abonnement
  async openCustomerPortal(customerEmail: string): Promise<void> {
    if (!customerEmail || !customerEmail.trim()) {
      alert('Veuillez entrer votre adresse email.');
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/create-customer-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: customerEmail.trim() })
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 404) {
          alert('Aucun abonnement trouvé avec cet email. Vérifiez l\'adresse utilisée lors de votre souscription.');
        } else {
          throw new Error(error.error || 'Erreur lors de l\'accès au portail');
        }
        return;
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du portail client:', error);
      alert(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}.\n\nAssurez-vous que le serveur backend est démarré.`);
    }
  }
}
