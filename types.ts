
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
  id: string;
  title: string;
  description: string;
  code: string;
  facultyId: string;
}

export interface Topic {
  id: string;
  name: string;
  courseId: string;
}

export interface Question {
  id: string;
  topicId: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  difficulty: Difficulty;
}

export interface Assignment {
  id: string;
  topicId: string;
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
    topicId: string;
    topicName: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  gaps: KnowledgeGap[];
  recommendations: Recommendation[];
}

export interface KnowledgeGap {
  id: string;
  studentId: string;
  topicId: string;
  weaknessScore: number;
  detectedAt: string;
}

export interface Recommendation {
  id: string;
  topicId: string;
  url: string;
  description: string;
  type: RecommendationType;
}
