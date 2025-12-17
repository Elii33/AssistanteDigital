require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(
  process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : process.env.STRIPE_SECRET_KEY_TEST
);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logs pour debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Configuration des plans
const pricingPlans = {
  essential: {
    priceId: process.env.PRICE_ID_ESSENTIAL,
    name: 'Pack Essentiel',
    mode: 'subscription'
  },
  pro: {
    priceId: process.env.PRICE_ID_PRO,
    name: 'Pack Pro',
    mode: 'subscription'
  },
  premium: {
    priceId: process.env.PRICE_ID_PREMIUM,
    name: 'Pack Premium',
    mode: 'subscription'
  },
  hourly: {
    priceId: process.env.PRICE_ID_HOURLY,
    name: 'Tarif Horaire',
    mode: 'payment'
  }
};

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: process.env.STRIPE_MODE || 'test',
    timestamp: new Date().toISOString()
  });
});

// Route pour créer une session Stripe Checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;

    // Validation
    if (!planId || !pricingPlans[planId]) {
      return res.status(400).json({
        error: 'Plan invalide',
        availablePlans: Object.keys(pricingPlans)
      });
    }

    const plan = pricingPlans[planId];

    if (!plan.priceId) {
      return res.status(500).json({
        error: 'Prix non configuré pour ce plan. Vérifiez votre fichier .env'
      });
    }

    console.log(`Création de session pour le plan: ${plan.name} (${planId})`);

    // Configuration de la session Stripe
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: plan.mode,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/#services`,
      locale: 'fr',
      billing_address_collection: 'required',

      // Métadonnées pour tracking
      metadata: {
        planId: planId,
        planName: plan.name
      },

      // Permet de pré-remplir l'email si fourni
      ...(customerEmail && { customer_email: customerEmail })
    };

    // Pour les abonnements, ajouter un essai gratuit si souhaité
    if (plan.mode === 'subscription') {
      // sessionConfig.subscription_data = {
      //   trial_period_days: 7, // 7 jours d'essai gratuit
      // };
    }

    // Créer la session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Session créée avec succès: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url // URL de redirection vers Stripe
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message
    });
  }
});

// Route pour récupérer les détails d'une session (après paiement)
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total,
      currency: session.currency,
      planName: session.metadata?.planName
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des détails de la session',
      details: error.message
    });
  }
});

// Webhook Stripe (pour recevoir les notifications de paiement)
app.post('/api/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  Webhook secret non configuré');
    return res.sendStatus(400);
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Erreur webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents événements
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`✅ Paiement réussi pour la session: ${session.id}`);
      // TODO: Enregistrer dans votre base de données
      // TODO: Envoyer un email de confirmation
      break;

    case 'invoice.paid':
      console.log(`✅ Facture payée`);
      // TODO: Activer l'abonnement dans votre système
      break;

    case 'invoice.payment_failed':
      console.log(`❌ Échec de paiement`);
      // TODO: Notifier le client
      break;

    case 'customer.subscription.deleted':
      console.log(`❌ Abonnement annulé`);
      // TODO: Désactiver l'accès du client
      break;

    default:
      console.log(`Type d'événement non géré: ${event.type}`);
  }

  res.json({ received: true });
});

// Route pour créer une session Customer Portal (gestion abonnement)
app.post('/api/create-customer-portal-session', async (req, res) => {
  try {
    const { customerId, customerEmail } = req.body;

    let customer;

    // Si on a un customerId, on l'utilise directement
    if (customerId) {
      customer = { id: customerId };
    }
    // Sinon, on cherche le client par email
    else if (customerEmail) {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });

      if (customers.data.length === 0) {
        return res.status(404).json({
          error: 'Aucun client trouvé avec cet email',
          message: 'Veuillez utiliser l\'email associé à votre abonnement'
        });
      }

      customer = customers.data[0];
    } else {
      return res.status(400).json({
        error: 'Email ou ID client requis',
        message: 'Veuillez fournir votre email ou ID client'
      });
    }

    console.log(`Création de session Customer Portal pour: ${customer.id}`);

    // Créer la session du portail client
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.FRONTEND_URL}/#services`,
    });

    console.log(`Session Customer Portal créée: ${portalSession.id}`);

    res.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error('Erreur lors de la création du Customer Portal:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'accès au portail de gestion',
      details: error.message
    });
  }
});

// Route pour obtenir la liste des plans disponibles
app.get('/api/plans', (req, res) => {
  const plans = Object.entries(pricingPlans).map(([id, plan]) => ({
    id,
    name: plan.name,
    mode: plan.mode,
    configured: !!plan.priceId
  }));

  res.json({ plans });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(` Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💳 Mode Stripe: ${process.env.STRIPE_MODE || 'test'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Endpoints disponibles:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/plans');
  console.log('   POST /api/create-checkout-session');
  console.log('   GET  /api/checkout-session/:sessionId');
  console.log('   POST /api/create-customer-portal-session');
  console.log('   POST /api/webhook');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});
