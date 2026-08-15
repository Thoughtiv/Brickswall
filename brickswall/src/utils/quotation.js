/**
 * Shared helpers for the /editor quotation generator:
 * money formatting, Indian-system number-to-words, defaults and totals.
 */

/* ────────────── Formatting ────────────── */

export function toNumber(value) {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** Screen formatting, e.g. ₹12,34,567 */
export function formatINR(value, decimals = 0) {
  return `₹${toNumber(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * PDF formatting, e.g. Rs. 12,34,567
 * jsPDF's built-in fonts use WinAnsi encoding, which has no ₹ glyph, so the
 * PDF spells out "Rs." instead of rendering a broken character.
 */
export function formatPdfMoney(value, decimals = 0) {
  return `Rs. ${toNumber(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

export function formatNumber(value) {
  return toNumber(value).toLocaleString('en-IN');
}

/** "2026-08-14" → "14 August 2026" */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function spell(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} Hundred` + (n % 100 ? ` ${spell(n % 100)}` : '');
  if (n < 100000) return `${spell(Math.floor(n / 1000))} Thousand` + (n % 1000 ? ` ${spell(n % 1000)}` : '');
  if (n < 10000000) return `${spell(Math.floor(n / 100000))} Lakh` + (n % 100000 ? ` ${spell(n % 100000)}` : '');
  return `${spell(Math.floor(n / 10000000))} Crore` + (n % 10000000 ? ` ${spell(n % 10000000)}` : '');
}

/** Indian numbering system, e.g. "Rupees Forty Two Lakh Fifty Thousand Only" */
export function numberToWords(value) {
  const n = Math.round(toNumber(value));
  if (n <= 0) return 'Rupees Zero Only';
  return `Rupees ${spell(n)} Only`;
}

/* ────────────── Defaults ────────────── */

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Quotation numbers are date-based rather than sequential because quotations
 * are not persisted server-side. The field stays editable in the form.
 */
export function generateQuoteNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(now.getTime() / 1000) % 1000).padStart(3, '0');
  return `BW/${year}-${month}/${seq}`;
}

export const FLOOR_LABELS = [
  'Ground Floor', 'First Floor', 'Second Floor', 'Third Floor',
  'Fourth Floor', 'Fifth Floor', 'Sixth Floor'
];

let rowIdCounter = 0;
export function nextRowId(prefix = 'row') {
  rowIdCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${rowIdCounter}`;
}

export function emptyFloor(index = 0) {
  return {
    id: nextRowId('floor'),
    label: FLOOR_LABELS[index] || `Floor ${index + 1}`,
    area: ''
  };
}

export function emptyLineItem() {
  return {
    id: nextRowId('item'),
    description: '',
    qty: '1',
    unit: 'Nos',
    rate: ''
  };
}

/** One-click add-ons for the extras table */
export const LINE_ITEM_PRESETS = [
  { description: 'Compound Wall Construction', unit: 'Rft', qty: '100', rate: '850' },
  { description: 'Underground Sump & Overhead Tank', unit: 'Nos', qty: '1', rate: '145000' },
  { description: 'Elevation Cladding & Stone Work', unit: 'Sq.ft', qty: '400', rate: '320' },
  { description: 'Rooftop Solar Preparation', unit: 'Nos', qty: '1', rate: '85000' },
  { description: 'Modular Interiors (Kitchen & Wardrobes)', unit: 'Sq.ft', qty: '350', rate: '1450' },
  { description: 'Borewell Drilling & Motor', unit: 'Nos', qty: '1', rate: '95000' },
  { description: 'Landscaping & Exterior Paving', unit: 'Sq.ft', qty: '500', rate: '240' },
  { description: 'GHMC / HMDA Approval Assistance', unit: 'Lot', qty: '1', rate: '60000' }
];

export function defaultMilestones() {
  return [
    { id: nextRowId('ms'), stage: 'Booking Advance (on agreement signing)', percent: '10' },
    { id: nextRowId('ms'), stage: 'On completion of foundation & plinth beam', percent: '15' },
    { id: nextRowId('ms'), stage: 'On completion of ground floor roof slab', percent: '20' },
    { id: nextRowId('ms'), stage: 'On completion of brickwork & remaining slabs', percent: '20' },
    { id: nextRowId('ms'), stage: 'On completion of plastering, flooring & joinery', percent: '20' },
    { id: nextRowId('ms'), stage: 'On final painting, fittings & handover', percent: '15' }
  ];
}

export function defaultTerms() {
  return [
    'This quotation is valid for the period stated above. Rates are subject to revision thereafter.',
    'Rates are calculated on the total built-up area, measured to the outer face of the external walls, including balconies, staircases, utility areas and parapet walls.',
    'The quoted rate covers material, labour, supervision and standard finishes as per the specification table above.',
    'Government approvals (GHMC / HMDA / Panchayat), betterment charges, electricity and water meter deposits are not included and are payable at actuals by the client.',
    'Compound wall, sump, overhead tank, borewell, interiors, landscaping and solar works are chargeable separately unless explicitly listed above.',
    'Any change in the approved drawing or specification after work commencement will be treated as an extra item and billed at mutually agreed rates.',
    'Water and three-phase electricity connections at the site are to be arranged by the client before work commences.',
    'Payments are due as per the milestone schedule above, within 3 working days of the stage completion intimation.',
    'The construction timeline commences from the date of receipt of the booking advance and approved drawings, subject to force majeure conditions.'
  ];
}

/**
 * The matrix row for price per sq.ft is excluded because the negotiated rate is
 * captured separately in the form, and the two figures can legitimately differ.
 */
export const EXCLUDED_MATRIX_FEATURES = ['price per built-up sq.ft', 'price per sq.ft', 'price per built up sq.ft'];

export function isPriceMatrixRow(feature) {
  return EXCLUDED_MATRIX_FEATURES.includes(String(feature || '').trim().toLowerCase());
}

/**
 * Build the specification rows for a package from the shared comparison matrix.
 */
export function specsFromMatrix(matrix, packageId) {
  if (!Array.isArray(matrix)) return [];
  return matrix
    .filter(row => row && row.feature && !isPriceMatrixRow(row.feature))
    .map(row => ({
      id: nextRowId('spec'),
      feature: row.feature,
      value: row[packageId] || '—',
      included: true
    }));
}

/* ────────────── Totals ────────────── */

export function computeTotals(form) {
  const totalArea = (form.floors || []).reduce((sum, f) => sum + toNumber(f.area), 0);
  const rate = toNumber(form.rate);
  const baseCost = totalArea * rate;

  const lineItems = (form.lineItems || []).map(item => ({
    ...item,
    amount: toNumber(item.qty) * toNumber(item.rate)
  }));
  const addOnsTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const subtotal = baseCost + addOnsTotal;

  const discountAmount = form.discountMode === 'percent'
    ? (subtotal * toNumber(form.discountValue)) / 100
    : toNumber(form.discountValue);
  const cappedDiscount = Math.min(Math.max(discountAmount, 0), subtotal);

  const taxableAmount = subtotal - cappedDiscount;
  const gstAmount = form.gstEnabled ? (taxableAmount * toNumber(form.gstPercent)) / 100 : 0;
  const grandTotal = taxableAmount + gstAmount;

  const listRate = toNumber(form.listRate);
  const rateDelta = listRate ? rate - listRate : 0;

  const milestones = (form.milestones || []).map(m => ({
    ...m,
    amount: (grandTotal * toNumber(m.percent)) / 100
  }));
  const milestoneTotalPercent = (form.milestones || []).reduce((sum, m) => sum + toNumber(m.percent), 0);

  return {
    totalArea,
    rate,
    baseCost,
    lineItems,
    addOnsTotal,
    subtotal,
    discountAmount: cappedDiscount,
    taxableAmount,
    gstAmount,
    grandTotal,
    grandTotalWords: numberToWords(grandTotal),
    listRate,
    rateDelta,
    milestones,
    milestoneTotalPercent
  };
}

/** Blank form state for a fresh quotation. */
export function createInitialForm() {
  return {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    siteLocation: '',
    quoteNumber: generateQuoteNumber(),
    quoteDate: todayISO(),
    validUntil: addDaysISO(15),
    packageId: '',
    packageName: '',
    packageDesc: '',
    rate: '',
    listRate: '',
    floors: [emptyFloor(0)],
    specs: [],
    lineItems: [],
    discountMode: 'amount',
    discountValue: '',
    gstEnabled: true,
    gstPercent: '18',
    milestones: defaultMilestones(),
    terms: defaultTerms(),
    notes: ''
  };
}
