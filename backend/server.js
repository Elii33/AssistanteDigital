require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(
  process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : process.env.STRIPE_SECRET_KEY_TEST
);

const app = express();
const PORT = process.env.PORT || 3000;

// ====== CONFIGURATION EMAIL ======
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // Mot de passe d'application Gmail
  }
});

// Fonction pour envoyer un email
async function sendEmail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: `"Assistante Digitale" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email envoyé: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}

// Fonction pour notifier l'admin (vous)
async function notifyAdmin(subject, message) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  await sendEmail(adminEmail, subject, message);
}

// Templates d'emails
const emailTemplates = {
  subscriptionCreated: (customerEmail, planName, amount) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ca8a04;">🎉 Nouvel abonnement !</h2>
      <p>Bonjour,</p>
      <p>Merci pour votre confiance ! Votre abonnement <strong>${planName}</strong> est maintenant actif.</p>
      <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>Détails de votre abonnement :</strong></p>
        <ul>
          <li>Formule : ${planName}</li>
          <li>Montant : ${(amount / 100).toFixed(2)}€/mois</li>
        </ul>
      </div>
      <p>Je vous contacterai très prochainement pour démarrer notre collaboration.</p>
      <p>À très bientôt !</p>
      <p style="color: #666;">— Elisa, Assistante Digitale</p>
    </div>
  `,

  subscriptionCancelled: (customerEmail, planName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ca8a04;">Confirmation d'annulation</h2>
      <p>Bonjour,</p>
      <p>Votre abonnement <strong>${planName}</strong> a bien été annulé.</p>
      <p>Merci pour la confiance que vous m'avez accordée. N'hésitez pas à revenir si vous avez besoin d'aide à l'avenir !</p>
      <p>Si vous avez des questions ou souhaitez partager votre retour d'expérience, je reste disponible.</p>
      <p style="color: #666;">— Elisa, Assistante Digitale</p>
    </div>
  `,

  paymentFailed: (customerEmail, planName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Échec de paiement</h2>
      <p>Bonjour,</p>
      <p>Le paiement pour votre abonnement <strong>${planName}</strong> n'a pas pu être effectué.</p>
      <p>Veuillez vérifier vos informations de paiement pour éviter l'interruption de votre service.</p>
      <p><a href="${process.env.FRONTEND_URL}/#services" style="background: #ca8a04; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Mettre à jour mes informations</a></p>
      <p style="color: #666;">— Elisa, Assistante Digitale</p>
    </div>
  `,

  adminNewSubscription: (customerEmail, planName, amount) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">🎉 Nouvel abonnement client !</h2>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 10px;">
        <p><strong>Client :</strong> ${customerEmail}</p>
        <p><strong>Formule :</strong> ${planName}</p>
        <p><strong>Montant :</strong> ${(amount / 100).toFixed(2)}€/mois</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
      <p>Pensez à contacter le client pour démarrer la collaboration !</p>
    </div>
  `,

  adminCancellation: (customerEmail, planName) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">❌ Annulation d'abonnement</h2>
      <div style="background: #fef2f2; padding: 20px; border-radius: 10px;">
        <p><strong>Client :</strong> ${customerEmail}</p>
        <p><strong>Formule annulée :</strong> ${planName}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
      <p>Vous pouvez contacter le client pour comprendre les raisons de l'annulation.</p>
    </div>
  `,

  // Templates pour paiement horaire
  hourlyPaymentClient: (customerEmail, serviceName, hours, hourlyRate, total) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ca8a04;">🎉 Merci pour votre commande !</h2>
      <p>Bonjour,</p>
      <p>Votre paiement a bien été reçu. Voici le récapitulatif :</p>
      <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p><strong>Service :</strong> ${serviceName}</p>
        <p><strong>Nombre d'heures :</strong> ${hours}h</p>
        <p><strong>Tarif horaire :</strong> ${hourlyRate}€/h</p>
        <p><strong>Total payé :</strong> ${total}€</p>
      </div>
      <p>Je vous contacterai très prochainement pour organiser notre collaboration et planifier les heures de travail.</p>
      <p>À très bientôt !</p>
      <p style="color: #666;">— Elisa, Assistante Digitale</p>
    </div>
  `,

  adminHourlyPayment: (customerEmail, serviceName, hours, hourlyRate, total) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">💰 Nouveau paiement horaire !</h2>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 10px;">
        <p><strong>Client :</strong> ${customerEmail}</p>
        <p><strong>Service :</strong> ${serviceName}</p>
        <p><strong>Heures achetées :</strong> ${hours}h</p>
        <p><strong>Tarif :</strong> ${hourlyRate}€/h</p>
        <p><strong>Total :</strong> ${total}€</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
      </div>
      <p>Pensez à contacter le client pour planifier les heures de travail !</p>
    </div>
  `
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// IMPORTANT: Le webhook doit recevoir le body brut AVANT le parsing JSON
// On doit donc le mettre avant le middleware bodyParser.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  Webhook secret non configuré - Mode développement');
    // En mode dev, on peut quand même traiter les événements
  }

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Mode développement sans vérification de signature
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

        // Vérifier si c'est un paiement horaire ou un abonnement
        if (session.metadata?.type === 'hourly') {
          // Paiement horaire
          const serviceName = session.metadata.serviceName;
          const hours = session.metadata.hours;
          const hourlyRate = session.metadata.hourlyRate;
          const total = session.metadata.totalAmount;

          console.log(`✅ Paiement horaire réussi pour: ${customerEmail} - ${hours}h de ${serviceName}`);

          // Email au client
          await sendEmail(
            customerEmail,
            `🎉 Confirmation de votre commande - ${hours}h de ${serviceName}`,
            emailTemplates.hourlyPaymentClient(customerEmail, serviceName, hours, hourlyRate, total)
          );

          // Email à l'admin
          await notifyAdmin(
            `💰 Nouveau paiement horaire: ${hours}h de ${serviceName}`,
            emailTemplates.adminHourlyPayment(customerEmail, serviceName, hours, hourlyRate, total)
          );
        } else {
          // Abonnement classique
          const planName = session.metadata?.planName || 'Abonnement';

          console.log(`✅ Paiement réussi pour: ${customerEmail}`);

          // Email au client
          await sendEmail(
            customerEmail,
            '🎉 Bienvenue ! Votre abonnement est activé',
            emailTemplates.subscriptionCreated(customerEmail, planName, amount)
          );

          // Email à l'admin
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
        // Les renouvellements automatiques
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;
        const planName = invoice.lines?.data[0]?.description || 'Abonnement';

        console.log(`❌ Échec de paiement pour: ${customerEmail}`);

        // Email au client
        if (customerEmail) {
          await sendEmail(
            customerEmail,
            '⚠️ Problème avec votre paiement',
            emailTemplates.paymentFailed(customerEmail, planName)
          );
        }

        // Notification admin
        await notifyAdmin(
          `⚠️ Échec paiement: ${customerEmail}`,
          `<p>Échec de paiement pour ${customerEmail}</p><p>Plan: ${planName}</p>`
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Récupérer les infos du client
        const customer = await stripe.customers.retrieve(subscription.customer);
        const customerEmail = customer.email;
        const planName = subscription.items?.data[0]?.price?.nickname || 'Abonnement';

        console.log(`❌ Abonnement annulé pour: ${customerEmail}`);

        // Email au client
        if (customerEmail) {
          await sendEmail(
            customerEmail,
            'Confirmation d\'annulation de votre abonnement',
            emailTemplates.subscriptionCancelled(customerEmail, planName)
          );
        }

        // Notification admin
        await notifyAdmin(
          `❌ Annulation: ${customerEmail}`,
          emailTemplates.adminCancellation(customerEmail, planName)
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`📝 Abonnement mis à jour: ${subscription.id}`);

        // Vérifier si l'abonnement est prévu pour annulation
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

// Configuration des plans
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
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
    webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
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

    // Créer la session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Session créée avec succès: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    res.status(500).json({
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message
    });
  }
});

