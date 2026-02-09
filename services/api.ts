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
  getById: (id: number) => fetchAPI<CourseResponse>(`/courses/${id}`),
};

// Topics API
export const topicsAPI = {
  getAll: () => fetchAPI<TopicResponse[]>('/topics'),
  getByCourse: (courseId: number) => fetchAPI<TopicResponse[]>(`/topics/course/${courseId}`),
  getById: (id: number) => fetchAPI<TopicResponse>(`/topics/${id}`),
};

// Questions API
export const questionsAPI = {
  getAll: () => fetchAPI<QuestionResponse[]>('/questions'),
  getByTopic: (topicId: number) => fetchAPI<QuestionResponse[]>(`/questions/topic/${topicId}`),
  getByCourse: (courseId: number) => fetchAPI<QuestionResponse[]>(`/questions/course/${courseId}`),
};

// Assessment API
export const assessmentAPI = {
  submit: (data: AssessmentSubmission) =>
    fetchAPI<AssessmentResultResponse>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getGaps: (studentId: number) => 
    fetchAPI<GapResponse[]>(`/assessments/gaps/${studentId}`),
};

// Assignments API
export const assignmentsAPI = {
  assign: (topicId: number, studentIds: number[], facultyId: number) =>
    fetchAPI<AssignmentResponse[]>('/assignments/assign', {
      method: 'POST',
      body: JSON.stringify({ topicId, studentIds, facultyId }),
    }),
  
  getByStudent: (studentId: number) =>
    fetchAPI<AssignmentResponse[]>(`/assignments/student/${studentId}`),
  
  getPending: (studentId: number) =>
    fetchAPI<AssignmentResponse[]>(`/assignments/student/${studentId}/pending`),
  
  complete: (topicId: number, studentId: number) =>
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
  getById: (id: number) => fetchAPI<UserResponse>(`/users/${id}`),
};

// Recommendations API
export const recommendationsAPI = {
  getAll: () => fetchAPI<RecommendationResponse[]>('/recommendations'),
  getByTopic: (topicId: number) => fetchAPI<RecommendationResponse[]>(`/recommendations/topic/${topicId}`),
};

// Response types (matching backend DTOs)
export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  rollNumber: string;
  role: string;
  avatar: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  rollNumber: string;
  role: string;
}

export interface CourseResponse {
  id: number;
  title: string;
  description: string;
  code: string;
  facultyId: number;
}

export interface TopicResponse {
  id: number;
  name: string;
  courseId: number;
}

export interface QuestionResponse {
  id: number;
  topicId: number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption?: string;
  difficulty: string;
}

export interface AssessmentSubmission {
  courseId: number;
  studentId: number;
  answers: { questionId: number; selectedOption: string }[];
}

export interface AssessmentResultResponse {
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
  gaps: GapResponse[];
  recommendations: RecommendationResponse[];
}

export interface GapResponse {
  id: number;
  studentId: number;
  topicId: number;
  weaknessScore: number;
  detectedAt: string;
}

export interface AssignmentResponse {
  id: number;
  topicId: number;
  studentId: number;
  assignedBy: number;
  assignedAt: string;
  status: string;
}

export interface RecommendationResponse {
  id: number;
  topicId: number;
  url: string;
  description: string;
  type: string;
}
