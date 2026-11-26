export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  practicalProject: string;
}

export interface TrainingPath {
  title: string;
  description: string;
  estimatedWeeks: number;
  difficulty: string;
  modules: TrainingModule[];
}

export interface DomainCategory {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  color: string;
  popularModules: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SimulationEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  expertTip: string;
}

export interface CareerAdvice {
  readinessScore: number;
  missingSkills: string[];
  recommendedCertifications: string[];
  marketDemandSummary: string;
  interviewTips: string[];
}

export type UserRole = "guest" | "student" | "teacher" | "admin" | "developer";
export type RegistrationRequestStatus = "none" | "pending" | "approved" | "rejected";

export interface UserProfile {
  id?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  requestedRole?: UserRole | null;
  requestStatus?: RegistrationRequestStatus;
  requestNote?: string;
  createdAt?: string;
  name: string;
  email: string;
  title: string;
  xp: number;
  streak: number;
  completedModules: string[];
  enrolledPath: TrainingPath | null;
  activeDomain: string | null;
}

export interface Classroom {
  id: string;
  title: string;
  domain: string;
  teacherId: string | null;
  teacherName: string;
  teacherEmail: string;
  schedule: string;
  capacity: number;
  status: "active" | "draft" | "archived";
  studentCount: number;
  studentIds: string[];
  createdAt: string;
}
