export type Validator = (value: string) => string | null;

export const required =
  (label: string): Validator =>
  (v) =>
    v.trim() ? null : `${label} is required`;

export const email: Validator = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Enter a valid email address';

/** Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX */
export const phone: Validator = (v) =>
  /^(?:\+94|0)7\d{8}$/.test(v.replace(/[\s-]/g, '')) ? null : 'Enter a mobile number like 071 234 5678';

export const minLength =
  (label: string, n: number): Validator =>
  (v) =>
    v.trim().length >= n ? null : `${label} must be at least ${n} characters`;

export const password: Validator = (v) => {
  if (v.length < 8) return 'Use at least 8 characters';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number';
  return null;
};

export const positiveNumber =
  (label: string): Validator =>
  (v) => {
    const n = Number(v);
    return v.trim() !== '' && Number.isFinite(n) && n >= 0 ? null : `${label} must be 0 or more`;
  };

/** Luhn check for the demo card form (format validation only; nothing is charged). */
export const cardNumber: Validator = (v) => {
  const digits = v.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return 'Enter a 13–19 digit card number';
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0 ? null : 'This card number is not valid';
};

export const cardExpiry: Validator = (v) => {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(v.trim());
  if (!m) return 'Use MM / YY';
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return 'Month must be 01–12';
  const now = new Date();
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'This card has expired';
  return null;
};

export const cvc: Validator = (v) => (/^\d{3,4}$/.test(v.trim()) ? null : 'Enter the 3 or 4 digit code');

export function runValidators<T extends Record<string, string>>(
  values: T,
  rules: Partial<Record<keyof T, Validator[]>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key in rules) {
    for (const rule of rules[key] ?? []) {
      const msg = rule(values[key] ?? '');
      if (msg) {
        errors[key] = msg;
        break;
      }
    }
  }
  return errors;
}
