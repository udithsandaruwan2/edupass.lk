export type Seminar = {
  id: string;
  subject: string;
  level: "O/L" | "A/L";
  teacher: string;
  venue: string;
  date: string;
  price: number;
  seats: number;
  seatsLeft: number;
  medium: string;
};

export const seminars: Seminar[] = [
  {
    id: "combined-maths",
    subject: "Combined Mathematics",
    level: "A/L",
    teacher: "K. Perera",
    venue: "Colombo 07",
    date: "Sat · 12 Apr",
    price: 4500,
    seats: 40,
    seatsLeft: 6,
    medium: "Sinhala Medium",
  },
  {
    id: "physics",
    subject: "Physics",
    level: "A/L",
    teacher: "D. Silva",
    venue: "Galle",
    date: "Sun · 13 Apr",
    price: 4000,
    seats: 50,
    seatsLeft: 14,
    medium: "English Medium",
  },
  {
    id: "biology",
    subject: "Biology",
    level: "O/L",
    teacher: "N. Fernando",
    venue: "Kandy",
    date: "Fri · 11 Apr",
    price: 3500,
    seats: 60,
    seatsLeft: 21,
    medium: "Sinhala Medium",
  },
  {
    id: "chemistry",
    subject: "Chemistry",
    level: "A/L",
    teacher: "S. Bandara",
    venue: "Kurunegala",
    date: "Sat · 19 Apr",
    price: 4200,
    seats: 45,
    seatsLeft: 9,
    medium: "English Medium",
  },
  {
    id: "science",
    subject: "Science",
    level: "O/L",
    teacher: "M. Jayawardena",
    venue: "Matara",
    date: "Sun · 20 Apr",
    price: 3000,
    seats: 70,
    seatsLeft: 33,
    medium: "Sinhala Medium",
  },
  {
    id: "mathematics",
    subject: "Mathematics",
    level: "O/L",
    teacher: "A. Rathnayake",
    venue: "Negombo",
    date: "Sat · 26 Apr",
    price: 3200,
    seats: 55,
    seatsLeft: 18,
    medium: "Sinhala Medium",
  },
];

export const lkr = (value: number) =>
  `LKR ${value.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
