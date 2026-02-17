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
export const assessmentAPI = {
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
