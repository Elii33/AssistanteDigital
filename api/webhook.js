/**
 * ============================================================================
 * ElisAssist - Stripe Webhook Handler (Vercel Serverless)
 * ============================================================================
 */

const stripe = require('stripe')(
  process.env.STRIPE_MODE === 'live'
    ? process.env.STRIPE_SECRET_KEY_LIVE
    : process.env.STRIPE_SECRET_KEY_TEST
);

const { sendEmail, notifyAdmin, emailTemplates } = require('./services/emailService');

// Désactiver le body parser par défaut de Vercel pour ce endpoint
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper pour lire le raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️  Webhook secret non configuré');
    return res.status(500).json({ error: 'Webhook secret non configuré' });
  }

  let event;
  let rawBody;

  try {
    rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
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
        const invoiceUrl = `${process.env.BACKEND_URL || process.env.VERCEL_URL}/api/invoice/${session.id}`;

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
};
