import type {
  Announcement, Banner, Category, FaqItem, Lecturer, Notification, Order,
  Organiser, PlatformSettings, RefundRequest, Seminar, Student, Ticket,
} from '../../types';
import { ANNOUNCEMENT, BANNERS, DEFAULT_SETTINGS, FAQS, NOTIFICATIONS, REFUND_SEED } from './content';
import { generateOrders } from './orders';
import { CATEGORIES, LECTURERS, ORGANISERS, generateStudents } from './people';
import { buildSeminars } from './seminars';

export interface DemoData {
  seminars: Seminar[];
  categories: Category[];
  lecturers: Lecturer[];
  organisers: Organiser[];
  students: Student[];
  orders: Order[];
  tickets: Ticket[];
  notifications: Notification[];
  refunds: RefundRequest[];
  banners: Banner[];
  faqs: FaqItem[];
  announcement: Announcement;
  settings: PlatformSettings;
}

/** Builds a fresh, internally consistent demo dataset. */
export function buildDemoData(): DemoData {
  const seminars = buildSeminars();
  const students = generateStudents();
  const { orders, tickets } = generateOrders(seminars, students);

  // Attach refund requests to real paid orders for upcoming seminars
  const upcomingPaid = orders.filter((o) => {
    const sem = seminars.find((s) => s.id === o.lines[0]!.seminarId);
    return o.status === 'paid' && o.studentId !== 'stu-demo' && sem && new Date(sem.startsAt).getTime() > Date.now();
  });
  const refunds: RefundRequest[] = REFUND_SEED.map((r, i) => {
    const order = upcomingPaid[i * 7]!;
    return { ...r, orderId: order.id, studentId: order.studentId, amount: order.total };
  });

  return {
    seminars,
    categories: CATEGORIES,
    lecturers: LECTURERS,
    organisers: ORGANISERS,
    students,
    orders,
    tickets,
    notifications: NOTIFICATIONS,
    refunds,
    banners: BANNERS,
    faqs: FAQS,
    announcement: ANNOUNCEMENT,
    settings: DEFAULT_SETTINGS,
  };
}

export { DEMO_STUDENT } from './people';
export { BOOKING_FEE_PERCENT, calcFee, makeTickets } from './orders';
