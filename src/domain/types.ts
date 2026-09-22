export type ExamLevel = "O/L" | "A/L";
export type Medium = "Sinhala" | "English" | "Tamil";
export type UserRole = "guest" | "student" | "admin" | "scanner" | "organizer" | "lecturer";

export type PaymentMethod = "card" | "bank_slip" | "cash";
export type PaymentStatus = "pending" | "approved" | "rejected" | "paid";
export type PaymentKind = "seminar_pass" | "monthly_fee";

export type Lecturer = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  subjects: string[];
  levels: ExamLevel[];
  mediums: Medium[];
  city: string;
  photoHue: number;
};

export type Seminar = {
  id: string;
  lecturerId: string;
  subject: string;
  level: ExamLevel;
  medium: Medium;
  venue: string;
  city: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  price: number;
  seats: number;
  seatsLeft: number;
  description: string;
  stream?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verified: boolean;
  instituteId?: string;
};

export type Pass = {
  id: string;
  code: string;
  seminarId: string;
  userId: string;
  seats: number;
  paymentId: string;
  status: "active" | "used" | "cancelled";
  issuedAt: string;
  checkedInAt?: string;
};

export type Payment = {
  id: string;
  kind: PaymentKind;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  userId: string;
  seminarId?: string;
  feeId?: string;
  seats?: number;
  slipDataUrl?: string;
  slipNote?: string;
  createdAt: string;
  reviewedAt?: string;
};

export type AttendanceRecord = {
  id: string;
  passId?: string;
  classId?: string;
  studentId: string;
  seminarId?: string;
  markedAt: string;
  markedBy: string;
  present: boolean;
};

export type Institute = {
  id: string;
  name: string;
  city: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
};

export type TuitionClass = {
  id: string;
  instituteId: string;
  lecturerId?: string;
  name: string;
  subject: string;
  level: ExamLevel;
  medium: Medium;
  schedule: string;
  monthlyFee: number;
  studentIds: string[];
};

export type MonthlyFee = {
  id: string;
  classId: string;
  studentId: string;
  month: string; // YYYY-MM
  amount: number;
  status: PaymentStatus;
  paymentId?: string;
  paidMethod?: PaymentMethod;
};

export type AppStore = {
  lecturers: Lecturer[];
  seminars: Seminar[];
  users: User[];
  passes: Pass[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  institutes: Institute[];
  classes: TuitionClass[];
  fees: MonthlyFee[];
  sessionUserId: string | null;
  verificationCodes: Record<string, string>;
};
