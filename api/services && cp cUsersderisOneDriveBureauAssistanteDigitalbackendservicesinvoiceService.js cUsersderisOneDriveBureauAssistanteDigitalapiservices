/**
 * ============================================================================
 * Elilouche Assistante Digitale - Service Email
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * @author    nonodevco (https://nonodevco.com)
 * @license   Propriétaire - Reproduction et distribution interdites
 *
 * ============================================================================
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

// Fonction pour notifier l'admin
async function notifyAdmin(subject, message) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  await sendEmail(adminEmail, subject, message);
}

// ====== TEMPLATES D'EMAILS PROFESSIONNELS ======
const emailHeader = () => `
  <div style="background: linear-gradient(135deg, #ca8a04 0%, #eab308 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✨ Elilouche</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Assistante Digitale</p>
  </div>
`;

const emailFooter = () => `
  <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px 0;">
      Des questions ? Je suis là pour vous aider !
    </p>
    <div style="margin: 20px 0;">
      <a href="${process.env.FRONTEND_URL}/#services" style="background: #ca8a04; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">
        Voir les services
      </a>
      <a href="${process.env.FRONTEND_URL}/#booking" style="background: #374151; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 5px;">
        Prendre RDV
      </a>
    </div>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Elilouche Assistante Digitale<br>
        Micro-entreprise (EI) • TVA non applicable, art. 293 B du CGI
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
  // ===== ABONNEMENT CRÉÉ (Client) =====
  subscriptionCreated: (customerEmail, planName, amount, invoiceUrl = null) => emailWrapper(`
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      🎉 Bienvenue dans l'aventure !
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Bonjour et merci infiniment pour votre confiance !
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Votre abonnement <strong style="color: #ca8a04;">${planName}</strong> est maintenant actif.
      Je suis ravie de vous compter parmi mes clients !
    </p>

    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ca8a04;">
      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Récapitulatif de votre abonnement</h3>
      <table style="width: 100%; color: #78350f;">
        <tr>
          <td style="padding: 8px 0;"><strong>Formule :</strong></td>
          <td style="padding: 8px 0; text-align: right;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Montant :</strong></td>
          <td style="padding: 8px 0; text-align: right; font-size: 20px; font-weight: bold;">${(amount / 100).toFixed(2)}€/mois</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Date de début :</strong></td>
          <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('fr-FR')}</td>
        </tr>
      </table>
    </div>

    ${invoiceUrl ? `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${invoiceUrl}" style="background: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
        📄 Télécharger ma facture
      </a>
    </div>
    ` : ''}

    <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">🚀 Prochaines étapes</h3>
      <ol style="color: #15803d; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Je vous contacte sous 24-48h pour faire connaissance</li>
        <li>On définit ensemble vos besoins prioritaires</li>
        <li>On démarre la collaboration !</li>
      </ol>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      En attendant, n'hésitez pas à préparer vos premières demandes ou questions.
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      À très vite ! 💫
    </p>
    <p style="color: #6b7280; font-size: 16px; margin-top: 30px;">
      Chaleureusement,<br>
      <strong style="color: #ca8a04;">Elisa</strong><br>
      <em>Votre Assistante Digitale</em>
    </p>
  `),

  // ===== ABONNEMENT ANNULÉ (Client) =====
  subscriptionCancelled: (customerEmail, planName) => emailWrapper(`
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      Confirmation d'annulation
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Bonjour,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Je vous confirme que votre abonnement <strong>${planName}</strong> a bien été annulé.
    </p>

    <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #dc2626;">
      <p style="color: #991b1b; margin: 0; font-size: 14px;">
        ⚠️ Votre accès aux services reste actif jusqu'à la fin de votre période de facturation en cours.
      </p>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Je tenais à vous remercier sincèrement pour la confiance que vous m'avez accordée.
      Si vous avez des remarques ou suggestions pour améliorer mes services, je serais ravie de les entendre.
    </p>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
      <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
        Envie de revenir ? Vos données sont conservées pendant 30 jours.
      </p>
      <a href="${process.env.FRONTEND_URL}/#services" style="background: #ca8a04; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
        Réactiver mon abonnement
      </a>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      N'hésitez pas à me recontacter si vous avez besoin d'aide à l'avenir.
      Ma porte vous sera toujours ouverte ! 🚪✨
    </p>
    <p style="color: #6b7280; font-size: 16px; margin-top: 30px;">
      Avec toute ma gratitude,<br>
      <strong style="color: #ca8a04;">Elisa</strong>
    </p>
  `),

  // ===== ÉCHEC DE PAIEMENT (Client) =====
  paymentFailed: (customerEmail, planName) => emailWrapper(`
    <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">
      ⚠️ Oups ! Un souci avec votre paiement
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Bonjour,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Le paiement pour votre abonnement <strong>${planName}</strong> n'a pas pu être effectué.
      Pas de panique, ça arrive à tout le monde !
    </p>

    <div style="background: #fef2f2; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #dc2626;">
      <h3 style="color: #991b1b; margin: 0 0 15px 0; font-size: 16px;">🔧 Causes possibles :</h3>
      <ul style="color: #b91c1c; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Carte expirée ou plafond atteint</li>
        <li>Fonds insuffisants</li>
        <li>Problème technique temporaire</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/#services" style="background: #dc2626; color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
        🔄 Mettre à jour mes informations
      </a>
    </div>

    <div style="background: #fffbeb; padding: 15px; border-radius: 10px; margin: 25px 0;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        ⏰ <strong>Important :</strong> Veuillez mettre à jour vos informations sous 48h pour éviter l'interruption de votre service.
      </p>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Si le problème persiste ou si vous avez des questions, n'hésitez pas à me contacter directement.
    </p>
    <p style="color: #6b7280; font-size: 16px; margin-top: 30px;">
      À votre service,<br>
      <strong style="color: #ca8a04;">Elisa</strong>
    </p>
  `),

  // ===== NOUVEL ABONNEMENT (Admin) =====
  adminNewSubscription: (customerEmail, planName, amount) => emailWrapper(`
    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">
      🎉 Nouveau client !
    </h2>

    <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #059669;">
      <table style="width: 100%; color: #166534;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>📧 Client :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>📦 Formule :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>💰 Montant :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0; font-size: 20px; font-weight: bold;">${(amount / 100).toFixed(2)}€/mois</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>📅 Date :</strong></td>
          <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleString('fr-FR')}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 À faire :</h3>
      <ul style="color: #b45309; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Contacter le client sous 24-48h</li>
        <li>Définir les besoins et priorités</li>
        <li>Planifier le premier appel de lancement</li>
      </ul>
    </div>
  `),

  // ===== ANNULATION (Admin) =====
  adminCancellation: (customerEmail, planName) => emailWrapper(`
    <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">
      ❌ Annulation d'abonnement
    </h2>

    <div style="background: #fef2f2; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #dc2626;">
      <table style="width: 100%; color: #991b1b;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #fecaca;"><strong>📧 Client :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #fecaca;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #fecaca;"><strong>📦 Formule annulée :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #fecaca;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>📅 Date :</strong></td>
          <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleString('fr-FR')}</td>
        </tr>
      </table>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 25px 0;">
      <p style="color: #6b7280; margin: 0; font-size: 14px;">
        💡 <strong>Conseil :</strong> Pensez à contacter le client pour comprendre les raisons de l'annulation et recueillir ses retours.
      </p>
    </div>
  `),

  // ===== PAIEMENT HORAIRE (Client) =====
  hourlyPaymentClient: (customerEmail, serviceName, hours, hourlyRate, total, invoiceUrl = null) => emailWrapper(`
    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">
      🎉 Merci pour votre commande !
    </h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Bonjour et merci pour votre confiance !
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Votre paiement a bien été reçu. Voici le détail de votre commande :
    </p>

    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ca8a04;">
      <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📋 Détail de la commande</h3>
      <table style="width: 100%; color: #78350f;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);"><strong>Service :</strong></td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);"><strong>Nombre d'heures :</strong></td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">${hours}h</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);"><strong>Tarif horaire :</strong></td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(0,0,0,0.1);">${hourlyRate}€/h</td>
        </tr>
        <tr>
          <td style="padding: 12px 0;"><strong>Total payé :</strong></td>
          <td style="padding: 12px 0; text-align: right; font-size: 24px; font-weight: bold; color: #ca8a04;">${total}€</td>
        </tr>
      </table>
    </div>

    ${invoiceUrl ? `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${invoiceUrl}" style="background: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
        📄 Télécharger ma facture
      </a>
    </div>
    ` : ''}

    <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">🚀 Et maintenant ?</h3>
      <p style="color: #15803d; margin: 0; line-height: 1.8;">
        Je vous contacte très rapidement pour organiser notre collaboration et planifier vos ${hours} heures de travail selon vos disponibilités.
      </p>
    </div>

    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Hâte de travailler avec vous ! 💫
    </p>
    <p style="color: #6b7280; font-size: 16px; margin-top: 30px;">
      Chaleureusement,<br>
      <strong style="color: #ca8a04;">Elisa</strong><br>
      <em>Votre Assistante Digitale</em>
    </p>
  `),

  // ===== PAIEMENT HORAIRE (Admin) =====
  adminHourlyPayment: (customerEmail, serviceName, hours, hourlyRate, total) => emailWrapper(`
    <h2 style="color: #059669; margin: 0 0 20px 0; font-size: 24px;">
      💰 Nouveau paiement horaire !
    </h2>

    <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #059669;">
      <table style="width: 100%; color: #166534;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>📧 Client :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>🛠️ Service :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>⏱️ Heures :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0;">${hours}h</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>💶 Tarif :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0;">${hourlyRate}€/h</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0;"><strong>💰 Total :</strong></td>
          <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #bbf7d0; font-size: 22px; font-weight: bold;">${total}€</td>
        </tr>
        <tr>
          <td style="padding: 10px 0;"><strong>📅 Date :</strong></td>
          <td style="padding: 10px 0; text-align: right;">${new Date().toLocaleString('fr-FR')}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fffbeb; padding: 20px; border-radius: 10px; margin: 25px 0;">
      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 À faire :</h3>
      <ul style="color: #b45309; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Contacter le client pour planifier les heures</li>
        <li>Définir les tâches prioritaires</li>
        <li>Suivre le temps passé</li>
      </ul>
    </div>
  `)
};

module.exports = {
  sendEmail,
  notifyAdmin,
  emailTemplates
};
