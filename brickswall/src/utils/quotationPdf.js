import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  formatPdfMoney,
  formatNumber,
  formatDate,
  toNumber,
  computeTotals
} from './quotation';

/* Brand palette, mirrored from index.css */
const ORANGE = [217, 83, 30];
const NAVY = [15, 23, 42];
const SLATE = [100, 116, 139];
const BORDER = [226, 232, 240];
const SUBTLE = [248, 250, 252];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

/**
 * Load the site logo as a data URL so it can be embedded in the PDF.
 * Returns null on any failure - the header then falls back to text only.
 */
async function loadLogo() {
  try {
    const res = await fetch('/Brickswall-logo_birefnet.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not embed logo in PDF:', err.message);
    return null;
  }
}

function drawLetterhead(doc, logo, settings) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 30, 'F');
  doc.setFillColor(...ORANGE);
  doc.rect(0, 30, PAGE_W, 1.6, 'F');

  let textX = MARGIN;
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', MARGIN, 7, 16, 16);
      textX = MARGIN + 20;
    } catch {
      textX = MARGIN;
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BRICKS WALL', textX, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Turnkey Construction & Interiors  |  Hyderabad', textX, 19.5);

  const phone = settings?.phone_primary || '+91 9949249091';
  const email = settings?.email || 'Hello@brickswall.in';
  doc.setFontSize(7.5);
  doc.text(phone, PAGE_W - MARGIN, 12, { align: 'right' });
  doc.text(email, PAGE_W - MARGIN, 16, { align: 'right' });
  doc.text('www.brickswall.in', PAGE_W - MARGIN, 20, { align: 'right' });

  const address = settings?.address || '';
  if (address) {
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    const lines = doc.splitTextToSize(address, 88);
    doc.text(lines.slice(0, 2), PAGE_W - MARGIN, 24, { align: 'right' });
  }
}

/** Section heading with a thin orange rule; returns the Y to continue from. */
function sectionTitle(doc, title, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(title.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 1.6, MARGIN + 22, y + 1.6);
  return y + 6;
}

/** Start a fresh page when the next block would overflow the footer area. */
function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE_H - 22) {
    doc.addPage();
    return MARGIN + 8;
  }
  return y;
}

function drawFooters(doc, form) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text(`Quotation ${form.quoteNumber}`, MARGIN, PAGE_H - 9.5);
    doc.text('Bricks Wall Construction Co.', PAGE_W / 2, PAGE_H - 9.5, { align: 'center' });
    doc.text(`Page ${i} of ${total}`, PAGE_W - MARGIN, PAGE_H - 9.5, { align: 'right' });
  }
}

/**
 * Build and download the quotation PDF.
 */
