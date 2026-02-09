
export enum UserRole {
  STUDENT = 'STUDENT',
  FACULTY = 'FACULTY',
  ADMIN = 'ADMIN'
}

export enum RecommendationType {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface User {
  id: string; // Using rollNumber/ID as primary key
  email: string;
  fullName: string;
  password?: string;
  rollNumber: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  code: string;
  facultyId: number;
}

export interface Topic {
  id: number;
  name: string;
  courseId: number;
}

export interface Question {
  id: number;
  topicId: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  difficulty: Difficulty;
}

export interface Assignment {
  id: number;
  topicId: number;
  studentId: string;
  assignedBy: string;
  assignedAt: string;
  status: 'PENDING' | 'COMPLETED';
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    topicId: number;
    topicName: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  gaps: KnowledgeGap[];
  recommendations: Recommendation[];
}

export interface KnowledgeGap {
  id: number;
  studentId: string;
  topicId: number;
  weaknessScore: number;
  detectedAt: string;
}

export interface Recommendation {
  id: number;
  topicId: number;
  url: string;
  description: string;
  type: RecommendationType;
}
