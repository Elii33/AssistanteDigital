import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  stripePriceId: string; // ID du prix Stripe que vous créerez dans votre dashboard
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any = null;

  // IMPORTANT: Remplacez par votre clé publique Stripe
  // Vous la trouverez dans : https://dashboard.stripe.com/test/apikeys
  private readonly stripePublicKey = 'pk_test_51SawCGPrLh42XvioglaiRciq63gnu1Ms8X7x3vqMJ3XidLDQQJObby5VIeWU5stiOjlqqemABj470LWB6BlvOr3R00tiNzLNcI';

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    this.stripe = await loadStripe(this.stripePublicKey);
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

  async redirectToCheckout(planId: string): Promise<void> {
    const plan = this.pricingPlans.find(p => p.id === planId);

    if (!plan) {
      console.error('Plan non trouvé');
      alert('Plan non trouvé. Veuillez contacter le support.');
      return;
    }

    if (!this.stripe) {
      console.error('Stripe n\'est pas initialisé');
      alert('Erreur d\'initialisation du paiement. Veuillez réessayer.');
      return;
    }

    try {
      // Attendre que Stripe soit initialisé si nécessaire
      if (!this.stripe) {
        await this.initializeStripe();
      }

      // Vérification finale
      if (!this.stripe) {
        throw new Error('Impossible d\'initialiser Stripe');
      }

      // Appel au backend pour créer une session Stripe
      const response = await fetch('http://localhost:3000/api/create-checkout-session', {
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

  // Ouvrir le portail client Stripe pour gérer l'abonnement
  async openCustomerPortal(customerEmail: string): Promise<void> {
    if (!customerEmail || !customerEmail.trim()) {
      alert('Veuillez entrer votre adresse email.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/create-customer-portal-session', {
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
