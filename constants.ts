
import { ClassSchedule, AttendanceRecord, Announcement, UserProfile, ExamSchedule, ExamFee, InvigilationDuty, ResearchPublication, ResearchProject } from './types';

export const MOCK_STUDENT_PROFILE: UserProfile = {
  id: '21241A0501',
  name: 'GRIET Student',
  role: 'student',
  major: 'CSE - AI & ML',
  avatar: 'https://picsum.photos/seed/griet/200'
};

export const MOCK_FACULTY_PROFILE: UserProfile = {
  id: 'FAC-CSE-102',
  name: 'Dr. Srinivas Rao',
  role: 'faculty',
  major: 'Computer Science',
  avatar: 'https://picsum.photos/seed/faculty/200'
};

export const MOCK_SCHEDULE: ClassSchedule[] = [
  { id: '1', subject: 'Generative AI Systems', room: 'B-Block 302', time: '09:00', lecturer: 'Dr. K. Prasanna', role: 'learning' },
  { id: '2', subject: 'Quantum Computing Intro', room: 'C-Block 101', time: '11:10', lecturer: 'Prof. V. Shanthi', role: 'learning' },
  { id: '3', subject: 'Cloud Native Arch', room: 'E-Block Lab', time: '13:40', lecturer: 'Dr. G. Karuna', role: 'learning' },
  { id: '4', subject: 'Advanced Neural Nets', room: 'M-Block 204', time: '15:20', lecturer: 'Mr. P. Varma', role: 'learning' }
];

export const MOCK_FACULTY_SCHEDULE: ClassSchedule[] = [
  { id: 'f1', subject: 'LLM Optimization', room: 'M-Block 201', time: '10:00', lecturer: 'Self', role: 'teaching' },
  { id: 'f2', subject: '2026 Research Seminar', room: 'Seminar Hall', time: '14:00', lecturer: 'Self', role: 'teaching' }
];

export const MOCK_EXAM_SCHEDULE: ExamSchedule[] = [
  { subject: 'Generative AI', date: '2026-05-15', time: '10:00 AM - 01:00 PM', type: 'Semester', room: 'B-302' },
  { subject: 'Quantum Computing', date: '2026-05-17', time: '10:00 AM - 01:00 PM', type: 'Semester', room: 'C-101' },
  { subject: 'Cloud Native', date: '2026-05-19', time: '10:00 AM - 01:00 PM', type: 'Semester', room: 'E-Lab' }
];

export const MOCK_INVIGILATION: InvigilationDuty[] = [
  { subject: 'Data Ethics', date: '2026-05-15', time: '10:00 AM - 01:00 PM', room: 'C-301', isCoordinator: true },
  { subject: 'Systems Bio', date: '2026-05-18', time: '10:00 AM - 01:00 PM', room: 'M-102', isCoordinator: false }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { subject: 'GenAI Systems', percentage: 92, totalClasses: 45, attended: 41 },
  { subject: 'Quantum Comp', percentage: 88, totalClasses: 40, attended: 35 },
  { subject: 'Cloud Native', percentage: 95, totalClasses: 38, attended: 36 }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Pragnya 2026: Quantum Leap', content: 'GRIET presents its annual technical symposium for 2026. Focus on Quantum Supremacy and AI safety.', date: '2026-03-20', category: 'event', status: 'upcoming' },
  { id: 'a2', title: 'Spices 2026: Neon Pulse', content: 'The futuristic cultural fest of GRIET returns with AR/VR music stages.', date: '2026-04-05', category: 'event', status: 'upcoming' },
  { id: 'a5', title: 'Pragnya 2025 Retrospective', content: 'Highlights from last year\'s successful technical symposium.', date: '2025-03-20', category: 'event', status: 'past' },
  { id: 'a6', title: 'Graduation Day 2025', content: 'Official ceremony for the Class of 2025.', date: '2025-07-15', category: 'event', status: 'past' },
  { id: 'a3', title: 'Spring 2026 Exam Fee', content: 'Payment for IV-II B.Tech Regular exams is active.', date: '2026-02-01', category: 'academic', status: 'upcoming' },
  { id: 'a4', title: '2026 Global AI Ranking', content: 'GRIET climbs to top 5 in India for AI research in 2026.', date: '2026-01-15', category: 'admin', status: 'upcoming' }
];

export interface ExtendedExamFee extends ExamFee {
  paymentDate?: string;
  transactionId?: string;
}

export const GRIET_EXAM_FEES: ExtendedExamFee[] = [
  { semester: 'IV-II Regular', amount: 1500, deadline: '2026-03-30', status: 'Pending', description: 'Final Semester Theory & Project Viva' },
  { semester: 'Tuition 2026-27', amount: 145000, deadline: '2026-08-15', status: 'Paid', description: 'Future Session Pre-payment', paymentDate: '2026-01-05', transactionId: 'TXN-882910291' },
  { semester: 'IV-I Regular', amount: 1500, deadline: '2025-11-30', status: 'Paid', description: 'Previous Semester Fees', paymentDate: '2025-11-12', transactionId: 'TXN-771239912' },
  { semester: 'Library Fine 2025', amount: 250, deadline: '2025-12-15', status: 'Paid', description: 'Overdue Books Clearance', paymentDate: '2025-12-01', transactionId: 'TXN-661288310' },
  { semester: 'III-II Regular', amount: 1500, deadline: '2025-05-15', status: 'Paid', description: 'Third Year Second Semester', paymentDate: '2025-05-10', transactionId: 'TXN-554109281' }
];

export const GRIET_SYLLABUS = [
  { 
    dept: 'CSE', 
    regulation: 'GR25', 
    year: 'IV', 
    sem: 'II', 
    subjects: [
      'Edge AI Optimization', 
      'Ethical Hacking & Web 3.0', 
      'Decentralized Finance Tech', 
      'Project Stage-II', 
      'Industry Internship'
    ] 
  }
];

export const MOCK_PUBLICATIONS: ResearchPublication[] = [
  { id: 'p1', title: '2026 Perspectives on LLM Sovereignty', journal: 'Future AI Journal', year: 2026, status: 'In Press', link: '#' },
  { id: 'p2', title: 'Hybrid Quantum Neural Nets', journal: 'IEEE Quantum', year: 2025, status: 'Published', link: '#' }
];

export const MOCK_PROJECTS: ResearchProject[] = [
  { id: 'pr1', title: 'Smart Campus 2026: Zero Trust Biometrics', agency: 'MEITY', amount: 2500000, status: 'Ongoing', progress: 45 }
];

export const TIMETABLE_IMAGE_URL = "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2068&auto=format&fit=crop";
