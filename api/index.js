/**
 * ============================================================================
 * ElisAssist - Backend API Server (Vercel Serverless)
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(
  process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : process.env.STRIPE_SECRET_KEY_TEST
);

// Import des services
const { sendEmail, notifyAdmin, emailTemplates } = require('./services/emailService');
const { generateInvoicePDF, generateInvoiceNumber } = require('./services/invoiceService');

const app = express();

// ====== MIDDLEWARE ======
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://elisassist.com',
  credentials: true
}));

// ====== CONFIGURATION DES PLANS ======
const pricingPlans = {
  essential: {
    priceId: process.env.PRICE_ID_ESSENTIAL,
    name: 'Pack Starter',
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
  }
};

// Configuration des services horaires
const hourlyServices = {
  admin: {
    priceId: process.env.PRICE_ID_HOURLY_ADMIN,
    name: 'Gestion Administrative',
    minHours: 1,
    maxHours: 40
  },
  automation: {
    priceId: process.env.PRICE_ID_HOURLY_AUTOMATION,
    name: 'Automatisation & Design',
    minHours: 1,
    maxHours: 40
  },
  social: {
    priceId: process.env.PRICE_ID_HOURLY_SOCIAL,
    name: 'Gestion Réseaux Sociaux',
    minHours: 1,
    maxHours: 40
  }
};

// Middleware JSON pour toutes les routes sauf webhook
app.use((req, res, next) => {
  if (req.path === '/api/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// ====== ROUTES API ======

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: process.env.STRIPE_MODE || 'test',
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString()
  });
});

// Route pour obtenir la clé publique Stripe
app.get('/api/stripe-config', (req, res) => {
  const publishableKey = process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.STRIPE_PUBLISHABLE_KEY_TEST;

  res.json({
    publishableKey,
    mode: process.env.STRIPE_MODE || 'test'
  });
});

// Route pour créer une session Stripe Checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;

    if (!planId || !pricingPlans[planId]) {
      return res.status(400).json({
        error: 'Plan invalide',
        availablePlans: Object.keys(pricingPlans)
      });
    }

    const plan = pricingPlans[planId];

    if (!plan.priceId) {
      return res.status(500).json({
        error: 'Prix non configuré pour ce plan. Vérifiez vos variables d\'environnement.'
      });
    }

    console.log(`Création de session pour le plan: ${plan.name} (${planId})`);

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: plan.mode,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/#services`,
      locale: 'fr',
      billing_address_collection: 'required',
      metadata: { planId: planId, planName: plan.name },
      ...(customerEmail && { customer_email: customerEmail })
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log(`Session créée avec succès: ${session.id}`);

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message
    });
  }
});

// Route pour créer une session de paiement horaire
app.post('/api/create-hourly-checkout-session', async (req, res) => {
  try {
    const { serviceId, hours, customerEmail } = req.body;

    if (!serviceId || !hourlyServices[serviceId]) {
      return res.status(400).json({
        error: 'Service invalide',
        availableServices: Object.keys(hourlyServices)
      });
    }

    const service = hourlyServices[serviceId];

    if (!hours || hours < service.minHours || hours > service.maxHours) {
      return res.status(400).json({
        error: `Le nombre d'heures doit être entre ${service.minHours} et ${service.maxHours}`
      });
    }

    if (!service.priceId) {
      return res.status(500).json({
        error: `Prix non configuré pour le service "${service.name}".`
      });
    }

    console.log(`Création de session horaire: ${service.name} - ${hours}h`);

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [{ price: service.priceId, quantity: hours }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&type=hourly`,
      cancel_url: `${process.env.FRONTEND_URL}/#services`,
      locale: 'fr',
      billing_address_collection: 'required',
      metadata: {
        type: 'hourly',
        serviceId: serviceId,
        serviceName: service.name,
        hours: hours.toString()
      },
      ...(customerEmail && { customer_email: customerEmail })
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    console.log(`Session horaire créée avec succès: ${session.id}`);

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Erreur lors de la création de la session horaire:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message
    });
  }
});

// Route pour récupérer les détails d'une session
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

// Route pour créer une session Customer Portal
app.post('/api/create-customer-portal-session', async (req, res) => {
  try {
    const { customerId, customerEmail } = req.body;

    let customer;

    if (customerId) {
      customer = { id: customerId };
    } else if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });

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

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.FRONTEND_URL}/#services`,
    });

    console.log(`Session Customer Portal créée: ${portalSession.id}`);

    res.json({ url: portalSession.url });

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

// Route pour obtenir les services horaires avec leurs prix depuis Stripe
app.get('/api/hourly-services', async (req, res) => {
  try {
    const servicesWithPrices = [];

    for (const [id, service] of Object.entries(hourlyServices)) {
      let hourlyRate = null;
      let configured = false;

      if (service.priceId) {
        try {
          const price = await stripe.prices.retrieve(service.priceId);
          hourlyRate = price.unit_amount / 100;
          configured = true;
        } catch (err) {
          console.error(`Erreur récupération prix pour ${id}:`, err.message);
        }
      }

      servicesWithPrices.push({
        id,
        name: service.name,
        hourlyRate,
        minHours: service.minHours,
        maxHours: service.maxHours,
        configured
      });
    }

    res.json({ services: servicesWithPrices });
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des services',
      details: error.message
    });
  }
});

// Route de test email
app.post('/api/test-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  const success = await sendEmail(
    email,
    'Test - Configuration Email',
    '<h2>✅ Configuration email réussie !</h2><p>Si vous recevez cet email, votre configuration nodemailer fonctionne correctement.</p>'
  );

  if (success) {
    res.json({ message: 'Email de test envoyé avec succès' });
  } else {
    res.status(500).json({ error: 'Échec de l\'envoi de l\'email' });
  }
});

// Route pour générer et télécharger une facture PDF
app.get('/api/invoice/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Récupérer les détails de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer']
    });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name || 'Client';
    const customerAddress = session.customer_details?.address
      ? `${session.customer_details.address.line1 || ''}\n${session.customer_details.address.postal_code || ''} ${session.customer_details.address.city || ''}\n${session.customer_details.address.country || ''}`
      : '';

    // Préparer les items de la facture
    const items = [];
    if (session.line_items?.data) {
      for (const item of session.line_items.data) {
        items.push({
          description: item.description || 'Service',
          quantity: item.quantity || 1,
          unitPrice: (item.amount_total / item.quantity) / 100,
          total: item.amount_total / 100
        });
      }
    }

    // Générer la facture PDF
    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      customerName,
      customerEmail,
      customerAddress,
      items,
      totalHT: session.amount_total / 100,
      date: new Date().toLocaleDateString('fr-FR')
    };

    const { filePath, fileName } = await generateInvoicePDF(invoiceData);

    // Envoyer le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fs = require('fs');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Supprimer le fichier après envoi
    fileStream.on('end', () => {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Erreur suppression fichier:', err);
      });
    });

  } catch (error) {
    console.error('Erreur génération facture:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de la facture',
      details: error.message
    });
  }
});

// Export pour Vercel Serverless
module.exports = app;
