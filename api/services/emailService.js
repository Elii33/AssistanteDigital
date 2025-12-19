/**
 * ElisAssist - Service Email
 */

const nodemailer = require('nodemailer');

// ====== CONFIGURATION EMAIL ======
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Fonction pour envoyer un email
async function sendEmail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: `"ElisAssist" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email envoye: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

// Fonction pour notifier l'admin
async function notifyAdmin(subject, message) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  await sendEmail(adminEmail, subject, message);
}

// ====== TEMPLATES D'EMAILS ======
const emailHeader = () => `
  <div style="background: linear-gradient(135deg, #ca8a04 0%, #eab308 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ElisAssist</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Assistante Digitale</p>
  </div>
`;

const emailFooter = () => `
  <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px 0;">
      Des questions ? Je suis la pour vous aider !
    </p>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        ElisAssist - Assistante Digitale
      </p>
    </div>
  </div>
`;

const emailWrapper = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      ${emailHeader()}
      <div style="padding: 40px 30px;">
        ${content}
      </div>
      ${emailFooter()}
    </div>
  </body>
  </html>
`;

// Templates d'emails
const emailTemplates = {
  subscriptionCreated: (customerEmail, planName, amount, invoiceUrl = null) => emailWrapper(`
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Bienvenue !
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Votre abonnement <strong style="color: #ca8a04;">${planName}</strong> est maintenant actif.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Montant: ${(amount / 100).toFixed(2)} EUR/mois
    </p>
    ${invoiceUrl ? `<p><a href="${invoiceUrl}">Telecharger la facture</a></p>` : ''}
  `),

  subscriptionCancelled: (customerEmail, planName) => emailWrapper(`
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Confirmation d'annulation
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Votre abonnement <strong>${planName}</strong> a ete annule.
    </p>
  `),

  paymentFailed: (customerEmail, planName) => emailWrapper(`
    <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">
      Probleme de paiement
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Le paiement pour <strong>${planName}</strong> n'a pas pu etre effectue.
    </p>
  `),

  adminNewSubscription: (customerEmail, planName, amount) => emailWrapper(`
    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">
      Nouveau client !
    </h2>
    <p>Client: ${customerEmail}</p>
    <p>Formule: ${planName}</p>
    <p>Montant: ${(amount / 100).toFixed(2)} EUR/mois</p>
  `),

  adminCancellation: (customerEmail, planName) => emailWrapper(`
    <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">
      Annulation
    </h2>
    <p>Client: ${customerEmail}</p>
    <p>Formule: ${planName}</p>
  `),

  hourlyPaymentClient: (customerEmail, serviceName, hours, hourlyRate, total, invoiceUrl = null) => emailWrapper(`
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Merci pour votre commande !
    </h2>
    <p>Service: ${serviceName}</p>
    <p>Heures: ${hours}h</p>
    <p>Tarif: ${hourlyRate} EUR/h</p>
    <p>Total: ${total} EUR</p>
    ${invoiceUrl ? `<p><a href="${invoiceUrl}">Telecharger la facture</a></p>` : ''}
  `),

  adminHourlyPayment: (customerEmail, serviceName, hours, hourlyRate, total) => emailWrapper(`
    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">
      Nouveau paiement horaire !
    </h2>
    <p>Client: ${customerEmail}</p>
    <p>Service: ${serviceName}</p>
    <p>Heures: ${hours}h</p>
    <p>Total: ${total} EUR</p>
  `)
};

module.exports = {
  sendEmail,
  notifyAdmin,
  emailTemplates
};
