// DEMO DATA — seminars, lecturers and organisers are fictional. Dates are relative to today.
import type { Level, Seminar, SeminarMode, TicketType } from '../../types';
import { daysFromNow } from '../../utils/date';
import { slugify } from '../../utils/format';

interface SeminarSeed {
  id: string;
  title: string;
  subject: string;
  level?: Level;
  categoryId: string;
  lecturerId: string;
  organiserId: string;
  mode: SeminarMode;
  venue: string;
  district: string;
  inDays: number;
  hour?: number;
  durationHours?: number;
  price: number;
  capacity: number;
  summary: string;
  featured?: boolean;
  status?: Seminar['status'];
  language?: Seminar['language'];
}

// Seed capacities are scaled down to keep the generated booking history small enough for localStorage
const CAPACITY_SCALE = 0.4;

function ticketTypesFor(seed: SeminarSeed): TicketType[] {
  const s = { ...seed, capacity: Math.round(seed.capacity * CAPACITY_SCALE) };
  const types: TicketType[] = [];
  if (s.mode !== 'online') {
    types.push(
      { id: `${s.id}-std`, name: 'Standard seat', description: 'General admission to the hall with the printed paper pack.', price: s.price, capacity: Math.round(s.capacity * 0.7), sold: 0 },
      { id: `${s.id}-prm`, name: 'Front-row premium', description: 'Reserved front-section seat, printed notes and a marked answer script.', price: Math.round((s.price * 1.6) / 100) * 100, capacity: Math.round(s.capacity * 0.15), sold: 0 },
    );
  }
  if (s.mode !== 'physical') {
    types.push({ id: `${s.id}-onl`, name: 'Online live stream', description: 'Live stream access plus a 14-day recording and PDF notes.', price: Math.round((s.price * 0.75) / 100) * 100, capacity: s.mode === 'online' ? s.capacity : Math.round(s.capacity * 0.15), sold: 0 });
  }
  return types;
}

function build(s: SeminarSeed): Seminar {
  const hour = s.hour ?? 8;
  return {
    id: s.id,
    slug: slugify(s.title),
    title: s.title,
    subject: s.subject,
    level: s.level ?? 'A/L',
    categoryId: s.categoryId,
    lecturerId: s.lecturerId,
    organiserId: s.organiserId,
    mode: s.mode,
    venue: s.venue,
    district: s.district,
    startsAt: daysFromNow(s.inDays, hour, 30),
    durationHours: s.durationHours ?? 5,
    summary: s.summary,
    description: `${s.summary} The session is designed around the current ${s.level ?? 'A/L'} ${s.subject} syllabus and the marking scheme examiners use. Bring a calculator, two pens and your school ID — doors open 30 minutes before the start time.`,
    highlights: [
      `Complete ${s.subject} coverage mapped to the latest syllabus`,
      'Timed model paper with a full answer walkthrough',
      'Printed or PDF notes for every ticket holder',
      'Live Q&A with the lecturer at the end of the session',
    ],
    agenda: [
      { time: `${hour}:30`, title: 'Registration & QR check-in' },
      { time: `${hour + 1}:00`, title: 'Core theory review' },
      { time: `${hour + 2}:30`, title: 'Timed paper — Part I' },
      { time: `${hour + 3}:30`, title: 'Break' },
      { time: `${hour + 4}:00`, title: 'Answer walkthrough & Q&A' },
    ],
    ticketTypes: ticketTypesFor(s),
    status: s.status ?? 'published',
    checkInMode: 'qr_gate',
    featured: s.featured ?? false,
    language: s.language ?? 'Sinhala',
    createdAt: daysFromNow(Math.min(s.inDays, 0) - 45),
  };
}

