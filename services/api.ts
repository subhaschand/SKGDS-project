const API_BASE = 'http://localhost:8080/api';

// Generic fetch helper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) => 
    fetchAPI<UserResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: RegisterData) =>
    fetchAPI<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Courses API
export const coursesAPI = {
  getAll: () => fetchAPI<CourseResponse[]>('/courses'),
  getById: (id: string) => fetchAPI<CourseResponse>(`/courses/${id}`),
  
  create: (data: CourseCreateData) =>
    fetchAPI<CourseResponse>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: CourseCreateData) =>
    fetchAPI<CourseResponse>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/courses/${id}`, {
      method: 'DELETE',
    }),
};

// Topics API
export const topicsAPI = {
  getAll: () => fetchAPI<TopicResponse[]>('/topics'),
  getByCourse: (courseId: string) => fetchAPI<TopicResponse[]>(`/topics/course/${courseId}`),
  getById: (id: string) => fetchAPI<TopicResponse>(`/topics/${id}`),
  create: (data: { name: string; courseId: string }) =>
    fetchAPI<TopicResponse>('/topics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Questions API
export const questionsAPI = {
  getAll: () => fetchAPI<QuestionResponse[]>('/questions'),
  getByTopic: (topicId: string) => fetchAPI<QuestionResponse[]>(`/questions/topic/${topicId}`),
  getByCourse: (courseId: string) => fetchAPI<QuestionResponse[]>(`/questions/course/${courseId}`),
  getById: (id: string) => fetchAPI<QuestionResponse>(`/questions/${id}`),
  
  create: (data: QuestionCreateData) =>
    fetchAPI<QuestionResponse>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: QuestionCreateData) =>
    fetchAPI<QuestionResponse>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/questions/${id}`, {
      method: 'DELETE',
    }),
};

// Assessment API
export interface AssessmentAttemptResponse {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  score: number;
  submissionDate: string;
}

export const assessmentAPI = {
  getAll: () => fetchAPI<AssessmentAttemptResponse[]>('/assessments'),
  
  submit: (data: AssessmentSubmission) =>
    fetchAPI<AssessmentResultResponse>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getGaps: (studentId: string) => 
    fetchAPI<GapResponse[]>(`/assessments/gaps/${studentId}`),
};

// Assignments API
export const assignmentsAPI = {
  assign: (topicId: string, studentIds: string[], facultyId: string) =>
    fetchAPI<AssignmentResponse[]>('/assignments/assign', {
      method: 'POST',
      body: JSON.stringify({ topicId, studentIds, facultyId }),
    }),
  
  getByStudent: (studentId: string) =>
    fetchAPI<AssignmentResponse[]>(`/assignments/student/${studentId}`),
  
  getPending: (studentId: string) =>
    fetchAPI<AssignmentResponse[]>(`/assignments/student/${studentId}/pending`),
  
  complete: (topicId: string, studentId: string) =>
    fetchAPI<{message: string}>('/assignments/complete', {
      method: 'PUT',
      body: JSON.stringify({ topicId, studentId }),
    }),
};

// Users API
export const usersAPI = {
  getAll: () => fetchAPI<UserResponse[]>('/users'),
  getStudents: () => fetchAPI<UserResponse[]>('/users/students'),
  getFaculty: () => fetchAPI<UserResponse[]>('/users/faculty'),
  getById: (id: string) => fetchAPI<UserResponse>(`/users/${id}`),
  
  create: (data: UserCreateData) =>
    fetchAPI<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  deactivate: (id: string) =>
    fetchAPI<UserResponse>(`/users/${id}/deactivate`, {
      method: 'PUT',
    }),
  
  activate: (id: string) =>
    fetchAPI<UserResponse>(`/users/${id}/activate`, {
      method: 'PUT',
    }),
};

// Recommendations API
export const recommendationsAPI = {
  getAll: () => fetchAPI<RecommendationResponse[]>('/recommendations'),
  getByTopic: (topicId: string) => fetchAPI<RecommendationResponse[]>(`/recommendations/topic/${topicId}`),
};

// Response types (matching backend DTOs)
export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  rollNumber: string;
  role: string;
  avatar: string;
  active: boolean;
}

export interface UserCreateData {
  email: string;
  password: string;
  fullName: string;
  rollNumber?: string;
  role: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  rollNumber: string;
  role: string;
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  code: string;
  facultyId: string;
}

export interface CourseCreateData {
  title: string;
  description: string;
  code: string;
  facultyId?: string;
}

export interface TopicResponse {
  id: string;
  name: string;
  courseId: string;
}

export interface QuestionResponse {
  id: string;
  topicId: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string;
  difficulty: string;
}

export interface QuestionCreateData {
  topicId: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  difficulty: string;
}

export interface AssessmentSubmission {
  courseId: string;
  studentId: string;
  answers: { questionId: string; selectedOption: string }[];
}

export interface AssessmentResultResponse {
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
  gaps: GapResponse[];
  recommendations: RecommendationResponse[];
}

