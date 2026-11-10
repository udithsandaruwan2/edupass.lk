const lkr = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat('en-LK');
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

/** "LKR 1,800.00" */
export const formatLKR = (amount: number) => `LKR ${lkr.format(amount)}`;
/** "1,800.00" — for layouts that set the currency label separately */
export const formatAmount = (amount: number) => lkr.format(amount);
export const formatNumber = (n: number) => whole.format(n);
/** 1,284 / 12.9K / 4.2M */
export const formatCompact = (n: number) => (Math.abs(n) < 10000 ? whole.format(n) : compact.format(n));
export const formatPercent = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

export const MODE_LABELS = {
  physical: 'Physical session',
  online: 'Online stream',
  hybrid: 'Physical & online',
} as const;

export const PAYMENT_LABELS = {
  card: 'Credit / debit card',
  bank_transfer: 'Bank transfer',
  ez_cash: 'Mobile wallet',
  koko: 'Pay in instalments',
} as const;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}