const SEEDS: SeminarSeed[] = [
  { id: 'sem-econ-system', title: 'Economics Full-System Revision Day', subject: 'Economics', categoryId: 'cat-revision', lecturerId: 'lec-dilan', organiserId: 'org-lumina', mode: 'hybrid', venue: 'Lumina Hall, Nugegoda', district: 'Colombo', inDays: 9, price: 1800, capacity: 400, featured: true, summary: 'A full-day rebuild of the A/L Economics syllabus — micro, macro and the Sri Lankan economy — in one structured session.' },
  { id: 'sem-cmaths-paper', title: 'Combined Maths Model Paper Marathon', subject: 'Combined Maths', categoryId: 'cat-paper', lecturerId: 'lec-ishara', organiserId: 'org-apex', mode: 'physical', venue: 'BMICH Main Hall, Colombo 07', district: 'Colombo', inDays: 16, price: 2000, capacity: 900, featured: true, summary: 'Two full model papers under exam conditions, then a lecturer-led walkthrough of every question.' },
  { id: 'sem-physics-mech', title: 'Physics Mechanics Masterclass', subject: 'Physics', categoryId: 'cat-target', lecturerId: 'lec-ravindu', organiserId: 'org-apex', mode: 'hybrid', venue: 'Apex Auditorium, Colombo 07', district: 'Colombo', inDays: 23, hour: 9, price: 2200, capacity: 500, featured: true, summary: 'Mechanics from first principles to structured-essay answers, with live demonstrations.', language: 'English' },
  { id: 'sem-bs-target', title: 'Business Studies Target Workshop', subject: 'Business Studies', categoryId: 'cat-target', lecturerId: 'lec-tharindu', organiserId: 'org-lumina', mode: 'online', venue: 'Online live hall', district: 'Online', inDays: 5, hour: 18, durationHours: 3, price: 1500, capacity: 1200, summary: 'An evening workshop on the essay topics most likely to appear this year.' },
  { id: 'sem-chem-organic', title: 'Organic Chemistry Pathways Seminar', subject: 'Chemistry', categoryId: 'cat-theory', lecturerId: 'lec-nadeesha', organiserId: 'org-kandy', mode: 'physical', venue: 'Kandy City Centre Hall', district: 'Kandy', inDays: 30, price: 1900, capacity: 350, summary: 'Every organic conversion on one map, plus a 50-question MCQ paper.' },
  { id: 'sem-ol-maths', title: 'O/L Mathematics Structured Paper Day', subject: 'Mathematics', level: 'O/L', categoryId: 'cat-ol', lecturerId: 'lec-sachini', organiserId: 'org-kandy', mode: 'hybrid', venue: 'Kandy Learning Hub, Peradeniya Rd', district: 'Kandy', inDays: 12, price: 1200, capacity: 300, featured: true, summary: 'Structured-question practice for O/L Maths with step marks explained.' },
  { id: 'sem-bio-genetics', title: 'Biology Genetics Live Stream', subject: 'Biology', categoryId: 'cat-theory', lecturerId: 'lec-kavindu', organiserId: 'org-zenith', mode: 'online', venue: 'Online live hall', district: 'Online', inDays: 19, hour: 19, durationHours: 3, price: 1400, capacity: 1500, summary: 'Genetics and evolution in a diagram-first live stream with downloadable sheets.', language: 'English' },
  { id: 'sem-english-ol', title: 'O/L English Writing Bootcamp', subject: 'English', level: 'O/L', categoryId: 'cat-ol', lecturerId: 'lec-amaya', organiserId: 'org-zenith', mode: 'online', venue: 'Online live hall', district: 'Online', inDays: 40, hour: 16, durationHours: 3, price: 1000, capacity: 1000, summary: 'Essay, letter and comprehension drills with model answers for O/L English.', language: 'English' },
  { id: 'sem-physics-practical', title: 'Physics Practical Lab Workshop', subject: 'Physics', categoryId: 'cat-practical', lecturerId: 'lec-ravindu', organiserId: 'org-apex', mode: 'physical', venue: 'Apex Science Labs, Colombo 07', district: 'Colombo', inDays: 52, price: 2500, capacity: 120, summary: 'Hands-on practice with every prescribed practical in small lab groups.', language: 'English' },
  { id: 'sem-econ-paper', title: 'Economics Essay Paper Class', subject: 'Economics', categoryId: 'cat-paper', lecturerId: 'lec-dilan', organiserId: 'org-lumina', mode: 'physical', venue: 'Galle Town Hall', district: 'Galle', inDays: 66, price: 1600, capacity: 450, summary: 'A full Part II essay paper with examiner-style marking in the southern province.' },
  { id: 'sem-cmaths-revision', title: 'Combined Maths Final Revision', subject: 'Combined Maths', categoryId: 'cat-revision', lecturerId: 'lec-ishara', organiserId: 'org-apex', mode: 'hybrid', venue: 'Nelum Pokuna Auditorium, Colombo 07', district: 'Colombo', inDays: 88, price: 2400, capacity: 1100, featured: true, summary: 'The final pre-exam revision: pure and applied maths in a single day.' },
  // Past sessions (bookings history, analytics, check-in records)
  { id: 'sem-econ-past', title: 'Economics Data-Response Workshop', subject: 'Economics', categoryId: 'cat-theory', lecturerId: 'lec-dilan', organiserId: 'org-lumina', mode: 'hybrid', venue: 'Lumina Hall, Nugegoda', district: 'Colombo', inDays: -18, price: 1500, capacity: 380, summary: 'Reading tables, graphs and indices for the data-response section.' },
  { id: 'sem-chem-past', title: 'Physical Chemistry Paper Class', subject: 'Chemistry', categoryId: 'cat-paper', lecturerId: 'lec-nadeesha', organiserId: 'org-kandy', mode: 'physical', venue: 'Kandy City Centre Hall', district: 'Kandy', inDays: -35, price: 1700, capacity: 300, summary: 'Energetics, kinetics and equilibrium under exam conditions.' },
  { id: 'sem-bs-past', title: 'Accounting Fundamentals Seminar', subject: 'Accounting', categoryId: 'cat-revision', lecturerId: 'lec-tharindu', organiserId: 'org-lumina', mode: 'online', venue: 'Online live hall', district: 'Online', inDays: -52, hour: 18, durationHours: 3, price: 1300, capacity: 900, summary: 'Final accounts, ratios and partnership accounts in one evening.' },
  // Not publicly listed
  { id: 'sem-ict-draft', title: 'A/L ICT Programming Workshop', subject: 'ICT', categoryId: 'cat-target', lecturerId: 'lec-new', organiserId: 'org-lumina', mode: 'hybrid', venue: 'Lumina Hall, Nugegoda', district: 'Colombo', inDays: 75, price: 1800, capacity: 250, status: 'draft', summary: 'Python fundamentals and past-paper programming questions.' },
  { id: 'sem-cancelled', title: 'Biology Practical Day', subject: 'Biology', categoryId: 'cat-practical', lecturerId: 'lec-kavindu', organiserId: 'org-zenith', mode: 'physical', venue: 'Kurunegala Town Hall', district: 'Kurunegala', inDays: 27, price: 2100, capacity: 200, status: 'cancelled', summary: 'Dissection and microscope practice. Cancelled by the organiser.' },
];

export const buildSeminars = (): Seminar[] => SEEDS.map(build);
