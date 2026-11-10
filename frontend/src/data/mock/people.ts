// DEMO DATA — every person and organisation below is fictional.
import type { Category, Lecturer, Organiser, Student } from '../../types';
import { daysFromNow } from '../../utils/date';
import { createRandom } from '../../utils/random';

export const CATEGORIES: Category[] = [
  { id: 'cat-revision', slug: 'al-revision', name: 'A/L Revision', icon: 'RefreshCcw', description: 'Full-syllabus revision days that rebuild every unit before the exam.' },
  { id: 'cat-theory', slug: 'theory-and-paper', name: 'Theory & Paper', icon: 'BookOpen', description: 'Theory sessions paired with a timed paper and guided discussion.' },
  { id: 'cat-paper', slug: 'paper-class', name: 'Paper Class', icon: 'FileText', description: 'Exam-condition model papers with marking and answer walkthroughs.' },
  { id: 'cat-target', slug: 'target-workshop', name: 'Target Workshop', icon: 'Target', description: 'Focused workshops on the questions most likely to appear.' },
  { id: 'cat-ol', slug: 'ol-core', name: 'O/L Core Subjects', icon: 'School', description: 'Maths, Science, English and History seminars for G.C.E. O/L.' },
  { id: 'cat-practical', slug: 'science-practical', name: 'Science Practical', icon: 'FlaskConical', description: 'Hands-on lab practice for Physics, Chemistry and Biology practicals.' },
];

export const ORGANISERS: Organiser[] = [
  { id: 'org-lumina', slug: 'lumina-academy', name: 'Lumina Academy', type: 'Institute', city: 'Nugegoda', verified: true, status: 'active', email: 'hello@lumina.example', phone: '011 200 0001', joinedAt: daysFromNow(-420), about: 'A commerce and science tuition institute running weekend seminars and paper classes for A/L students in the Colombo suburbs since 2015.' },
  { id: 'org-apex', slug: 'apex-science', name: 'Apex Science Institute', type: 'Institute', city: 'Colombo 07', verified: true, status: 'active', email: 'info@apex.example', phone: '011 200 0002', joinedAt: daysFromNow(-380), about: 'Physical-science specialists known for large-hall model paper days and practical workshops.' },
  { id: 'org-kandy', slug: 'kandy-learning-hub', name: 'Kandy Learning Hub', type: 'Institute', city: 'Kandy', verified: true, status: 'active', email: 'team@klh.example', phone: '081 200 0003', joinedAt: daysFromNow(-260), about: 'A hill-country learning centre with O/L and A/L programmes in Sinhala and English medium.' },
  { id: 'org-zenith', slug: 'zenith-online', name: 'Zenith Online Classroom', type: 'Independent lecturer', city: 'Online', verified: true, status: 'active', email: 'support@zenith.example', phone: '077 200 0004', joinedAt: daysFromNow(-190), about: 'An online-first classroom streaming live revision sessions with recordings for every ticket holder.' },
  { id: 'org-galle', slug: 'galle-exam-centre', name: 'Galle Exam Centre', type: 'School society', city: 'Galle', verified: false, status: 'pending', email: 'gec@galle.example', phone: '091 200 0005', joinedAt: daysFromNow(-6), about: 'A past-pupils society organising affordable paper classes for southern-province students.' },
];

