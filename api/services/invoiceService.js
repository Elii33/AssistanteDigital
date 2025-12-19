/**
 * ElisAssist - Service Factures PDF
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ====== CONFIGURATION ENTREPRISE (pour les factures) ======
const ENTREPRISE_CONFIG = {
  nom: 'ElisAssist',
  adresse: '123 Rue Example',
  codePostal: '75000',
  ville: 'Paris',
  siret: 'XXX XXX XXX XXXXX',
  email: process.env.EMAIL_USER || 'contact@example.com',
  telephone: '06 XX XX XX XX',
  mentionTVA: 'TVA non applicable, art. 293 B du CGI'
};

// Utiliser le dossier tmp pour Vercel (environnement serverless)
const invoicesDir = path.join(os.tmpdir(), 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// Fonction pour generer un numero de facture unique
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `FAC-${year}${month}-${timestamp}`;
}

// Fonction pour generer une facture PDF
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

    // ===== EN-TETE =====
    // Fond dore pour l'en-tete
    doc.rect(0, 0, 595, 120).fill('#ca8a04');

    // Nom de l'entreprise
    doc.fillColor('#ffffff')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('ElisAssist', 50, 35);

    doc.fontSize(14)
       .font('Helvetica')
       .text('Assistante Digitale', 50, 70);

    // FACTURE badge
    doc.fillColor('#ffffff')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('FACTURE', 400, 45, { align: 'right', width: 145 });

    doc.fontSize(11)
       .font('Helvetica')
       .text(`N ${invoiceNumber}`, 400, 75, { align: 'right', width: 145 });

    // ===== INFORMATIONS ENTREPRISE & CLIENT =====
    doc.fillColor('#374151');

    // Colonne gauche - Entreprise
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('EMETTEUR', 50, 145);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#6b7280')
       .text(ENTREPRISE_CONFIG.nom, 50, 162)
       .text(ENTREPRISE_CONFIG.adresse, 50, 177)
       .text(`${ENTREPRISE_CONFIG.codePostal} ${ENTREPRISE_CONFIG.ville}`, 50, 192)
       .text(`SIRET: ${ENTREPRISE_CONFIG.siret}`, 50, 207)
       .text(`Email: ${ENTREPRISE_CONFIG.email}`, 50, 222)
       .text(`Tel: ${ENTREPRISE_CONFIG.telephone}`, 50, 237);

    // Colonne droite - Client
    doc.fillColor('#374151')
       .font('Helvetica-Bold')
       .text('DESTINATAIRE', 350, 145);

    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#6b7280')
       .text(customerName || 'Client', 350, 162)
       .text(customerEmail, 350, 177);

    if (customerAddress) {
      const addressLines = customerAddress.split('\n');
      let yPos = 192;
      addressLines.forEach(line => {
        doc.text(line, 350, yPos);
        yPos += 15;
      });
    }

    // Date de facture
    doc.fillColor('#374151')
       .font('Helvetica-Bold')
       .text('Date:', 350, 237);
    doc.font('Helvetica')
       .fillColor('#6b7280')
       .text(date || new Date().toLocaleDateString('fr-FR'), 390, 237);

    // ===== TABLEAU DES PRESTATIONS =====
    const tableTop = 290;

    // En-tete du tableau
    doc.rect(50, tableTop, 495, 30).fill('#f3f4f6');

    doc.fillColor('#374151')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('DESCRIPTION', 60, tableTop + 10)
       .text('QTE', 320, tableTop + 10, { width: 50, align: 'center' })
       .text('PRIX UNIT.', 370, tableTop + 10, { width: 70, align: 'center' })
       .text('TOTAL', 450, tableTop + 10, { width: 85, align: 'right' });

    // Lignes du tableau
    let yPosition = tableTop + 40;

    doc.font('Helvetica').fillColor('#4b5563');

    items.forEach((item, index) => {
      // Alternance de couleur de fond
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 5, 495, 25).fill('#fafafa');
        doc.fillColor('#4b5563');
      }

      doc.fontSize(10)
         .text(item.description, 60, yPosition, { width: 250 })
         .text(item.quantity.toString(), 320, yPosition, { width: 50, align: 'center' })
         .text(`${item.unitPrice.toFixed(2)} EUR`, 370, yPosition, { width: 70, align: 'center' })
         .text(`${item.total.toFixed(2)} EUR`, 450, yPosition, { width: 85, align: 'right' });

      yPosition += 25;
    });

    // Ligne de separation
    yPosition += 10;
    doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke('#e5e7eb');

    // ===== TOTAUX =====
    yPosition += 20;

    // Box pour le total
    doc.rect(350, yPosition - 5, 195, 60).fill('#fef3c7').stroke('#ca8a04');

    doc.fillColor('#92400e')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text('Total HT', 360, yPosition + 5)
       .text(`${totalHT.toFixed(2)} EUR`, 360, yPosition + 5, { width: 175, align: 'right' });

    doc.fontSize(10)
       .font('Helvetica')
       .text('TVA', 360, yPosition + 25)
       .text('Non applicable', 360, yPosition + 25, { width: 175, align: 'right' });

    doc.font('Helvetica-Bold')
       .fontSize(14)
       .fillColor('#ca8a04')
       .text('TOTAL TTC', 360, yPosition + 45)
       .text(`${totalHT.toFixed(2)} EUR`, 360, yPosition + 45, { width: 175, align: 'right' });

    // ===== MENTIONS LEGALES =====
    const footerY = 700;

    doc.rect(50, footerY, 495, 80).fill('#f9fafb');

    doc.fillColor('#6b7280')
       .font('Helvetica')
       .fontSize(8)
       .text('MENTIONS LEGALES', 60, footerY + 10)
       .text(ENTREPRISE_CONFIG.mentionTVA, 60, footerY + 25)
       .text('Conditions de paiement : Paiement a reception', 60, footerY + 40)
       .text('En cas de retard de paiement, une penalite de 3 fois le taux d\'interet legal sera appliquee,', 60, footerY + 55)
       .text('ainsi qu\'une indemnite forfaitaire de 40 EUR pour frais de recouvrement.', 60, footerY + 67);

    // ===== PIED DE PAGE =====
    doc.fillColor('#9ca3af')
       .fontSize(8)
       .text(`${ENTREPRISE_CONFIG.nom} - Micro-entreprise (EI) - ${ENTREPRISE_CONFIG.siret}`, 50, 800, { align: 'center', width: 495 });

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
