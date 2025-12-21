/**
 * ============================================================================
 * Elilouche Assistante Digitale - Backend API Server
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
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const stripe = require('stripe')(
  process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : process.env.STRIPE_SECRET_KEY_TEST
);

// Import des services
const { sendEmail, notifyAdmin, emailTemplates } = require('./services/emailService');
const { generateInvoiceNumber, generateInvoicePDF, invoicesDir } = require('./services/invoiceService');

const app = express();
const PORT = process.env.PORT || 3000;

// ====== MIDDLEWARE ======
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// IMPORTANT: Le webhook doit recevoir le body brut AVANT le parsing JSON
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_WEBHOOK_SECRET_LIVE
    : process.env.STRIPE_WEBHOOK_SECRET_TEST;

  if (!webhookSecret) {
    console.warn('⚠️  Webhook secret non configuré - Mode développement');
  }

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`❌ Erreur webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Webhook reçu: ${event.type}`);

  // Gérer les différents événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email || session.customer_email;
        const amount = session.amount_total;

        // Générer l'URL de la facture
        const invoiceUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/invoice/${session.id}`;

        // Vérifier si c'est un paiement horaire ou un abonnement
        if (session.metadata?.type === 'hourly') {
          const serviceName = session.metadata.serviceName;
          const hours = session.metadata.hours;
          const hourlyRate = (amount / 100) / parseInt(hours);
          const total = amount / 100;

          console.log(`✅ Paiement horaire réussi pour: ${customerEmail} - ${hours}h de ${serviceName}`);

          await sendEmail(
            customerEmail,
            `🎉 Confirmation de votre commande - ${hours}h de ${serviceName}`,
            emailTemplates.hourlyPaymentClient(customerEmail, serviceName, hours, hourlyRate.toFixed(2), total.toFixed(2), invoiceUrl)
          );

          await notifyAdmin(
            `💰 Nouveau paiement horaire: ${hours}h de ${serviceName}`,
            emailTemplates.adminHourlyPayment(customerEmail, serviceName, hours, hourlyRate.toFixed(2), total.toFixed(2))
          );
        } else {
          const planName = session.metadata?.planName || 'Abonnement';

          console.log(`✅ Paiement réussi pour: ${customerEmail}`);

          await sendEmail(
            customerEmail,
            '🎉 Bienvenue ! Votre abonnement est activé',
            emailTemplates.subscriptionCreated(customerEmail, planName, amount, invoiceUrl)
          );

          await notifyAdmin(
            `🎉 Nouvel abonnement: ${planName}`,
            emailTemplates.adminNewSubscription(customerEmail, planName, amount)
          );
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log(`✅ Facture payée: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;
        const planName = invoice.lines?.data[0]?.description || 'Abonnement';

        console.log(`❌ Échec de paiement pour: ${customerEmail}`);

        if (customerEmail) {
          await sendEmail(
            customerEmail,
            '⚠️ Problème avec votre paiement',
            emailTemplates.paymentFailed(customerEmail, planName)
          );
        }

        await notifyAdmin(
          `⚠️ Échec paiement: ${customerEmail}`,
          `<p>Échec de paiement pour ${customerEmail}</p><p>Plan: ${planName}</p>`
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);
        const customerEmail = customer.email;
        const planName = subscription.items?.data[0]?.price?.nickname || 'Abonnement';

        console.log(`❌ Abonnement annulé pour: ${customerEmail}`);

        if (customerEmail) {
          await sendEmail(
            customerEmail,
            'Confirmation d\'annulation de votre abonnement',
            emailTemplates.subscriptionCancelled(customerEmail, planName)
          );
        }

        await notifyAdmin(
          `❌ Annulation: ${customerEmail}`,
          emailTemplates.adminCancellation(customerEmail, planName)
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`📝 Abonnement mis à jour: ${subscription.id}`);

        if (subscription.cancel_at_period_end) {
          const customer = await stripe.customers.retrieve(subscription.customer);
          console.log(`⏳ Annulation programmée pour: ${customer.email}`);

          await notifyAdmin(
            `⏳ Annulation programmée: ${customer.email}`,
            `<p>Le client ${customer.email} a programmé l'annulation de son abonnement.</p>
             <p>L'abonnement restera actif jusqu'à la fin de la période de facturation.</p>`
          );
        }
        break;
      }

      default:
        console.log(`Type d'événement non géré: ${event.type}`);
    }
  } catch (error) {
    console.error(`Erreur lors du traitement du webhook: ${error.message}`);
  }

  res.json({ received: true });
});

// Middleware JSON pour les autres routes (APRÈS le webhook)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logs pour debug
app.use((req, res, next) => {
  if (req.path !== '/api/webhook') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// ====== HELPER POUR LE MODE TEST/LIVE ======
const isLiveMode = process.env.STRIPE_MODE === 'live';
const getPriceId = (testKey, liveKey) => isLiveMode ? process.env[liveKey] : process.env[testKey];

// ====== CONFIGURATION DES PLANS ======
const pricingPlans = {
  essential: {
    priceId: getPriceId('PRICE_ID_ESSENTIAL_TEST', 'PRICE_ID_ESSENTIAL_LIVE'),
    name: 'Pack Starter',
    mode: 'subscription'
  },
  pro: {
    priceId: getPriceId('PRICE_ID_PRO_TEST', 'PRICE_ID_PRO_LIVE'),
    name: 'Pack Pro',
    mode: 'subscription'
  },
  premium: {
    priceId: getPriceId('PRICE_ID_PREMIUM_TEST', 'PRICE_ID_PREMIUM_LIVE'),
    name: 'Pack Premium',
    mode: 'subscription'
  }
};

// Configuration des services horaires
const hourlyServices = {
  admin: {
    priceId: getPriceId('PRICE_ID_HOURLY_ADMIN_TEST', 'PRICE_ID_HOURLY_ADMIN_LIVE'),
    name: 'Gestion Administrative',
    minHours: 1,
    maxHours: 40
  },
  automation: {
    priceId: getPriceId('PRICE_ID_HOURLY_AUTOMATION_TEST', 'PRICE_ID_HOURLY_AUTOMATION_LIVE'),
    name: 'Automatisation & Design',
    minHours: 1,
    maxHours: 40
  },
  social: {
    priceId: getPriceId('PRICE_ID_HOURLY_SOCIAL_TEST', 'PRICE_ID_HOURLY_SOCIAL_LIVE'),
    name: 'Gestion Réseaux Sociaux',
    minHours: 1,
    maxHours: 40
  }
};

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
        error: 'Prix non configuré pour ce plan. Vérifiez votre fichier .env'
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

    if (!service.priceId || service.priceId.includes('VOTRE_PRICE_ID')) {
      return res.status(500).json({
        error: `Prix non configuré pour le service "${service.name}". Configurez PRICE_ID_HOURLY_${serviceId.toUpperCase()} dans le fichier .env`
      });
    }

    console.log(`Création de session horaire: ${service.name} - ${hours}h (Price ID: ${service.priceId})`);

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

      if (service.priceId && !service.priceId.includes('VOTRE_PRICE_ID')) {
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

// Route pour générer et télécharger une facture PDF
app.get('/api/invoice/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details']
    });

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        error: 'Paiement non complété',
        message: 'La facture ne peut être générée que pour un paiement complété'
      });
    }

    const invoiceNumber = generateInvoiceNumber();
    const customerDetails = session.customer_details || {};
    const customerAddress = customerDetails.address
      ? `${customerDetails.address.line1 || ''}\n${customerDetails.address.postal_code || ''} ${customerDetails.address.city || ''}\n${customerDetails.address.country || ''}`
      : '';

    const items = [];
    let totalHT = 0;

    if (session.metadata?.type === 'hourly') {
      const hours = parseInt(session.metadata.hours) || 1;
      const serviceName = session.metadata.serviceName || 'Prestation horaire';
      const unitPrice = (session.amount_total / 100) / hours;

      items.push({
        description: serviceName,
        quantity: hours,
        unitPrice: unitPrice,
        total: session.amount_total / 100
      });
      totalHT = session.amount_total / 100;
    } else {
      const planName = session.metadata?.planName || 'Abonnement';
      items.push({
        description: planName,
        quantity: 1,
        unitPrice: session.amount_total / 100,
        total: session.amount_total / 100
      });
      totalHT = session.amount_total / 100;
    }

    const invoiceData = {
      invoiceNumber,
      customerName: customerDetails.name || 'Client',
      customerEmail: customerDetails.email || session.customer_email,
      customerAddress,
      items,
      totalHT,
      date: new Date().toLocaleDateString('fr-FR')
    };

    const { filePath, fileName } = await generateInvoicePDF(invoiceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Erreur suppression facture:', err);
        });
      }, 5000);
    });

  } catch (error) {
    console.error('Erreur génération facture:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de la facture',
      details: error.message
    });
  }
});

// Route pour générer une facture manuellement (admin)
app.post('/api/generate-invoice', async (req, res) => {
  try {
    const { customerName, customerEmail, customerAddress, items, date } = req.body;

    if (!customerEmail || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['customerEmail', 'items']
      });
    }

    const invoiceNumber = generateInvoiceNumber();
    const totalHT = items.reduce((sum, item) => sum + (item.total || item.quantity * item.unitPrice), 0);

    const invoiceData = {
      invoiceNumber,
      customerName: customerName || 'Client',
      customerEmail,
      customerAddress: customerAddress || '',
      items: items.map(item => ({
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        total: item.total || item.quantity * item.unitPrice
      })),
      totalHT,
      date: date || new Date().toLocaleDateString('fr-FR')
    };

    const { filePath, fileName } = await generateInvoicePDF(invoiceData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Erreur suppression facture:', err);
        });
      }, 5000);
    });

  } catch (error) {
    console.error('Erreur génération facture manuelle:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de la facture',
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

// ====== DÉMARRAGE DU SERVEUR ======
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💳 Mode Stripe: ${process.env.STRIPE_MODE || 'test'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
  console.log(`👤 Admin Email: ${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}`);
  console.log(`🔗 Webhook secret: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅' : '❌'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Endpoints disponibles:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/plans');
  console.log('   GET  /api/hourly-services');
  console.log('   POST /api/create-checkout-session');
  console.log('   POST /api/create-hourly-checkout-session');
  console.log('   GET  /api/checkout-session/:sessionId');
  console.log('   POST /api/create-customer-portal-session');
  console.log('   GET  /api/invoice/:sessionId');
  console.log('   POST /api/generate-invoice');
  console.log('   POST /api/webhook');
  console.log('   POST /api/test-email');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});