// Route pour créer une session de paiement horaire (paiement unique)
app.post('/api/create-hourly-checkout-session', async (req, res) => {
  try {
    const { serviceId, serviceName, hourlyRate, hours, customerEmail } = req.body;

    // Validation
    if (!serviceId || !serviceName || !hourlyRate || !hours) {
      return res.status(400).json({
        error: 'Données manquantes',
        required: ['serviceId', 'serviceName', 'hourlyRate', 'hours']
      });
    }

    if (hours < 1 || hours > 40) {
      return res.status(400).json({
        error: 'Le nombre d\'heures doit être entre 1 et 40'
      });
    }

    // Calcul du montant total en centimes
    const totalAmount = Math.round(hourlyRate * hours * 100);

    console.log(`Création de session horaire: ${serviceName} - ${hours}h x ${hourlyRate}€ = ${totalAmount / 100}€`);

    // Configuration de la session Stripe (paiement unique)
    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${serviceName} - ${hours}h`,
              description: `${hours} heure(s) de ${serviceName} à ${hourlyRate}€/h`,
            },
            unit_amount: totalAmount, // Montant total en centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Paiement unique (pas abonnement)
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}&type=hourly`,
      cancel_url: `${process.env.FRONTEND_URL}/#services`,
      locale: 'fr',
      billing_address_collection: 'required',

      // Métadonnées pour tracking
      metadata: {
        type: 'hourly',
        serviceId: serviceId,
        serviceName: serviceName,
        hourlyRate: hourlyRate.toString(),
        hours: hours.toString(),
        totalAmount: (totalAmount / 100).toString()
      },

      // Permet de pré-remplir l'email si fourni
      ...(customerEmail && { customer_email: customerEmail })
    };

    // Créer la session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`Session horaire créée avec succès: ${session.id}`);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Erreur lors de la création de la session horaire:', error);
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

// Route pour créer une session Customer Portal (gestion abonnement)
app.post('/api/create-customer-portal-session', async (req, res) => {
  try {
    const { customerId, customerEmail } = req.body;

    let customer;

    if (customerId) {
      customer = { id: customerId };
    }
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

// Route de test email (pour vérifier la configuration)
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`💳 Mode Stripe: ${process.env.STRIPE_MODE || 'test'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
  console.log(`🔗 Webhook secret: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅' : '❌'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Endpoints disponibles:');
  console.log('   GET  /api/health');
  console.log('   GET  /api/plans');
  console.log('   POST /api/create-checkout-session');
  console.log('   POST /api/create-hourly-checkout-session');
  console.log('   GET  /api/checkout-session/:sessionId');
  console.log('   POST /api/create-customer-portal-session');
  console.log('   POST /api/webhook');
  console.log('   POST /api/test-email');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
});
