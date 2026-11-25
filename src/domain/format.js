const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat('en-IN');
const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export const formatCurrency = (n) => currency.format(Number(n) || 0);
export const formatNumber = (n) => number.format(Number(n) || 0);
export const formatDateTime = (iso) => {
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateTime.format(d);
};
export const formatSigned = (n) => (n > 0 ? `+${n}` : String(n));
