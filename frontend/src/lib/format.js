import Decimal from 'decimal.js';

export function inr(value, currency = 'INR') {
  const amount = Number(value || 0);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
  return currency === 'INR' ? `₹${formatted}` : `${currency} ${formatted}`;
}

export function dateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function prettyDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function todayInput() {
  return dateInput(new Date());
}

function amount(value) {
  try {
    return new Decimal(value || 0);
  } catch {
    return new Decimal(0);
  }
}

export function previewDocument(items, additionalCharges = 0) {
  const priced = (items || []).map((item) => {
    const gross = amount(item.quantity).times(amount(item.unitPrice));
    const subtotal = Decimal.max(gross.minus(amount(item.discountAmount)), 0);
    const tax = amount(item.taxRate).gt(0) ? subtotal.times(amount(item.taxRate)).div(100) : new Decimal(0);
    return { subtotal, tax, total: subtotal.plus(tax), discount: amount(item.discountAmount) };
  });
  const subtotal = priced.reduce((sum, line) => sum.plus(line.subtotal), new Decimal(0));
  const taxTotal = priced.reduce((sum, line) => sum.plus(line.tax), new Decimal(0));
  const discountTotal = priced.reduce((sum, line) => sum.plus(line.discount), new Decimal(0));
  const grandTotal = subtotal.plus(taxTotal).plus(amount(additionalCharges));
  return {
    lines: priced.map((line) => line.total.toFixed(2)),
    subtotal: subtotal.toFixed(2),
    discountTotal: discountTotal.toFixed(2),
    taxTotal: taxTotal.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
  };
}