export interface GapResponse {
  id: string;
  studentId: string;
  topicId: string;
  weaknessScore: number;
  detectedAt: string;
}

export interface AssignmentResponse {
  id: string;
  topicId: string;
  studentId: string;
  assignedBy: string;
  assignedAt: string;
  status: string;
}

export interface RecommendationResponse {
  id: string;
  topicId: string;
  url: string;
  description: string;
  type: string;
}

// Practice Questions Types
export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface PracticeQuestionResponse {
  id: string;
  title: string;
  description: string;
  topicId: string;
  topicName: string;
  courseId: string;
  courseName: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  type: 'CODING' | 'MCQ' | 'SHORT_ANSWER' | 'FILL_IN_BLANK' | 'TRUE_FALSE';
  problemStatement: string;
  hints: string[];
  solution: string;
  solutionExplanation: string;
  testCases: TestCase[];
  tags: string[];
  timeLimit: number;
  points: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  attemptCount: number;
  successCount: number;
}

export interface PracticeQuestionCreateData {
  title: string;
  description: string;
  topicId?: string;
  courseId?: string;
  difficulty: string;
  type: string;
  problemStatement: string;
  hints?: string[];
  solution?: string;
  solutionExplanation?: string;
  testCases?: TestCase[];
  tags?: string[];
  timeLimit?: number;
  points?: number;
  createdBy?: string;
}

// Practice Questions API
export const practiceQuestionsAPI = {
  getAll: () => fetchAPI<PracticeQuestionResponse[]>('/practice-questions'),
  
  getById: (id: string) => fetchAPI<PracticeQuestionResponse>(`/practice-questions/${id}`),
  
  getByTopic: (topicId: string) => fetchAPI<PracticeQuestionResponse[]>(`/practice-questions/topic/${topicId}`),
  
  getByCourse: (courseId: string) => fetchAPI<PracticeQuestionResponse[]>(`/practice-questions/course/${courseId}`),
  
  getByDifficulty: (difficulty: string) => fetchAPI<PracticeQuestionResponse[]>(`/practice-questions/difficulty/${difficulty}`),
  
  getByCreator: (createdBy: string) => fetchAPI<PracticeQuestionResponse[]>(`/practice-questions/creator/${createdBy}`),
  
  create: (data: PracticeQuestionCreateData) =>
    fetchAPI<PracticeQuestionResponse>('/practice-questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<PracticeQuestionCreateData>) =>
    fetchAPI<PracticeQuestionResponse>(`/practice-questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchAPI<void>(`/practice-questions/${id}`, {
      method: 'DELETE',
    }),
  
  hardDelete: (id: string) =>
    fetchAPI<void>(`/practice-questions/${id}/permanent`, {
      method: 'DELETE',
    }),
  
  recordAttempt: (id: string, success: boolean) =>
    fetchAPI<PracticeQuestionResponse>(`/practice-questions/${id}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ success }),
    }),
  
  getCount: () => fetchAPI<{ count: number }>('/practice-questions/count'),
};

// MCQ Attempts API
export interface MCQAttemptCreateData {
  studentId: string;
  topicId: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeTakenSeconds: number;
}

export interface MCQAttemptResponse {
  id: string;
  studentId: string;
  studentName: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeTakenSeconds: number;
  attemptedAt: string;
}

export const mcqAttemptsAPI = {
  getAll: () => fetchAPI<MCQAttemptResponse[]>('/mcq-attempts'),
  
  getByStudent: (studentId: string) => 
    fetchAPI<MCQAttemptResponse[]>(`/mcq-attempts/student/${studentId}`),
  
  getByTopic: (topicId: string) => 
    fetchAPI<MCQAttemptResponse[]>(`/mcq-attempts/topic/${topicId}`),
  
  submit: (data: MCQAttemptCreateData) =>
    fetchAPI<MCQAttemptResponse>('/mcq-attempts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Question Upload API for PDF parsing
export interface ParsedQuestion {
  title: string;
  problemStatement: string;
  difficulty: string;
  type: string;
  solution?: string;
  topicId?: string;
  active?: boolean;
}

export const questionUploadAPI = {
  parsePdf: async (file: File, topicId: string, type: string = 'MCQ'): Promise<ParsedQuestion[]> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topicId', topicId);
    formData.append('type', type);
    
    const response = await fetch(`${API_BASE}/question-upload/parse-pdf`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to parse PDF');
    }
    
    const data = await response.json();
    return data.questions || [];
  },
  
  parseText: async (text: string, topicId: string, type: string = 'MCQ'): Promise<ParsedQuestion[]> => {
    const response = await fetch(`${API_BASE}/question-upload/parse-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, topicId, type }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to parse text');
    }
    
    const data = await response.json();
    return data.questions || [];
  },
  
  saveQuestions: async (topicId: string, questions: ParsedQuestion[]): Promise<{ message: string; savedCount: number }> => {
    const response = await fetch(`${API_BASE}/question-upload/save-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, questions }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to save questions');
    }
    
    const data = await response.json();
    return { message: data.message, savedCount: data.count };
  },
};