export async function generateQuotationPdf(form, settings) {
  const totals = computeTotals(form);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logo = await loadLogo();

  drawLetterhead(doc, logo, settings);

  /* ── Title row ── */
  let y = 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(...NAVY);
  doc.text('QUOTATION', MARGIN, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(`No. ${form.quoteNumber}`, PAGE_W - MARGIN, y - 4, { align: 'right' });
  doc.text(`Date: ${formatDate(form.quoteDate)}`, PAGE_W - MARGIN, y, { align: 'right' });
  doc.text(`Valid until: ${formatDate(form.validUntil)}`, PAGE_W - MARGIN, y + 4, { align: 'right' });

  /* ── Client / project block ── */
  y += 10;
  const boxH = 26;
  doc.setFillColor(...SUBTLE);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W / 2 - 2, boxH, 'FD');
  doc.rect(MARGIN + CONTENT_W / 2 + 2, y, CONTENT_W / 2 - 2, boxH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...ORANGE);
  doc.text('PREPARED FOR', MARGIN + 4, y + 5.5);
  doc.text('PROJECT DETAILS', MARGIN + CONTENT_W / 2 + 6, y + 5.5);

  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(form.clientName || '—', MARGIN + 4, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  const contact = [form.clientPhone, form.clientEmail].filter(Boolean).join('  |  ');
  if (contact) doc.text(doc.splitTextToSize(contact, CONTENT_W / 2 - 10), MARGIN + 4, y + 16.5);
  if (form.siteLocation) {
    doc.text(doc.splitTextToSize(`Site: ${form.siteLocation}`, CONTENT_W / 2 - 10).slice(0, 2), MARGIN + 4, y + 21.5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(form.packageName || '—', MARGIN + CONTENT_W / 2 + 6, y + 11.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(`Rate: ${formatPdfMoney(totals.rate)} per sq.ft`, MARGIN + CONTENT_W / 2 + 6, y + 16.5);
  doc.text(`Total built-up area: ${formatNumber(totals.totalArea)} sq.ft`, MARGIN + CONTENT_W / 2 + 6, y + 21.5);

  y += boxH + 9;

  /* ── Cost summary ── */
  y = sectionTitle(doc, 'Cost Summary', y);

  const areaRows = (form.floors || [])
    .filter(f => toNumber(f.area) > 0)
    .map(f => [
      f.label,
      `${formatNumber(f.area)} sq.ft`,
      formatPdfMoney(totals.rate),
      formatPdfMoney(toNumber(f.area) * totals.rate)
    ]);

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Built-up Area', 'Rate / Sq.ft', 'Amount']],
    body: areaRows.length ? areaRows : [['—', '—', '—', '—']],
    foot: [['Base Construction Cost', `${formatNumber(totals.totalArea)} sq.ft`, '', formatPdfMoney(totals.baseCost)]],
    theme: 'grid',
    margin: { left: MARGIN, right: MARGIN },
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, lineColor: BORDER, lineWidth: 0.2 },
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    footStyles: { fillColor: SUBTLE, textColor: NAVY, fontStyle: 'bold', fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 32, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 36, halign: 'right' }
    }
  });
  y = doc.lastAutoTable.finalY + 8;

  /* ── Additional works ── */
  if (totals.lineItems.length > 0) {
    y = ensureSpace(doc, y, 30);
    y = sectionTitle(doc, 'Additional Works', y);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Description', 'Qty', 'Unit', 'Rate', 'Amount']],
      body: totals.lineItems.map((item, i) => [
        i + 1,
        item.description || '—',
        formatNumber(item.qty),
        item.unit || '',
        formatPdfMoney(item.rate),
        formatPdfMoney(item.amount)
      ]),
      foot: [['', 'Additional Works Total', '', '', '', formatPdfMoney(totals.addOnsTotal)]],
      theme: 'grid',
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, lineColor: BORDER, lineWidth: 0.2 },
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: SUBTLE, textColor: NAVY, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 9, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 16, halign: 'right' },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 27, halign: 'right' },
        5: { cellWidth: 32, halign: 'right' }
      }
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  /* ── Totals ── */
  y = ensureSpace(doc, y, 52);
  const totalsRows = [['Subtotal', formatPdfMoney(totals.subtotal)]];
  if (totals.discountAmount > 0) {
    const label = form.discountMode === 'percent'
      ? `Discount (${toNumber(form.discountValue)}%)`
      : 'Discount';
    totalsRows.push([label, `- ${formatPdfMoney(totals.discountAmount)}`]);
    totalsRows.push(['Amount after discount', formatPdfMoney(totals.taxableAmount)]);
  }
  if (form.gstEnabled) {
    totalsRows.push([`GST (${toNumber(form.gstPercent)}%)`, formatPdfMoney(totals.gstAmount)]);
  }

  const totalsW = 84;
  autoTable(doc, {
    startY: y,
    body: totalsRows,
    foot: [['Grand Total', formatPdfMoney(totals.grandTotal)]],
    theme: 'plain',
    margin: { left: PAGE_W - MARGIN - totalsW, right: MARGIN },
    tableWidth: totalsW,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2 },
    footStyles: { fillColor: ORANGE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10.5 },
    columnStyles: {
      0: { cellWidth: 46, textColor: SLATE },
      1: { cellWidth: 38, halign: 'right', fontStyle: 'bold', textColor: NAVY }
    }
  });
  const totalsEndY = doc.lastAutoTable.finalY;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  const words = doc.splitTextToSize(totals.grandTotalWords, CONTENT_W - totalsW - 6);
  doc.text(words, MARGIN, y + 6);

  y = totalsEndY + 9;

  /* ── Specifications ── */
  const includedSpecs = (form.specs || []).filter(s => s.included && s.feature);
  if (includedSpecs.length > 0) {
    y = ensureSpace(doc, y, 34);
    y = sectionTitle(doc, `Specifications Included — ${form.packageName || 'Selected Package'}`, y);
    autoTable(doc, {
      startY: y,
      head: [['Feature / Specification', 'Included Standard']],
      body: includedSpecs.map(s => [s.feature, s.value]),
      theme: 'grid',
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, lineColor: BORDER, lineWidth: 0.2 },
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: SUBTLE },
      columnStyles: {
        0: { cellWidth: 68, fontStyle: 'bold', textColor: NAVY },
        1: { cellWidth: 'auto', textColor: SLATE }
      }
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  /* ── Payment schedule ── */
  if (totals.milestones.length > 0) {
    y = ensureSpace(doc, y, 34);
    y = sectionTitle(doc, 'Payment Schedule', y);
    autoTable(doc, {
      startY: y,
      head: [['Stage', '%', 'Amount']],
      body: totals.milestones.map(m => [m.stage, `${toNumber(m.percent)}%`, formatPdfMoney(m.amount)]),
      foot: [['Total', `${totals.milestoneTotalPercent}%`, formatPdfMoney(totals.grandTotal)]],
      theme: 'grid',
      margin: { left: MARGIN, right: MARGIN },
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, lineColor: BORDER, lineWidth: 0.2 },
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: SUBTLE, textColor: NAVY, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'right' },
        2: { cellWidth: 38, halign: 'right' }
      }
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  /* ── Notes ── */
  if (form.notes && form.notes.trim()) {
    y = ensureSpace(doc, y, 24);
    y = sectionTitle(doc, 'Notes', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    const noteLines = doc.splitTextToSize(form.notes.trim(), CONTENT_W);
    doc.text(noteLines, MARGIN, y);
    y += noteLines.length * 4 + 6;
  }

  /* ── Terms ── */
  const terms = (form.terms || []).filter(t => t && t.trim());
  if (terms.length > 0) {
    y = ensureSpace(doc, y, 30);
    y = sectionTitle(doc, 'Terms & Conditions', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(...SLATE);

    terms.forEach((term, i) => {
      const lines = doc.splitTextToSize(term, CONTENT_W - 6);
      y = ensureSpace(doc, y, lines.length * 3.6 + 3);
      doc.text(`${i + 1}.`, MARGIN, y);
      doc.text(lines, MARGIN + 5, y);
      y += lines.length * 3.6 + 1.8;
    });
    y += 5;
  }

  /* ── Signatures ── */
  y = ensureSpace(doc, y, 32);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y + 14, MARGIN + 60, y + 14);
  doc.line(PAGE_W - MARGIN - 60, y + 14, PAGE_W - MARGIN, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('For Bricks Wall Construction Co.', MARGIN, y + 19);
  doc.text('Accepted by Client', PAGE_W - MARGIN - 60, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SLATE);
  doc.text('Authorised Signatory', MARGIN, y + 23.5);
  doc.text(form.clientName || 'Name & Signature', PAGE_W - MARGIN - 60, y + 23.5);

  drawFooters(doc, form);

  const safeName = (form.clientName || 'client').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  const safeNumber = form.quoteNumber.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  doc.save(`Quotation-${safeNumber}-${safeName}.pdf`);
}