export const LECTURERS: Lecturer[] = [
  { id: 'lec-dilan', name: 'Dilan Wickramasinghe', title: 'BA (Econ) Hons', subjects: ['Economics'], organiserId: 'org-lumina', yearsTeaching: 11, rating: 4.9, studentsTaught: 8200, status: 'active', qualifications: ['BA Economics (Hons)', 'Postgraduate Diploma in Education'], bio: 'Teaches A/L Economics through real Sri Lankan case studies, with a structured approach to essay questions and data-response papers.' },
  { id: 'lec-tharindu', name: 'Tharindu Abeysekara', title: 'BBA (Hons)', subjects: ['Business Studies', 'Accounting'], organiserId: 'org-lumina', yearsTeaching: 8, rating: 4.7, studentsTaught: 5100, status: 'active', qualifications: ['BBA (Hons) Management', 'Part-qualified CIMA'], bio: 'Known for breaking Business Studies theory into short, memorable frameworks and running fast-paced paper discussions.' },
  { id: 'lec-ishara', name: 'Ishara Fernando', title: 'BSc (Eng) Hons', subjects: ['Combined Maths'], organiserId: 'org-apex', yearsTeaching: 13, rating: 4.8, studentsTaught: 9600, status: 'active', qualifications: ['BSc Engineering (Hons)', 'MSc Applied Mathematics'], bio: 'Combined Maths lecturer focused on problem-solving speed: every session ends with a timed set and a full worked solution.' },
  { id: 'lec-ravindu', name: 'Ravindu Jayasekara', title: 'BSc (Physics) Hons', subjects: ['Physics'], organiserId: 'org-apex', yearsTeaching: 9, rating: 4.8, studentsTaught: 6400, status: 'active', qualifications: ['BSc Physics (Hons)', 'MPhil (reading)'], bio: 'Makes mechanics and electricity visual with live demonstrations and a step-by-step method for structured questions.' },
  { id: 'lec-nadeesha', name: 'Nadeesha Kumari', title: 'BSc (Chem) Hons', subjects: ['Chemistry'], organiserId: 'org-kandy', yearsTeaching: 10, rating: 4.6, studentsTaught: 4800, status: 'active', qualifications: ['BSc Chemistry (Hons)'], bio: 'Organic chemistry specialist who teaches reaction pathways as maps students can redraw in the exam hall.' },
  { id: 'lec-sachini', name: 'Sachini Gunawardena', title: 'BEd (Maths)', subjects: ['O/L Mathematics'], organiserId: 'org-kandy', yearsTeaching: 7, rating: 4.9, studentsTaught: 3900, status: 'active', qualifications: ['BEd Mathematics', 'Trained graduate teacher'], bio: 'Patient, structured O/L Maths teaching with a strong focus on the structured-question paper.' },
  { id: 'lec-kavindu', name: 'Kavindu Senanayake', title: 'BSc (Bio) Hons', subjects: ['Biology'], organiserId: 'org-zenith', yearsTeaching: 6, rating: 4.7, studentsTaught: 3100, status: 'active', qualifications: ['BSc Molecular Biology (Hons)'], bio: 'Streams diagram-heavy Biology lessons with downloadable revision sheets after every session.' },
  { id: 'lec-amaya', name: 'Amaya Ranasinghe', title: 'BA (English) Hons', subjects: ['English', 'General English'], organiserId: 'org-zenith', yearsTeaching: 12, rating: 4.8, studentsTaught: 7300, status: 'active', qualifications: ['BA English (Hons)', 'CELTA'], bio: 'Builds exam writing confidence for O/L English and A/L General English through short daily drills.' },
  { id: 'lec-new', name: 'Pasindu Herath', title: 'BSc (ICT)', subjects: ['ICT'], organiserId: 'org-lumina', yearsTeaching: 3, rating: 4.5, studentsTaught: 600, status: 'invited', qualifications: ['BSc Information Technology'], bio: 'A/L ICT lecturer joining Lumina Academy this term.' },
];

const FIRST = ['Nethmi', 'Kavisha', 'Sahan', 'Dinuka', 'Hiruni', 'Yasiru', 'Tharushi', 'Minura', 'Senuri', 'Chamod', 'Isuri', 'Lahiru', 'Pavani', 'Ravindu', 'Dulmi', 'Kasun', 'Sanduni', 'Nimesh', 'Amandi', 'Thisara'];
const LAST = ['Perera', 'Silva', 'Fernando', 'Jayawardena', 'Bandara', 'Dissanayake', 'Herath', 'Rathnayake', 'Wijesinghe', 'Karunaratne', 'Gamage', 'Senanayake'];
const SCHOOLS = ['Visakha Vidyalaya', 'Ananda College', 'Royal College', 'Musaeus College', 'Dharmaraja College', 'Mahamaya Girls College', 'Richmond College', 'Southlands College'];
const DISTRICTS = ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Kurunegala', 'Kalutara'];
const STREAMS = ['Commerce', 'Physical Science', 'Biological Science', 'Arts', 'O/L'];

/** The signed-in demo student. */
export const DEMO_STUDENT: Student = {
  id: 'stu-demo',
  name: 'Nethmi Perera',
  email: 'student@edupass.demo',
  phone: '071 234 5678',
  school: 'Visakha Vidyalaya',
  district: 'Colombo',
  stream: 'Commerce',
  examYear: new Date().getFullYear() + 1,
  status: 'active',
  joinedAt: daysFromNow(-200),
};

export function generateStudents(count = 48): Student[] {
  const r = createRandom(7);
  const list: Student[] = [DEMO_STUDENT];
  for (let i = 1; i < count; i++) {
    const first = FIRST[i % FIRST.length]!;
    const last = r.pick(LAST);
    list.push({
      id: `stu-${String(i).padStart(3, '0')}`,
      name: `${first} ${last}`,
      email: `${first}.${last}${i}@student.demo`.toLowerCase(),
      phone: `07${r.int(0, 8)} ${r.int(100, 999)} ${r.int(1000, 9999)}`,
      school: r.pick(SCHOOLS),
      district: r.pick(DISTRICTS),
      stream: r.pick(STREAMS),
      examYear: new Date().getFullYear() + r.int(0, 2),
      status: r.chance(0.05) ? 'suspended' : 'active',
      joinedAt: daysFromNow(-r.int(5, 400)),
    });
  }
  return list;
}
