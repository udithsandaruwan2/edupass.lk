// DEMO DATA — site content, notifications and settings.
import type { Announcement, Banner, FaqItem, Notification, PlatformSettings, RefundRequest } from '../../types';
import { daysFromNow } from '../../utils/date';

export const BANNERS: Banner[] = [
  { id: 'ban-1', seminarId: 'sem-econ-system', headline: 'Rebuild the whole Economics syllabus in one day', active: true, order: 1 },
  { id: 'ban-2', seminarId: 'sem-cmaths-paper', headline: 'Two full Combined Maths papers, every question explained', active: true, order: 2 },
  { id: 'ban-3', seminarId: 'sem-ol-maths', headline: 'O/L Maths structured questions, step marks explained', active: true, order: 3 },
  { id: 'ban-4', seminarId: 'sem-physics-mech', headline: 'Mechanics from first principles', active: false, order: 4 },
];

export const FAQS: FaqItem[] = [
  { id: 'faq-1', group: 'Booking', question: 'How do I book a seminar ticket?', answer: 'Open a seminar, choose a ticket type and quantity, add it to your cart and complete checkout. Your QR ticket appears in My Tickets straight away.' },
  { id: 'faq-2', group: 'Booking', question: 'Can I book for a friend?', answer: 'Yes. You can buy up to the per-order limit and enter each attendee name on the ticket. Each ticket has its own QR code.' },
  { id: 'faq-3', group: 'Tickets', question: 'What do I show at the entrance?', answer: 'Show the QR code from My Tickets on your phone, or a printed copy. The organiser scans it once; a second scan is rejected.' },
  { id: 'faq-4', group: 'Tickets', question: 'How do online stream tickets work?', answer: 'Online tickets include a stream link that unlocks 30 minutes before the session, plus a recording for 14 days.' },
  { id: 'faq-5', group: 'Payments', question: 'Which payment methods are accepted?', answer: 'Card, bank transfer, mobile wallet and instalment plans are shown at checkout. In this demo build no payment is ever taken.' },
  { id: 'faq-6', group: 'Payments', question: 'Is there a booking fee?', answer: 'A small booking fee is shown on the checkout summary before you pay.' },
  { id: 'faq-7', group: 'Payments', question: 'How do refunds work?', answer: 'Request a refund from My Bookings. Cancelled seminars are refunded in full automatically. See the Refund Policy for timelines.' },
  { id: 'faq-8', group: 'Organisers', question: 'How do I list my seminar?', answer: 'Register as an organiser, complete your profile and create a seminar from your dashboard. New organisers are reviewed before their first seminar is published.' },
  { id: 'faq-9', group: 'Organisers', question: 'How do I check attendees in?', answer: 'Use the Check-in screen in the organiser dashboard to scan or type a ticket code. Each ticket can only be checked in once.' },
  { id: 'faq-10', group: 'Account', question: 'I forgot my password', answer: 'Use “Forgot password” on the login page. We send a one-time code to your email to reset it.' },
  { id: 'faq-11', group: 'Account', question: 'Can I change my email address?', answer: 'Yes, from Account Settings. You will be asked to verify the new address.' },
];

export const ANNOUNCEMENT: Announcement = {
  id: 'ann-1',
  message: 'A/L exam season: new revision days are being added every week.',
  active: true,
};

export const NOTIFICATIONS: Notification[] = [
  { id: 'n-s1', audience: 'student', title: 'Booking confirmed', body: 'Your 2 tickets for Economics Full-System Revision Day are ready in My Tickets.', createdAt: daysFromNow(-6, 10), read: false, link: '/student/tickets' },
  { id: 'n-s2', audience: 'student', title: 'Seminar starts soon', body: 'Business Studies Target Workshop streams in 5 days. Your link unlocks 30 minutes before.', createdAt: daysFromNow(-1, 18), read: false, link: '/student/upcoming' },
  { id: 'n-s3', audience: 'student', title: 'Refund processed', body: 'Biology Practical Day was cancelled by the organiser. Your refund has been issued.', createdAt: daysFromNow(-8, 12), read: true, link: '/student/history' },
  { id: 'n-s4', audience: 'student', title: 'New seminar from a lecturer you saved', body: 'Dilan Wickramasinghe added Economics Essay Paper Class.', createdAt: daysFromNow(-12, 9), read: true, link: '/seminars/economics-essay-paper-class' },
  { id: 'n-o1', audience: 'organiser', title: 'Ticket sales milestone', body: 'Economics Full-System Revision Day passed 50% of capacity.', createdAt: daysFromNow(-2, 11), read: false, link: '/organiser/performance' },
  { id: 'n-o2', audience: 'organiser', title: 'New refund request', body: 'A student asked for a refund on Business Studies Target Workshop.', createdAt: daysFromNow(-1, 15), read: false, link: '/organiser/bookings' },
  { id: 'n-o3', audience: 'organiser', title: 'Lecturer invitation pending', body: 'Pasindu Herath has not accepted the invitation yet.', createdAt: daysFromNow(-4, 9), read: true, link: '/organiser/lecturers' },
  { id: 'n-o4', audience: 'organiser', title: 'Draft not published', body: 'A/L ICT Programming Workshop is still a draft.', createdAt: daysFromNow(-5, 9), read: true, link: '/organiser/seminars' },
  { id: 'n-a1', audience: 'admin', title: 'Organiser awaiting approval', body: 'Galle Exam Centre registered and needs verification.', createdAt: daysFromNow(-6, 14), read: false, link: '/admin/organisers' },
  { id: 'n-a2', audience: 'admin', title: 'Refund requests open', body: 'There are refund requests waiting for review.', createdAt: daysFromNow(-1, 10), read: false, link: '/admin/refunds' },
  { id: 'n-a3', audience: 'admin', title: 'Seminar cancelled', body: 'Zenith Online Classroom cancelled Biology Practical Day; bookings were refunded.', createdAt: daysFromNow(-9, 16), read: true, link: '/admin/seminars' },
];

export const REFUND_SEED: Omit<RefundRequest, 'orderId' | 'studentId' | 'amount'>[] = [
  { id: 'ref-1', reason: 'Exam timetable clash with a school term test.', status: 'open', createdAt: daysFromNow(-1, 15) },
  { id: 'ref-2', reason: 'Booked the wrong ticket type (wanted online).', status: 'open', createdAt: daysFromNow(-2, 11) },
  { id: 'ref-3', reason: 'Unable to travel to the venue.', status: 'approved', createdAt: daysFromNow(-9, 10) },
  { id: 'ref-4', reason: 'Changed my mind.', status: 'rejected', createdAt: daysFromNow(-14, 13) },
];

export const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'EduPass',
  supportEmail: 'support@edupass.demo',
  bookingFeePercent: 3,
  maxTicketsPerOrder: 6,
  maintenanceMode: false,
  requireOrganiserApproval: true,
};
