import { BANK_DETAILS } from "@/data/seed";
import type {
  AttendanceRecord,
  MonthlyFee,
  Pass,
  Payment,
  PaymentMethod,
  Seminar,
  TuitionClass,
  User,
  UserRole,
} from "@/domain/types";
import { delay, getStore, setStore, uid } from "@/mocks/store";

export function formatLkr(value: number) {
  return `LKR ${value.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export async function listSeminars(filters?: {
  level?: string;
  city?: string;
  medium?: string;
  subject?: string;
  lecturerId?: string;
  q?: string;
}) {
  const { seminars } = getStore();
  let list = [...seminars].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
  if (filters?.level && filters.level !== "All") {
    list = list.filter((s) => s.level === filters.level);
  }
  if (filters?.city && filters.city !== "All") {
    list = list.filter((s) => s.city === filters.city);
  }
  if (filters?.medium && filters.medium !== "All") {
    list = list.filter((s) => s.medium === filters.medium);
  }
  if (filters?.subject && filters.subject !== "All") {
    list = list.filter((s) => s.subject === filters.subject);
  }
  if (filters?.lecturerId) {
    list = list.filter((s) => s.lecturerId === filters.lecturerId);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (s) =>
        s.subject.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.venue.toLowerCase().includes(q),
    );
  }
  return delay(list);
}

export async function getSeminar(id: string) {
  return delay(getStore().seminars.find((s) => s.id === id) ?? null);
}

export async function listLecturers(filters?: { level?: string; q?: string }) {
  let list = [...getStore().lecturers];
  if (filters?.level && filters.level !== "All") {
    list = list.filter((l) => l.levels.includes(filters.level as "O/L" | "A/L"));
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.subjects.some((s) => s.toLowerCase().includes(q)) ||
        l.city.toLowerCase().includes(q),
    );
  }
  return delay(list);
}

export async function getLecturerBySlug(slug: string) {
  return delay(getStore().lecturers.find((l) => l.slug === slug) ?? null);
}

export async function getLecturer(id: string) {
  return delay(getStore().lecturers.find((l) => l.id === id) ?? null);
}

export function getSessionUser(): User | null {
  const s = getStore();
  if (!s.sessionUserId) return null;
  return s.users.find((u) => u.id === s.sessionUserId) ?? null;
}

export async function getCurrentUser() {
  return delay(getSessionUser());
}

export async function switchRole(role: UserRole) {
  const s = getStore();
  if (role === "guest") {
    setStore({ ...s, sessionUserId: null });
    return delay(null);
  }
  const user = s.users.find((u) => u.role === role);
  if (!user) return delay(null);
  setStore({ ...s, sessionUserId: user.id });
  return delay(user);
}

export async function signup(input: { name: string; email: string; password: string }) {
  void input.password;
  const s = getStore();
  if (s.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user: User = {
    id: uid("user"),
    email: input.email,
    name: input.name,
    role: "student",
    verified: false,
  };
  const code = "123456";
  setStore({
    ...s,
    users: [...s.users, user],
    sessionUserId: user.id,
    verificationCodes: { ...s.verificationCodes, [user.id]: code },
  });
  return delay({ user, code });
}

export async function login(input: { email: string; password: string }) {
  void input.password;
  const s = getStore();
  const user = s.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (!user) throw new Error("No account found for that email.");
  setStore({ ...s, sessionUserId: user.id });
  return delay(user);
}

export async function logout() {
  const s = getStore();
  setStore({ ...s, sessionUserId: null });
  return delay(true);
}

export async function verifyEmail(code: string) {
  const s = getStore();
  const user = getSessionUser();
  if (!user) throw new Error("Not signed in.");
  const expected = s.verificationCodes[user.id] ?? "123456";
  if (code.trim() !== expected) throw new Error("Invalid verification code.");
  setStore({
    ...s,
    users: s.users.map((u) => (u.id === user.id ? { ...u, verified: true } : u)),
  });
  return delay(true);
}

export async function payWithCard(input: { seminarId: string; seats: number }) {
  const s = getStore();
  const user = getSessionUser();
  if (!user) throw new Error("Sign in to purchase a pass.");
  if (!user.verified) throw new Error("Verify your email before purchasing.");
  const seminar = s.seminars.find((x) => x.id === input.seminarId);
  if (!seminar) throw new Error("Seminar not found.");
  if (input.seats > seminar.seatsLeft) throw new Error("Not enough seats left.");

  const amount = seminar.price * input.seats;
  const payment: Payment = {
    id: uid("pay"),
    kind: "seminar_pass",
    method: "card",
    status: "paid",
    amount,
    userId: user.id,
    seminarId: seminar.id,
    seats: input.seats,
    createdAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  };
  const pass = issuePass(seminar, user.id, payment.id, input.seats);
  setStore({
    ...s,
    seminars: s.seminars.map((x) =>
      x.id === seminar.id ? { ...x, seatsLeft: x.seatsLeft - input.seats } : x,
    ),
    payments: [payment, ...s.payments],
    passes: [pass, ...s.passes],
  });
  return delay({ payment, pass });
}

export async function submitBankSlip(input: {
  seminarId: string;
  seats: number;
  slipDataUrl: string;
  note?: string;
}) {
  const s = getStore();
  const user = getSessionUser();
  if (!user) throw new Error("Sign in to purchase a pass.");
  if (!user.verified) throw new Error("Verify your email before purchasing.");
  const seminar = s.seminars.find((x) => x.id === input.seminarId);
  if (!seminar) throw new Error("Seminar not found.");
  if (input.seats > seminar.seatsLeft) throw new Error("Not enough seats left.");

  const payment: Payment = {
    id: uid("pay"),
    kind: "seminar_pass",
    method: "bank_slip",
    status: "pending",
    amount: seminar.price * input.seats,
    userId: user.id,
    seminarId: seminar.id,
    seats: input.seats,
    slipDataUrl: input.slipDataUrl,
    slipNote: input.note,
    createdAt: new Date().toISOString(),
  };
  setStore({
    ...s,
    payments: [payment, ...s.payments],
  });
  return delay({ payment, bank: BANK_DETAILS });
}

export async function listPayments(filter?: { status?: string; kind?: string }) {
  let list = [...getStore().payments];
  if (filter?.status) list = list.filter((p) => p.status === filter.status);
  if (filter?.kind) list = list.filter((p) => p.kind === filter.kind);
  return delay(list);
}

export async function listMyPayments() {
  const user = getSessionUser();
  if (!user) return delay([] as Payment[]);
  return delay(getStore().payments.filter((p) => p.userId === user.id));
}

export async function approvePayment(paymentId: string, approve: boolean) {
  const s = getStore();
  const payment = s.payments.find((p) => p.id === paymentId);
  if (!payment) throw new Error("Payment not found.");
  if (payment.status !== "pending") throw new Error("Payment already reviewed.");

  if (!approve) {
    setStore({
      ...s,
      payments: s.payments.map((p) =>
        p.id === paymentId ? { ...p, status: "rejected", reviewedAt: new Date().toISOString() } : p,
      ),
    });
    return delay(true);
  }

  let passes = s.passes;
  let seminars = s.seminars;
  let fees = s.fees;

  if (payment.kind === "seminar_pass" && payment.seminarId && payment.seats) {
    const seminar = s.seminars.find((x) => x.id === payment.seminarId);
    if (!seminar) throw new Error("Seminar missing.");
    if (payment.seats > seminar.seatsLeft) throw new Error("Not enough seats left.");
    const pass = issuePass(seminar, payment.userId, payment.id, payment.seats);
    passes = [pass, ...passes];
    seminars = seminars.map((x) =>
      x.id === seminar.id ? { ...x, seatsLeft: x.seatsLeft - payment.seats! } : x,
    );
  }

  if (payment.kind === "monthly_fee" && payment.feeId) {
    fees = fees.map((f) =>
      f.id === payment.feeId
        ? {
            ...f,
            status: "paid",
            paymentId: payment.id,
            paidMethod: payment.method,
          }
        : f,
    );
  }

  setStore({
    ...s,
    seminars,
    passes,
    fees,
    payments: s.payments.map((p) =>
      p.id === paymentId ? { ...p, status: "approved", reviewedAt: new Date().toISOString() } : p,
    ),
  });
  return delay(true);
}

function issuePass(seminar: Seminar, userId: string, paymentId: string, seats: number): Pass {
  const code = `EDU-${seminar.id.slice(4, 7).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return {
    id: uid("pass"),
    code,
    seminarId: seminar.id,
    userId,
    seats,
    paymentId,
    status: "active",
    issuedAt: new Date().toISOString(),
  };
}

export async function listMyPasses() {
  const user = getSessionUser();
  if (!user) return delay([] as Pass[]);
  return delay(getStore().passes.filter((p) => p.userId === user.id));
}

export async function listPasses() {
  return delay([...getStore().passes]);
}

export async function getPassByCode(code: string) {
  return delay(getStore().passes.find((p) => p.code === code || p.id === code) ?? null);
}

export async function checkInPass(code: string) {
  const s = getStore();
  const scanner = getSessionUser();
  if (!scanner || (scanner.role !== "scanner" && scanner.role !== "admin")) {
    throw new Error("Scanner access required.");
  }
  const pass = s.passes.find((p) => p.code === code || p.id === code);
  if (!pass) throw new Error("Pass not found.");
  if (pass.status === "used") throw new Error("Pass already checked in.");
  if (pass.status !== "active") throw new Error("Pass is not active.");

  const record: AttendanceRecord = {
    id: uid("att"),
    passId: pass.id,
    studentId: pass.userId,
    seminarId: pass.seminarId,
    markedAt: new Date().toISOString(),
    markedBy: scanner.id,
    present: true,
  };

  setStore({
    ...s,
    passes: s.passes.map((p) =>
      p.id === pass.id ? { ...p, status: "used", checkedInAt: record.markedAt } : p,
    ),
    attendance: [record, ...s.attendance],
  });
  return delay({
    pass: { ...pass, status: "used" as const, checkedInAt: record.markedAt },
    record,
  });
}

export async function listAttendance() {
  return delay([...getStore().attendance]);
}

export async function listMyAttendance() {
  const user = getSessionUser();
  if (!user) return delay([] as AttendanceRecord[]);
  return delay(getStore().attendance.filter((a) => a.studentId === user.id));
}

export async function upsertSeminar(seminar: Seminar) {
  const s = getStore();
  const exists = s.seminars.some((x) => x.id === seminar.id);
  setStore({
    ...s,
    seminars: exists
      ? s.seminars.map((x) => (x.id === seminar.id ? seminar : x))
      : [seminar, ...s.seminars],
  });
  return delay(seminar);
}

export async function deleteSeminar(id: string) {
  const s = getStore();
  setStore({ ...s, seminars: s.seminars.filter((x) => x.id !== id) });
  return delay(true);
}

export async function upsertLecturer(lecturer: import("@/domain/types").Lecturer) {
  const s = getStore();
  const exists = s.lecturers.some((x) => x.id === lecturer.id);
  setStore({
    ...s,
    lecturers: exists
      ? s.lecturers.map((x) => (x.id === lecturer.id ? lecturer : x))
      : [lecturer, ...s.lecturers],
  });
  return delay(lecturer);
}

export async function getInstitute(id: string) {
  return delay(getStore().institutes.find((i) => i.id === id) ?? null);
}

export async function listClasses(instituteId?: string) {
  let list = [...getStore().classes];
  if (instituteId) list = list.filter((c) => c.instituteId === instituteId);
  return delay(list);
}

export async function createClass(
  input: Omit<TuitionClass, "id" | "studentIds"> & { studentIds?: string[] },
) {
  const s = getStore();
  const cls: TuitionClass = {
    ...input,
    id: uid("class"),
    studentIds: input.studentIds ?? [],
  };
  setStore({ ...s, classes: [cls, ...s.classes] });
  return delay(cls);
}

export async function updateClass(cls: TuitionClass) {
  const s = getStore();
  setStore({
    ...s,
    classes: s.classes.map((c) => (c.id === cls.id ? cls : c)),
  });
  return delay(cls);
}

export async function listInstituteStudents(instituteId: string) {
  const s = getStore();
  const ids = new Set(
    s.classes.filter((c) => c.instituteId === instituteId).flatMap((c) => c.studentIds),
  );
  return delay(s.users.filter((u) => ids.has(u.id)));
}

export async function listFees(filter?: { classId?: string; studentId?: string }) {
  let list = [...getStore().fees];
  if (filter?.classId) list = list.filter((f) => f.classId === filter.classId);
  if (filter?.studentId) list = list.filter((f) => f.studentId === filter.studentId);
  return delay(list);
}

export async function markFeeCash(feeId: string) {
  const s = getStore();
  setStore({
    ...s,
    fees: s.fees.map((f) => (f.id === feeId ? { ...f, status: "paid", paidMethod: "cash" } : f)),
  });
  return delay(true);
}

export async function payFeeWithCard(feeId: string) {
  const s = getStore();
  const user = getSessionUser();
  if (!user) throw new Error("Sign in required.");
  const fee = s.fees.find((f) => f.id === feeId);
  if (!fee) throw new Error("Fee not found.");
  if (fee.studentId !== user.id) throw new Error("Not your fee.");

  const payment: Payment = {
    id: uid("pay"),
    kind: "monthly_fee",
    method: "card",
    status: "paid",
    amount: fee.amount,
    userId: user.id,
    feeId: fee.id,
    createdAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  };
  setStore({
    ...s,
    payments: [payment, ...s.payments],
    fees: s.fees.map((f) =>
      f.id === feeId ? { ...f, status: "paid", paymentId: payment.id, paidMethod: "card" } : f,
    ),
  });
  return delay(payment);
}

export async function submitFeeSlip(input: { feeId: string; slipDataUrl: string; note?: string }) {
  const s = getStore();
  const user = getSessionUser();
  if (!user) throw new Error("Sign in required.");
  const fee = s.fees.find((f) => f.id === input.feeId);
  if (!fee) throw new Error("Fee not found.");
  if (fee.studentId !== user.id) throw new Error("Not your fee.");

  const payment: Payment = {
    id: uid("pay"),
    kind: "monthly_fee",
    method: "bank_slip",
    status: "pending",
    amount: fee.amount,
    userId: user.id,
    feeId: fee.id,
    slipDataUrl: input.slipDataUrl,
    slipNote: input.note,
    createdAt: new Date().toISOString(),
  };
  setStore({
    ...s,
    payments: [payment, ...s.payments],
    fees: s.fees.map((f) =>
      f.id === fee.id ? { ...f, status: "pending", paymentId: payment.id } : f,
    ),
  });
  return delay(payment);
}

export async function markClassAttendance(input: {
  classId: string;
  studentId: string;
  present: boolean;
}) {
  const s = getStore();
  const marker = getSessionUser();
  if (
    !marker ||
    (marker.role !== "organizer" && marker.role !== "admin" && marker.role !== "lecturer")
  ) {
    throw new Error("Organizer access required.");
  }
  const record: AttendanceRecord = {
    id: uid("att"),
    classId: input.classId,
    studentId: input.studentId,
    markedAt: new Date().toISOString(),
    markedBy: marker.id,
    present: input.present,
  };
  setStore({ ...s, attendance: [record, ...s.attendance] });
  return delay(record);
}

export async function adminStats() {
  const s = getStore();
  return delay({
    seminars: s.seminars.length,
    passes: s.passes.length,
    pendingSlips: s.payments.filter((p) => p.status === "pending").length,
    checkedIn: s.attendance.filter((a) => a.passId).length,
  });
}

export { BANK_DETAILS };
export type { MonthlyFee, PaymentMethod };
