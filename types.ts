
export interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  major?: string;
  avatar?: string;
}

export interface RegisteredUser {
  username: string;
  rollNumber: string;
  faceDataUrl: string;
  role: 'student' | 'faculty';
}

export interface ClassSchedule {
  id: string;
  subject: string;
  room: string;
  time: string;
  lecturer: string;
  role: 'teaching' | 'learning';
}

export interface ExamSchedule {
  subject: string;
  date: string;
  time: string;
  type: 'Mid' | 'Semester';
  room: string;
}

export interface InvigilationDuty {
  subject: string;
  date: string;
  time: string;
  room: string;
  isCoordinator: boolean;
}

export interface ExamFee {
  semester: string;
  amount: number;
  deadline: string;
  status: 'Paid' | 'Pending';
  fineAmount?: number;
  description: string;
}

export interface AttendanceRecord {
  subject: string;
  percentage: number;
  totalClasses: number;
  attended: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'academic' | 'event' | 'admin' | 'faculty';
  status: 'upcoming' | 'past';
}

export interface ResearchPublication {
  id: string;
  title: string;
  journal: string;
  year: number;
  status: 'Published' | 'In Press' | 'Under Review';
  link?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  agency: string;
  amount: number;
  status: 'Ongoing' | 'Completed';
  progress: number;
}

export enum AppSection {
  DASHBOARD = 'dashboard',
  ASSISTANT = 'assistant',
  SCHEDULE = 'schedule',
  ATTENDANCE = 'attendance',
  EXAMS = 'exams',
  SYLLABUS = 'syllabus',
  EVENTS = 'events',
  FACULTY_RESOURCES = 'faculty_resources',
  PROFILE = 'profile',
  LOGIN = 'login',
  SIGNUP = 'signup'
}
