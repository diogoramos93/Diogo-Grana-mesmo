import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Quote, PhotographerProfile, Client, QuoteStatus, ServiceType } from '../types';

// Use type casting for autoTable calls to avoid problematic module augmentation 
// that can fail depending on the TypeScript environment setup.

export const generateQuotePDF = async (quote: Quote, profile: PhotographerProfile, client: Client) => {
  const doc = new jsPDF();
  const primaryColor = [79, 70, 229]; // Indigo-600

  // Helper function to format currency
  const fmt = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // --- HEADER SECTION ---
  // Studio Logo placeholder or Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(profile.studioName || profile.name, 20, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.name} | CNPJ/CPF: ${profile.taxId}`, 20, 32);
  doc.text(`${profile.address}`, 20, 37);
  doc.text(`${profile.phone} | ${profile.email}`, 20, 42);

  // Quote Basic Info
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85); // Slate-800
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO #${quote.number}`, 140, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emissão: ${new Date(quote.date).toLocaleDateString('pt-BR')}`, 140, 32);
  doc.text(`Válido até: ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}`, 140, 37);

  // --- CLIENT SECTION ---
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(20, 50, 190, 50);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CLIENTE:', 20, 60);
  
  doc.setTextColor(51, 65, 85);
  doc.text(client.name, 20, 67);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`CPF/CNPJ: ${client.taxId || 'N/A'}`, 20, 72);
  doc.text(`E-mail: ${client.email}`, 20, 77);
  doc.text(`Endereço: ${client.address}`, 20, 82);

  // --- ITEMS TABLE ---
  const tableData = quote.items.map(item => [
    item.name,
    item.type,
    item.quantity,
    fmt(item.unitPrice),
    fmt(item.unitPrice * item.quantity)
  ]);

  // Use type casting to call autoTable which is added by 'jspdf-autotable'
  (doc as any).autoTable({
    startY: 90,
    head: [['Serviço', 'Tipo', 'Qtd', 'Unitário', 'Total']],
    body: tableData,
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 },
    theme: 'grid',
  });

  // --- TOTALS SECTION ---
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  const pageHeight = doc.internal.pageSize.height;

  // Add a new page if we're too low
  if (finalY > pageHeight - 100) {
    doc.addPage();
    finalY = 20;
  }

  const subtotal = quote.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 130, finalY);
  doc.text(fmt(subtotal), 170, finalY, { align: 'right' });

  if (quote.discount > 0) {
    finalY += 6;
    doc.text('Desconto:', 130, finalY);
    doc.text(`- ${fmt(quote.discount)}`, 170, finalY, { align: 'right' });
  }

  if (quote.extraFees > 0) {
    finalY += 6;
    doc.text('Taxas Adicionais:', 130, finalY);
    doc.text(`+ ${fmt(quote.extraFees)}`, 170, finalY, { align: 'right' });
  }

  finalY += 10;
  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL FINAL:', 130, finalY);
  doc.text(fmt(quote.total), 170, finalY, { align: 'right' });

  // --- PAYMENT & NOTES ---
  finalY += 20;
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CONDIÇÕES DE PAGAMENTO:', 20, finalY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  finalY += 7;
  doc.text(`Método: ${quote.paymentMethod}`, 20, finalY);
  finalY += 5;
  doc.text(quote.paymentConditions, 20, finalY);

  if (profile.defaultTerms || quote.notes) {
    finalY += 15;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('OBSERVAÇÕES ADICIONAIS:', 20, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    finalY += 7;
    const notes = quote.notes || profile.defaultTerms;
    const splitNotes = doc.splitTextToSize(notes, 170);
    doc.text(splitNotes, 20, finalY);
  }

  // --- FOOTER / SIGNATURE ---
  const footerY = pageHeight - 40;
  doc.line(20, footerY, 90, footerY);
  doc.setFontSize(10);
  doc.text(profile.name, 20, footerY + 6);
  doc.text('Assinatura do Fotógrafo', 20, footerY + 11);

  // Save the PDF
  doc.save(`Orcamento_${quote.number}_${client.name.replace(/\s+/g, '_')}.pdf`);
};