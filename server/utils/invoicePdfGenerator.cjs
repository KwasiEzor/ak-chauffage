const PDFDocument = require('pdfkit');
const { readJSON } = require('./fileManager.cjs');

/**
 * Generate invoice PDF as buffer
 * @param {Object} invoice - Invoice data with line items
 * @returns {Promise<Buffer>} - PDF as buffer
 */
async function generateInvoicePDF(invoice) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get company settings from JSON file
      const settings = await readJSON('settings.json');

      const companyInfo = {
        name: settings.site?.name || 'AK CHAUFFAGE',
        address: settings.contact?.address
          ? `${settings.contact.address.street}, ${settings.contact.address.postalCode} ${settings.contact.address.city}`
          : 'Rue de la Bassée 26/6, 6030 Marchienne-au-Pont',
        phone: settings.contact?.phone || '+32 488 45 99 76',
        email: settings.contact?.email || 'contact@ak-chauffage.be',
        vatNumber: settings.legal?.vatNumber || 'N/A',
      };

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Collect buffer chunks
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Orange brand color
      const orangeColor = '#f97316';

      // Header - Orange background
      doc.rect(0, 0, 595, 80).fill(orangeColor);

      // Company name in white
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(companyInfo.name, 50, 30);

      // Reset to black
      doc.fillColor('#000000');

      // Company details (left side)
      doc.fontSize(10)
         .font('Helvetica')
         .text(companyInfo.address, 50, 100)
         .text(`Tél: ${companyInfo.phone}`, 50, 115)
         .text(`Email: ${companyInfo.email}`, 50, 130)
         .text(`TVA: ${companyInfo.vatNumber}`, 50, 145);

      // Invoice details (right side)
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('FACTURE', 450, 100);

      doc.fontSize(10)
         .font('Helvetica')
         .text(`N° ${invoice.invoice_number}`, 450, 116)
         .text(`Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-BE')}`, 450, 131);

      if (invoice.due_date) {
        doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-BE')}`, 450, 146);
      }

      // Client info section (with background)
      let yPos = 180;
      doc.rect(50, yPos, 495, 70).fill('#f5f5f5');

      yPos += 15;
      doc.fillColor('#000000')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Facturé à:', 60, yPos);

      yPos += 15;
      doc.font('Helvetica')
         .text(invoice.client_name, 60, yPos);

      yPos += 12;
      doc.text(invoice.client_email, 60, yPos);

      if (invoice.client_phone) {
        yPos += 12;
        doc.text(invoice.client_phone, 60, yPos);
      }

      if (invoice.client_address) {
        yPos += 12;
        doc.text(invoice.client_address, 60, yPos, { width: 480 });
      }

      // Line items table
      yPos = 280;

      // Table header with orange background
      doc.rect(50, yPos, 495, 25).fill(orangeColor);

      yPos += 17;
      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Description', 60, yPos)
         .text('Qté', 350, yPos, { width: 50, align: 'right' })
         .text('Prix Unit.', 400, yPos, { width: 60, align: 'right' })
         .text('Montant', 460, yPos, { width: 75, align: 'right' });

      // Reset color
      doc.fillColor('#000000');

      // Line items
      yPos += 20;
      doc.font('Helvetica');

      invoice.line_items.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        // Alternate row colors
        if (index % 2 === 0) {
          doc.rect(50, yPos - 5, 495, 25).fill('#fafafa');
          doc.fillColor('#000000');
        }

        doc.fontSize(10)
           .text(item.description, 60, yPos, { width: 280 })
           .text(item.quantity.toString(), 350, yPos, { width: 50, align: 'right' })
           .text(`€${item.unit_price.toFixed(2)}`, 400, yPos, { width: 60, align: 'right' })
           .text(`€${item.amount.toFixed(2)}`, 460, yPos, { width: 75, align: 'right' });

        yPos += 25;
      });

      // Totals section
      yPos += 15;
      const totalsX = 400;

      // Subtotal
      doc.fontSize(10)
         .font('Helvetica')
         .text('Sous-total:', totalsX, yPos)
         .text(`€${invoice.subtotal.toFixed(2)}`, 460, yPos, { width: 75, align: 'right' });

      yPos += 15;
      doc.text(`TVA (${invoice.tax_rate}%):`, totalsX, yPos)
         .text(`€${invoice.tax_amount.toFixed(2)}`, 460, yPos, { width: 75, align: 'right' });

      // Total with orange background
      yPos += 20;
      doc.rect(totalsX - 10, yPos - 5, 155, 25).fill(orangeColor);

      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('TOTAL:', totalsX, yPos)
         .text(`€${invoice.total.toFixed(2)}`, 460, yPos, { width: 75, align: 'right' });

      // Reset colors
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica');

      // Notes section
      if (invoice.notes) {
        yPos += 40;
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc.font('Helvetica-Bold')
           .text('Notes:', 50, yPos);

        yPos += 15;
        doc.font('Helvetica')
           .text(invoice.notes, 50, yPos, { width: 495 });
      }

      // Footer
      const footerY = 750;
      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica-Oblique')
         .text('Merci pour votre confiance!', 50, footerY, { align: 'center', width: 495 })
         .text(`${companyInfo.name} - ${companyInfo.phone}`, 50, footerY + 12, { align: 'center', width: 495 });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInvoicePDF };
