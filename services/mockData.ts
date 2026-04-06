
import { Course, Topic, Question, Recommendation, RecommendationType, Difficulty, User, UserRole } from '../types';

export const STUDENTS: User[] = [
  // Fix: Added rollNumber property which is required by User interface
  { id: '10', rollNumber: '10', email: 'john.doe@uni.edu', fullName: 'John Doe', role: UserRole.STUDENT, avatar: 'JD' },
  { id: '11', rollNumber: '11', email: 'jane.smith@uni.edu', fullName: 'Jane Smith', role: UserRole.STUDENT, avatar: 'JS' },
  { id: '12', rollNumber: '12', email: 'alice.w@uni.edu', fullName: 'Alice Wong', role: UserRole.STUDENT, avatar: 'AW' },
  { id: '13', rollNumber: '13', email: 'bob.m@uni.edu', fullName: 'Bob Miller', role: UserRole.STUDENT, avatar: 'BM' },
  { id: '14', rollNumber: '14', email: 'charlie.d@uni.edu', fullName: 'Charlie Davis', role: UserRole.STUDENT, avatar: 'CD' },
];

export const COURSES: Course[] = [
  { id: '1', title: 'Data Structures & Algorithms', description: 'Core foundations of CS', code: 'CS101', facultyId: '101' },
  { id: '2', title: 'Database Management Systems', description: 'Relational logic and SQL', code: 'CS202', facultyId: '101' },
];

export const TOPICS: Topic[] = [
  { id: '1', name: 'Binary Trees', courseId: '1' },
  { id: '2', name: 'Sorting Algorithms', courseId: '1' },
  { id: '3', name: 'Dynamic Programming', courseId: '1' },
  { id: '4', name: 'Normalization', courseId: '2' },
  { id: '5', name: 'SQL Joins', courseId: '2' },
];

export const QUESTIONS: Question[] = [
  {
    id: '1', topicId: '1', content: "What is the maximum number of nodes at level 'L' in a binary tree?",
    optionA: "2^L", optionB: "2^(L-1)", optionC: "L^2", optionD: "2*L",
    correctOption: 'A', difficulty: Difficulty.MEDIUM
  },
  {
    id: '2', topicId: '1', content: "In a min-heap, the root node contains...",
    optionA: "Maximum value", optionB: "Median value", optionC: "Minimum value", optionD: "Zero",
    correctOption: 'C', difficulty: Difficulty.EASY
  },
  {
    id: '3', topicId: '2', content: "What is the worst-case time complexity of Quick Sort?",
    optionA: "O(n log n)", optionB: "O(n^2)", optionC: "O(n)", optionD: "O(log n)",
    correctOption: 'B', difficulty: Difficulty.MEDIUM
  },
  {
    id: '4', topicId: '4', content: "Which normal form deals with partial dependencies?",
    optionA: "1NF", optionB: "2NF", optionC: "3NF", optionD: "BCNF",
    correctOption: 'B', difficulty: Difficulty.HARD
  },
  {
    id: '5', topicId: '5', content: "Which join returns all records when there is a match in either left or right table?",
    optionA: "INNER JOIN", optionB: "LEFT JOIN", optionC: "FULL OUTER JOIN", optionD: "CROSS JOIN",
    correctOption: 'C', difficulty: Difficulty.EASY
  }
];

export const RECOMMENDATIONS: Recommendation[] = [
  { id: '1', topicId: '1', url: 'https://youtube.com/example-tree', description: 'Mastering Binary Trees', type: RecommendationType.VIDEO },
  { id: '2', topicId: '4', url: 'https://article.com/normalization', description: 'Guide to 2NF and 3NF', type: RecommendationType.ARTICLE },
  { id: '3', topicId: '2', url: 'https://youtube.com/sorting-viz', description: 'Sorting Visualizations', type: RecommendationType.VIDEO },
];
