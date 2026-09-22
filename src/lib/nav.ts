export const studentNav = [
  { to: "/account", label: "Overview" },
  { to: "/account/passes", label: "Passes" },
  { to: "/account/payments", label: "Payments" },
  { to: "/account/attendance", label: "Attendance" },
  { to: "/account/fees", label: "Fees" },
] as const;

export const adminNav = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/seminars", label: "Seminars" },
  { to: "/admin/lecturers", label: "Lecturers" },
  { to: "/admin/payments", label: "Slip approval" },
  { to: "/admin/passes", label: "Passes" },
  { to: "/admin/attendance", label: "Attendance" },
] as const;

export const instituteNav = [
  { to: "/institute", label: "Overview" },
  { to: "/institute/classes", label: "Classes" },
  { to: "/institute/students", label: "Students" },
  { to: "/institute/attendance", label: "Attendance" },
  { to: "/institute/fees", label: "Fees" },
  { to: "/institute/payments", label: "Slip approval" },
] as const;
