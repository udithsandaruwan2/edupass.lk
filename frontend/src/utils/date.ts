const DAY = 24 * 60 * 60 * 1000;

/** ISO timestamp `days` from today at a fixed local time, so demo data never goes stale. */
export function daysFromNow(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return new Date(d.getTime() + days * DAY).toISOString();
}

export function isPast(iso: string, now = Date.now()): boolean {
  return new Date(iso).getTime() < now;
}

export function daysUntil(iso: string, now = Date.now()): number {
  return Math.ceil((new Date(iso).getTime() - now) / DAY);
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' });
const weekdayFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'short' });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatShortDate = (iso: string) => shortFmt.format(new Date(iso));
export const formatLongDate = (iso: string) => weekdayFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso)).toUpperCase();
export const formatDateTime = (iso: string) => `${formatDate(iso)}, ${formatTime(iso)}`;
export const formatMonth = (d: Date) => monthFmt.format(d);

export function dayAndMonth(iso: string) {
  const d = new Date(iso);
  return { day: String(d.getDate()).padStart(2, '0'), month: monthFmt.format(d).toUpperCase() };
}

export function relativeTime(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(iso);
}

/** Keys and labels for the last `n` calendar months, oldest first. */
export function lastMonths(n: number, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: formatMonth(d) };
  });
}

export const monthKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
};
