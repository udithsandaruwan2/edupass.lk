const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');

/** Minimal iCalendar file for one event. */
export function toIcs(event: { uid: string; title: string; start: string; hours: number; location: string; description: string }) {
  const start = new Date(event.start);
  const end = new Date(start.getTime() + event.hours * 3600000);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EduPass Demo//EN',
    'BEGIN:VEVENT',
    `UID:${event.uid}@edupass.demo`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(event.location)}`,
    `DESCRIPTION:${esc(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
