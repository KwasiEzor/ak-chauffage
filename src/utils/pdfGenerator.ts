import jsPDF from 'jspdf';
import type { Invoice } from '../types/invoice';
import type { SiteSettings } from '../types/content';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  vatNumber?: string;
}

export function generateInvoicePDF(invoice: Invoice, settings: SiteSettings) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Company info from settings
  const companyInfo: CompanyInfo = {
    name: settings.site.name,
    address: `${settings.contact.address.street}, ${settings.contact.address.postalCode} ${settings.contact.address.city}`,
    phone: settings.contact.phone,
    email: settings.contact.email,
    vatNumber: settings.legal.vatNumber || 'N/A',
  };

  // Orange brand color
  const orangeColor: [number, number, number] = [249, 115, 22]; // #f97316

  // Header - Orange background
  doc.setFillColor(...orangeColor);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Company name in white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 15, 20);

  // Reset text color to black
  doc.setTextColor(0, 0, 0);

  // Company details (left side)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 40;
  doc.text(companyInfo.address, 15, yPos);
  yPos += 5;
  doc.text(`Tél: ${companyInfo.phone}`, 15, yPos);
  yPos += 5;
  doc.text(`Email: ${companyInfo.email}`, 15, yPos);
  yPos += 5;
  doc.text(`TVA: ${companyInfo.vatNumber}`, 15, yPos);

  // Invoice details (right side)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - 60, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.invoice_number}`, pageWidth - 60, 46);
  doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-BE')}`, pageWidth - 60, 52);
  if (invoice.due_date) {
    doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-BE')}`, pageWidth - 60, 58);
  }

  // Client info section
  yPos = 75;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPos, pageWidth - 30, 30, 'F');

  yPos += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à:', 20, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client_name, 20, yPos);
  yPos += 5;
  doc.text(invoice.client_email, 20, yPos);
  if (invoice.client_phone) {
    yPos += 5;
    doc.text(invoice.client_phone, 20, yPos);
  }
  if (invoice.client_address) {
    yPos += 5;
    const addressLines = doc.splitTextToSize(invoice.client_address, pageWidth - 50);
    doc.text(addressLines, 20, yPos);
  }

  // Line items table
  yPos = 115;
  const tableStartY = yPos;

  // Table header
  doc.setFillColor(...orangeColor);
  doc.setTextColor(255, 255, 255);
  doc.rect(15, yPos, pageWidth - 30, 8, 'F');

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, yPos);
  doc.text('Qté', pageWidth - 95, yPos, { align: 'right' });
  doc.text('Prix Unit.', pageWidth - 65, yPos, { align: 'right' });
  doc.text('Montant', pageWidth - 25, yPos, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Line items
  yPos += 6;
  doc.setFont('helvetica', 'normal');

  invoice.line_items.forEach((item, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos - 4, pageWidth - 30, 8, 'F');
    }

    const description = doc.splitTextToSize(item.description, 90);
    doc.text(description, 20, yPos);
    doc.text(item.quantity.toString(), pageWidth - 95, yPos, { align: 'right' });
    doc.text(`€${item.unit_price.toFixed(2)}`, pageWidth - 65, yPos, { align: 'right' });
    doc.text(`€${item.amount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });

    yPos += description.length * 5 + 3;
  });

  // Totals section
  yPos += 5;
  const totalsX = pageWidth - 70;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Sous-total:', totalsX, yPos);
  doc.text(`€${invoice.subtotal.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });

  yPos += 6;
  doc.text(`TVA (${invoice.tax_rate}%):`, totalsX, yPos);
  doc.text(`€${invoice.tax_amount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });

  // Total line
  yPos += 8;
  doc.setFillColor(...orangeColor);
  doc.rect(totalsX - 5, yPos - 5, pageWidth - totalsX - 15, 10, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, yPos);
  doc.text(`€${invoice.total.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });

  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Notes section
  if (invoice.notes) {
    yPos += 15;
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 30);
    doc.text(notesLines, 15, yPos);
    yPos += notesLines.length * 5;
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text('Merci pour votre confiance!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`${companyInfo.name} - ${companyInfo.phone}`, pageWidth / 2, footerY + 5, { align: 'center' });

  // Save the PDF
  doc.save(`facture-${invoice.invoice_number}.pdf`);
}
