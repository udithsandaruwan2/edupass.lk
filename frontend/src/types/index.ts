export type Role = 'student' | 'organiser' | 'admin' | 'lecturer' | 'scanner';

export type StaffRole = 'OWNER' | 'ADMIN' | 'TEACHER' | 'SCANNER' | string;

export type SeminarMode = 'physical' | 'online' | 'hybrid';
export type SeminarStatus = 'draft' | 'published' | 'cancelled';
export type CheckInMode = 'qr_gate' | 'join_link' | 'both';
export type Level = 'A/L' | 'O/L';

export interface TicketType {
  id: string;
  name: string;
  description: string;
  /** Price in whole LKR */
  price: number;
  capacity: number;
  sold: number;
}

export interface Seminar {
  id: string;
  slug: string;
  title: string;
  subject: string;
  level: Level;
  categoryId: string;
  lecturerId: string;
  organiserId: string;
  mode: SeminarMode;
  venue: string;
  district: string;
  /** ISO date-time of the session start */
  startsAt: string;
  durationHours: number;
  summary: string;
  description: string;
  highlights: string[];
  agenda: { time: string; title: string }[];
  ticketTypes: TicketType[];
  status: SeminarStatus;
  /** Required to publish against the API (FR-06). */
  checkInMode?: CheckInMode;
  /** Optional live-stream join URL for online/hybrid seminars. */
  streamJoinUrl?: string;
  featured: boolean;
  language: 'Sinhala' | 'English' | 'Tamil';
  /** Optional poster in /public; generated cover art is used when absent */
  image?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface Lecturer {
  id: string;
  name: string;
  title: string;
  subjects: string[];
  bio: string;
  qualifications: string[];
  yearsTeaching: number;
  rating: number;
  studentsTaught: number;
  organiserId: string;
  status: 'active' | 'invited';
}

export interface Organiser {
  id: string;
  name: string;
  slug: string;
  type: 'Institute' | 'Independent lecturer' | 'School society';
  city: string;
  about: string;
  email: string;
  phone: string;
  verified: boolean;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  school: string;
  district: string;
  stream: string;
  examYear: number;
  status: 'active' | 'suspended';
  joinedAt: string;
}

export interface CartItem {
  seminarId: string;
  ticketTypeId: string;
  quantity: number;
}

export type PaymentMethod = 'card' | 'bank_transfer' | 'ez_cash' | 'koko';
export type OrderStatus = 'paid' | 'failed' | 'refunded' | 'pending';

export interface OrderLine {
  seminarId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  studentId: string;
  lines: OrderLine[];
  subtotal: number;
  fee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  buyer: { name: string; email: string; phone: string };
  createdAt: string;
}

export type TicketStatus = 'valid' | 'checked_in' | 'cancelled';

export interface Ticket {
  id: string;
  /** Printed code encoded in the QR */
  code: string;
  orderId: string;
  studentId: string;
  seminarId: string;
  ticketTypeId: string;
  holderName: string;
  status: TicketStatus;
  checkedInAt?: string;
}

export interface Notification {
  id: string;
  audience: Role;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  studentId: string;
  reason: string;
  amount: number;
  status: 'open' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Banner {
  id: string;
  seminarId: string;
  headline: string;
  active: boolean;
  order: number;
}

export interface FaqItem {
  id: string;
  group: 'Booking' | 'Tickets' | 'Payments' | 'Organisers' | 'Account';
  question: string;
  answer: string;
}

export interface Announcement {
  id: string;
  message: string;
  active: boolean;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  bookingFeePercent: number;
  maxTicketsPerOrder: number;
  maintenanceMode: boolean;
  requireOrganiserApproval: boolean;
}
