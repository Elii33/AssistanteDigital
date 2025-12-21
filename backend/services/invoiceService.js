/**
 * ============================================================================
 * Elisassist Assistante Digitale - Service Factures PDF
 * ============================================================================
 *
 * @copyright 2025 nonodevco - Tous droits réservés
 * @author    nonodevco (https://nonodevco.com)
 * @license   Propriétaire - Reproduction et distribution interdites
 *
 * ============================================================================
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ====== CONFIGURATION ENTREPRISE (pour les factures) ======
const ENTREPRISE_CONFIG = {
  nom: 'Elisassist Assistante Digitale',
  adresse: '17 rue Jannes Barret',
  codePostal: '33240',
  ville: 'Saint-André-de-Cubzac',
  siret: '879 865 160 00029',
  email: process.env.EMAIL_USER || 'elisassist@gmail.com',
  telephone: '06 64 66 93 63',
  mentionTVA: 'TVA non applicable, art. 293 B du CGI'
};

// Créer le dossier des factures s'il n'existe pas
const invoicesDir = path.join(__dirname, '..', 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Chemin vers le logo
const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

// Fonction pour générer un numéro de facture unique
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `FAC-${year}${month}-${timestamp}`;
}

// Fonction pour générer une facture PDF
async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    const {
      invoiceNumber,
      customerName,
      customerEmail,
      customerAddress,
      items,
      totalHT,
      date
    } = invoiceData;

    const fileName = `facture_${invoiceNumber}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // ===== EN-TÊTE =====
    // Fond blanc crème pour mettre en valeur le logo
    doc.rect(0, 0, 595, 140).fill('#fffbeb');

    // Bordure dorée fine en haut
    doc.rect(0, 0, 595, 4).fill('#ca8a04');

    // Bande décorative dorée en bas de l'en-tête
    doc.rect(0, 130, 595, 10).fill('#ca8a04');

    // Logo centré dans la zone gauche (avant le badge FACTURE)
    if (fs.existsSync(logoPath)) {
      try {
        // Décalé plus vers la droite pour mieux centrer visuellement
        doc.image(logoPath, 150, 30, { width: 180 });
      } catch (e) {
        console.warn('Impossible de charger le logo:', e.message);
      }
    }

    // FACTURE badge élégant à droite (orange)
    doc.roundedRect(430, 35, 120, 60, 6).fill('#ea580c');

    // Texte FACTURE en blanc sur fond orange
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('FACTURE', 435, 48, { align: 'center', width: 110 });

    // Numéro de facture en blanc
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#ffffff')
       .text(`N° ${invoiceNumber}`, 435, 72, { align: 'center', width: 110 });

    // ===== INFORMATIONS ENTREPRISE & CLIENT =====

    // Box Émetteur avec bordure dorée et ombre
    doc.roundedRect(50, 160, 240, 115, 6).fill('#ffffff').stroke('#ca8a04');

    doc.fillColor('#ca8a04')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('ÉMETTEUR', 65, 172);

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#4b5563')
       .text(ENTREPRISE_CONFIG.nom, 65, 190)
       .text(ENTREPRISE_CONFIG.adresse, 65, 204)
       .text(`${ENTREPRISE_CONFIG.codePostal} ${ENTREPRISE_CONFIG.ville}`, 65, 218)
       .text(`SIRET: ${ENTREPRISE_CONFIG.siret}`, 65, 232)
       .text(`Email: ${ENTREPRISE_CONFIG.email}`, 65, 246)
       .text(`Tél: ${ENTREPRISE_CONFIG.telephone}`, 65, 260);

    // Box Destinataire avec bordure grise élégante
    doc.roundedRect(310, 160, 235, 115, 6).fill('#f9fafb').stroke('#d1d5db');

    doc.fillColor('#374151')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text('DESTINATAIRE', 325, 172);

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#4b5563')
       .text(customerName || 'Client', 325, 190)
       .text(customerEmail, 325, 204);

    if (customerAddress) {
      const addressLines = customerAddress.split('\n');
      let yPos = 218;
      addressLines.forEach(line => {
        doc.text(line, 325, yPos);
        yPos += 14;
      });
    }

    // Date de facture dans la box client
    doc.fillColor('#ca8a04')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text('Date:', 325, 260);
    doc.font('Helvetica')
       .fillColor('#4b5563')
       .text(date || new Date().toLocaleDateString('fr-FR'), 360, 260);

    // ===== TABLEAU DES PRESTATIONS =====
    const tableTop = 295;

    // En-tête du tableau avec fond doré
    doc.rect(50, tableTop, 495, 32).fill('#ca8a04');

    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('DESCRIPTION', 60, tableTop + 11)
       .text('QTÉ', 320, tableTop + 11, { width: 50, align: 'center' })
       .text('PRIX UNIT.', 370, tableTop + 11, { width: 70, align: 'center' })
       .text('TOTAL', 450, tableTop + 11, { width: 85, align: 'right' });

    // Lignes du tableau
    let yPosition = tableTop + 44;

    items.forEach((item, index) => {
      // Alternance de couleur de fond
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 6, 495, 28).fill('#fefce8');
      } else {
        doc.rect(50, yPosition - 6, 495, 28).fill('#ffffff');
      }

      doc.font('Helvetica')
         .fontSize(10)
         .fillColor('#374151')
         .text(item.description, 60, yPosition, { width: 250 })
         .text(item.quantity.toString(), 320, yPosition, { width: 50, align: 'center' })
         .text(`${item.unitPrice.toFixed(2)} €`, 370, yPosition, { width: 70, align: 'center' });

      doc.font('Helvetica-Bold')
         .fillColor('#92400e')
         .text(`${item.total.toFixed(2)} €`, 450, yPosition, { width: 85, align: 'right' });

      yPosition += 28;
    });

    // Bordure du tableau
    doc.rect(50, tableTop, 495, yPosition - tableTop + 5).stroke('#e5e7eb');

    // ===== TOTAUX =====
    yPosition += 25;

    // Box principale pour les totaux avec coins arrondis (hauteur augmentée)
    doc.roundedRect(350, yPosition - 5, 195, 100, 6).fill('#fefce8').stroke('#ca8a04');

    // Ligne Total HT
    doc.fillColor('#4b5563')
       .font('Helvetica')
       .fontSize(11)
       .text('Total HT', 365, yPosition + 12)
       .text(`${totalHT.toFixed(2)} €`, 365, yPosition + 12, { width: 165, align: 'right' });

    // Ligne TVA (espacement augmenté)
    doc.text('TVA', 365, yPosition + 35)
       .text('Non applicable', 365, yPosition + 35, { width: 165, align: 'right' });

    // Séparateur (position ajustée)
    doc.moveTo(360, yPosition + 55).lineTo(535, yPosition + 55).stroke('#ca8a04');

    // Total TTC avec fond doré (position et taille ajustées)
    doc.roundedRect(355, yPosition + 62, 185, 30, 4).fill('#ca8a04');

    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('TOTAL TTC', 365, yPosition + 70)
       .text(`${totalHT.toFixed(2)} €`, 365, yPosition + 70, { width: 165, align: 'right' });

    // ===== MENTIONS LÉGALES =====
    const footerY = 700;

    // Box mentions légales avec bordure légère
    doc.roundedRect(50, footerY, 495, 75, 4).fill('#fefce8').stroke('#eab308');

    doc.fillColor('#92400e')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text('MENTIONS LÉGALES', 65, footerY + 12);

    doc.fillColor('#4b5563')
       .font('Helvetica')
       .fontSize(8)
       .text(ENTREPRISE_CONFIG.mentionTVA, 65, footerY + 28)
       .text('Conditions de paiement : Paiement à réception', 65, footerY + 42)
       .text('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée,', 65, footerY + 54)
       .text('ainsi qu\'une indemnité forfaitaire de 40€ pour frais de recouvrement.', 65, footerY + 64);

    // ===== PIED DE PAGE =====
    // Bande dorée en bas de page
    doc.rect(0, 790, 595, 52).fill('#ca8a04');

    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text('Merci pour votre confiance !', 50, 800, { align: 'center', width: 495 });

    doc.fillColor('#fef3c7')
       .font('Helvetica')
       .fontSize(8)
       .text(`${ENTREPRISE_CONFIG.nom} • Micro-entreprise (EI) • SIRET: ${ENTREPRISE_CONFIG.siret}`, 50, 815, { align: 'center', width: 495 });

    // Finaliser le PDF
    doc.end();

    writeStream.on('finish', () => {
      resolve({ filePath, fileName, invoiceNumber });
    });

    writeStream.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
  ENTREPRISE_CONFIG,
  generateInvoiceNumber,
  generateInvoicePDF,
  invoicesDir
};
