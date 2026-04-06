
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TOPICS, QUESTIONS, STUDENTS, COURSES } from '../services/mockData';
import { topicsAPI, questionsAPI, usersAPI, assignmentsAPI, QuestionCreateData, coursesAPI, CourseCreateData, mcqAttemptsAPI, MCQAttemptResponse, assessmentAPI, AssessmentAttemptResponse, questionUploadAPI, ParsedQuestion } from '../services/api';
import { Difficulty, Question, Topic, User, Course } from '../types';
import { AuthContext } from '../App';

const CLASS_STATS = [
  { topic: 'Binary Trees', average: 75, gaps: 12 },
  { topic: 'Sorting Algorithms', average: 58, gaps: 25 },
  { topic: 'Normalization', average: 82, gaps: 5 },
  { topic: 'SQL Joins', average: 45, gaps: 38 },
];

const FacultyDashboard: React.FC = () => {
  const { user, assignTest, assignments } = useContext(AuthContext);
  const [localCourses, setLocalCourses] = useState<Course[]>(COURSES);
  const [localTopics, setLocalTopics] = useState<Topic[]>(TOPICS);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(QUESTIONS);
  const [students, setStudents] = useState<User[]>(STUDENTS);
  const [mcqAttempts, setMcqAttempts] = useState<MCQAttemptResponse[]>([]);
  const [assessmentAttempts, setAssessmentAttempts] = useState<AssessmentAttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  
  // PDF Upload State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTopicId, setPdfTopicId] = useState<string>('');
  const [pdfQuestionType, setPdfQuestionType] = useState<string>('MCQ');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseMode, setParseMode] = useState<'pdf' | 'text'>('pdf');
  const [pastedText, setPastedText] = useState('');

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Course Form State
  const [courseFormData, setCourseFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    code: ''
  });

  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicCourseId, setNewTopicCourseId] = useState('');
  const [isCreatingNewCourse, setIsCreatingNewCourse] = useState(false);
  const [newCourseForTopic, setNewCourseForTopic] = useState({
    title: '',
    code: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, topicsData, questionsData, studentsData, attemptsData, assessmentsData] = await Promise.all([
          coursesAPI.getAll(),
          topicsAPI.getAll(),
          questionsAPI.getAll(),
          usersAPI.getStudents(),
          mcqAttemptsAPI.getAll(),
          assessmentAPI.getAll(),
        ]);
        
        console.log('MCQ Attempts fetched:', attemptsData);
        console.log('Assessment Attempts fetched:', assessmentsData);
        setMcqAttempts(attemptsData);
        setAssessmentAttempts(assessmentsData);
        
        setLocalCourses(coursesData.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          code: c.code,
          facultyId: c.facultyId,
        })));
        
        setLocalTopics(topicsData.map(t => ({
          id: t.id,
          name: t.name,
          courseId: t.courseId,
        })));
        
        setLocalQuestions(questionsData.map(q => ({
          id: q.id,
          topicId: q.topicId,
          content: q.content,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: (q.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
          difficulty: q.difficulty as Difficulty,
        })));
        
        setStudents(studentsData.map(s => ({
          id: s.id,
          email: s.email,
          fullName: s.fullName,
          rollNumber: s.rollNumber,
          role: s.role as any,
          avatar: s.avatar,
        })));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Keep mock data as fallback
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const openAddCourseModal = () => {
    setEditingCourse(null);
    setCourseFormData({ title: '', description: '', code: '' });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({ title: course.title, description: course.description, code: course.code });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const courseData: CourseCreateData = {
        title: courseFormData.title!,
        description: courseFormData.description!,
        code: courseFormData.code!,
        facultyId: user?.id,
      };
      
      if (editingCourse) {
        const updated = await coursesAPI.update(editingCourse.id, courseData);
        setLocalCourses(localCourses.map(c => 
          c.id === editingCourse.id 
            ? { id: updated.id, title: updated.title, description: updated.description, code: updated.code, facultyId: updated.facultyId }
            : c
        ));
      } else {
        const newCourse = await coursesAPI.create(courseData);
        setLocalCourses([...localCourses, { 
          id: newCourse.id, 
          title: newCourse.title, 
          description: newCourse.description, 
          code: newCourse.code, 
          facultyId: newCourse.facultyId 
        }]);
      }
      
      setIsCourseModalOpen(false);
      alert(editingCourse ? 'Repository updated successfully!' : 'Repository created successfully!');
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Failed to save repository. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this repository? All topics and questions within it will also be deleted.')) return;
    
    try {
      await coursesAPI.delete(courseId);
      setLocalCourses(localCourses.filter(c => c.id !== courseId));
      // Also remove related topics and questions from local state
      const topicIds = localTopics.filter(t => t.courseId === courseId).map(t => t.id);
      setLocalTopics(localTopics.filter(t => t.courseId !== courseId));
      setLocalQuestions(localQuestions.filter(q => !topicIds.includes(q.topicId)));
      alert('Repository deleted successfully!');
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete repository. Please try again.');
    }
  };


  // Topic Creation Handler
  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      alert('Please enter a topic name');
      return;
    }
    
    let courseIdToUse = newTopicCourseId;
    
    // If creating new course, create it first
    if (isCreatingNewCourse) {
      if (!newCourseForTopic.title.trim()) {
        alert('Please enter a course title');
        return;
      }
      if (!newCourseForTopic.code.trim()) {
        alert('Please enter a course code');
        return;
      }
      
      try {
        const newCourse = await coursesAPI.create({
          title: newCourseForTopic.title,
          code: newCourseForTopic.code,
          description: newCourseForTopic.description,
          facultyId: user?.id
        });
        setLocalCourses([...localCourses, {
          id: newCourse.id,
          title: newCourse.title,
          code: newCourse.code,
          description: newCourse.description,
          facultyId: newCourse.facultyId
        }]);
        courseIdToUse = newCourse.id;
      } catch (error) {
        console.error('Failed to create course:', error);
        alert('Failed to create course. Please try again.');
        return;
      }
    } else if (!courseIdToUse) {
      alert('Please select a course');
      return;
    }
    
    setIsSaving(true);
    try {
      const newTopic = await topicsAPI.create({ name: newTopicName, courseId: courseIdToUse });
      setLocalTopics([...localTopics, { id: newTopic.id, name: newTopic.name, courseId: newTopic.courseId }]);
      setNewTopicName('');
      setNewTopicCourseId('');
      setIsCreatingNewCourse(false);
      setNewCourseForTopic({ title: '', code: '', description: '' });
      setIsTopicModalOpen(false);
      alert('Topic created successfully!');
    } catch (error) {
      console.error('Failed to create topic:', error);
      alert('Failed to create topic. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // PDF Upload Handlers
  const openPdfUploadModal = (topicId?: string) => {
    setPdfFile(null);
    setPdfTopicId(topicId || localTopics[0]?.id || '');
    setPdfQuestionType('MCQ');
    setParsedQuestions([]);
    setPastedText('');
    setParseMode('pdf');
    setIsPdfUploadModalOpen(true);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
      setParsedQuestions([]);
    }
  };

  const handleParsePdf = async () => {
    if (parseMode === 'pdf' && !pdfFile) {
      alert('Please select a PDF file first');
      return;
    }
    if (parseMode === 'text' && !pastedText.trim()) {
      alert('Please paste some text first');
      return;
    }
    if (!pdfTopicId) {
      alert('Please select a topic');
      return;
    }

    setIsParsing(true);
    try {
      let questions: ParsedQuestion[];
      if (parseMode === 'pdf') {
        questions = await questionUploadAPI.parsePdf(pdfFile!, pdfTopicId, pdfQuestionType);
      } else {
        questions = await questionUploadAPI.parseText(pastedText, pdfTopicId, pdfQuestionType);
      }
      setParsedQuestions(questions);
      if (questions.length === 0) {
        alert('No questions found. Please check the format of your input.');
      }
    } catch (error) {
      console.error('Failed to parse:', error);
      alert('Failed to parse. Please check the format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveParsedQuestions = async () => {
    if (parsedQuestions.length === 0) {
      alert('No questions to save');
      return;
    }

    setIsSaving(true);
    try {
      const result = await questionUploadAPI.saveQuestions(pdfTopicId, parsedQuestions);
      alert(`Successfully saved ${result.savedCount} questions!`);
      
      // Refresh questions list
      const questionsData = await questionsAPI.getAll();
      setLocalQuestions(questionsData.map(q => ({
        id: q.id,
        topicId: q.topicId,
        content: q.content,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: (q.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
        difficulty: q.difficulty as Difficulty,
      })));
      
      setIsPdfUploadModalOpen(false);
    } catch (error) {
      console.error('Failed to save questions:', error);
      alert('Failed to save questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateParsedQuestion = (index: number, field: keyof ParsedQuestion, value: string) => {
    setParsedQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeParsedQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Faculty Intelligence</h1>
          <p className="text-gray-500 font-medium text-lg">Manage curriculum knowledge gaps and assign diagnostic content</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/assessment-results"
            className="bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all flex items-center gap-3 group"
          >
            <i className="fas fa-chart-line group-hover:scale-110 transition-transform"></i>
            Assessment Results
          </Link>
          <Link 
            to="/practice-bank"
            className="bg-purple-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-purple-700 shadow-xl shadow-purple-100 transition-all flex items-center gap-3 group"
          >
            <i className="fas fa-database group-hover:scale-110 transition-transform"></i>
            Practice Bank
          </Link>
          <button 
            onClick={() => openPdfUploadModal()}
            className="bg-green-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center gap-3 group"
          >
            <i className="fas fa-file-pdf group-hover:scale-110 transition-transform"></i>
            Upload Questions
          </button>
          <button 
            onClick={() => setIsTopicModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 group"
          >
            <i className="fas fa-folder-plus group-hover:scale-110 transition-transform"></i>
            Create Question Bank
          </button>
          <Link 
            to="/repository-management"
            className="bg-pink-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-pink-700 shadow-xl shadow-pink-100 transition-all flex items-center gap-3 group"
          >
            <i className="fas fa-warehouse group-hover:scale-110 transition-transform"></i>
            Knowledge Repo
          </Link>
        </div>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <i className="fas fa-book-open text-xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Repositories</div>
            <div className="text-2xl font-black text-blue-600">{localCourses.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
            <i className="fas fa-users text-xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Students</div>
            <div className="text-2xl font-black">{students.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
            <i className="fas fa-check-double text-xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Assigned Tests</div>
            <div className="text-2xl font-black text-green-600">{assignments.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
            <i className="fas fa-database text-xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Questions</div>
            <div className="text-2xl font-black text-orange-600">{localQuestions.length}</div>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white p-10 rounded-[2.5rem] border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-gray-800">
          <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
          Cohort Performance Analytics
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CLASS_STATS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="topic" axisLine={false} tickLine={false} fontSize={13} fontWeight="bold" />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'}} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '30px'}} />
              <Bar dataKey="average" name="Avg Score %" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
              <Bar dataKey="gaps" name="Identified Gaps" fill="#f97316" radius={[10, 10, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STUDENT MCQ ASSESSMENT RESULTS */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <h2 className="text-2xl font-black text-gray-900">Student Assessment Results</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-xl">
            {mcqAttempts.length} Attempts
          </span>
        </div>
        
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden">
          {mcqAttempts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-inbox text-3xl text-gray-300"></i>
              </div>
              <h3 className="text-xl font-black text-gray-400 mb-2">No Attempts Yet</h3>
              <p className="text-gray-400">Student assessment results will appear here once they complete MCQ quizzes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Questions</th>
                    <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Time Taken</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Attempted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mcqAttempts.map((attempt, index) => {
                    const formatTime = (seconds: number) => {
                      const mins = Math.floor(seconds / 60);
                      const secs = seconds % 60;
                      return `${mins}m ${secs}s`;
                    };
                    
                    const formatDate = (dateStr: string) => {
                      const date = new Date(dateStr);
                      return date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    };
                    
                    const scoreColor = attempt.scorePercentage >= 80 
                      ? 'bg-green-100 text-green-700' 
                      : attempt.scorePercentage >= 50 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700';
                    
                    return (
                      <tr key={attempt.id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-black text-sm">
                                {attempt.studentName?.charAt(0)?.toUpperCase() || 'S'}
                              </span>
                            </div>
                            <span className="font-bold text-gray-800">{attempt.studentName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
                            {attempt.topicName || 'Unknown Topic'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-4 py-2 rounded-xl text-sm font-black ${scoreColor}`}>
                            {attempt.scorePercentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-gray-600">
                            {attempt.correctAnswers}/{attempt.totalQuestions}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-500">
                            <i className="fas fa-clock mr-2 text-gray-400"></i>
                            {formatTime(attempt.timeTakenSeconds || 0)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-sm font-medium">
                            {attempt.attemptedAt ? formatDate(attempt.attemptedAt) : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>



      {/* PRACTICE REPOSITORY BANKS */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
            <i className="fas fa-book-open text-blue-600"></i>
            Practice Repository Banks
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-xl uppercase tracking-widest">
              Auto-mapped to all students
            </span>
          </h2>
          <button 
            onClick={openAddCourseModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Repository
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localCourses.map(course => {
            const courseTopics = localTopics.filter(t => t.courseId === course.id);
            const courseQuestionCount = courseTopics.reduce((acc, topic) => 
              acc + localQuestions.filter(q => q.topicId === topic.id).length, 0
            );
            
            return (
              <div key={course.id} className="bg-white rounded-[2rem] border-2 border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl border border-blue-100">
                      {course.code}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditCourseModal(course)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center transition-all"
                        title="Edit Repository"
                      >
                        <i className="fas fa-pen text-sm"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all"
                        title="Delete Repository"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-800 mb-2 tracking-tight">{course.title}</h3>
                  <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <i className="fas fa-layer-group text-xs"></i>
                      </div>
                      <span className="font-bold text-gray-600">{courseTopics.length} Topics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <i className="fas fa-question text-xs"></i>
                      </div>
                      <span className="font-bold text-gray-600">{courseQuestionCount} Questions</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
                    <i className="fas fa-users text-green-600"></i>
                    <span className="text-xs font-black text-green-700 uppercase tracking-wider">
                      Available to {students.length} Students
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {localCourses.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-400">
              <i className="fas fa-folder-open text-5xl mb-4 opacity-50"></i>
              <p className="font-bold text-lg">No practice repositories yet</p>
              <p className="text-sm">Create your first repository to get started</p>
            </div>
          )}
        </div>
      </section>

      {/* COURSE/REPOSITORY MODAL */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-10 border-b flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {editingCourse ? 'Edit Repository' : 'New Practice Repository'}
                </h2>
                <p className="text-sm text-green-600 font-bold mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Auto-mapped to all students
                </p>
              </div>
              <button 
                onClick={() => setIsCourseModalOpen(false)} 
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSaveCourse} className="p-10 space-y-6 overflow-y-auto custom-scrollbar bg-white">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Repository Code</label>
                <input 
                  className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-gray-800 transition-all uppercase"
                  placeholder="e.g., CS101"
                  value={courseFormData.code}
                  onChange={e => setCourseFormData({...courseFormData, code: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Repository Title</label>
                <input 
                  className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-gray-800 transition-all"
                  placeholder="e.g., Data Structures & Algorithms"
                  value={courseFormData.title}
                  onChange={e => setCourseFormData({...courseFormData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description</label>
                <textarea 
                  className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-gray-800 transition-all h-28 resize-none"
                  placeholder="Brief description of this repository..."
                  value={courseFormData.description}
                  onChange={e => setCourseFormData({...courseFormData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 text-green-700">
                  <i className="fas fa-users text-xl"></i>
                  <div>
                    <p className="font-black">Default Access: All Students</p>
                    <p className="text-xs font-medium opacity-75">This repository will be automatically available to all registered students ({students.length} currently)</p>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-100 transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : (editingCourse ? 'Update Repository' : 'Create Repository')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isPdfUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Upload Questions</h2>
                <p className="text-gray-500 font-medium">Import questions from PDF or paste text</p>
              </div>
              <button onClick={() => setIsPdfUploadModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className="fas fa-times text-gray-400"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* Mode Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setParseMode('pdf')}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${parseMode === 'pdf' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <i className="fas fa-file-pdf mr-2"></i> Upload PDF
                </button>
                <button
                  onClick={() => setParseMode('text')}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${parseMode === 'text' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <i className="fas fa-paste mr-2"></i> Paste Text
                </button>
              </div>

              {/* Topic & Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Topic</label>
                  <select
                    value={pdfTopicId}
                    onChange={(e) => setPdfTopicId(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800"
                  >
                    {localTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Question Type</label>
                  <select
                    value={pdfQuestionType}
                    onChange={(e) => setPdfQuestionType(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800"
                  >
                    <option value="MCQ">MCQ (Multiple Choice)</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
              </div>

              {/* PDF Upload Area */}
              {parseMode === 'pdf' && (
                <div className="mb-6">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">PDF File</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-300 mb-4 block"></i>
                      {pdfFile ? (
                        <p className="font-bold text-green-600"><i className="fas fa-check-circle mr-2"></i>{pdfFile.name}</p>
                      ) : (
                        <p className="font-bold text-gray-500">Click to select PDF or drag and drop</p>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Text Paste Area */}
              {parseMode === 'text' && (
                <div className="mb-6">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Paste Questions</label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Paste your questions in this format:\n\nQ1. What is an array?\nA) A collection of elements\nB) A single variable\nC) A function\nD) A loop\nAnswer: A\n\nQ2. Which sorting algorithm has O(n log n)?`}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl font-medium text-gray-800 h-48 resize-none"
                  />
                </div>
              )}

              {/* Parse Button */}
              <button
                onClick={handleParsePdf}
                disabled={isParsing || (parseMode === 'pdf' && !pdfFile) || (parseMode === 'text' && !pastedText.trim())}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {isParsing ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Parsing...</>
                ) : (
                  <><i className="fas fa-magic mr-2"></i> Parse Questions</>
                )}
              </button>

              {/* Parsed Questions Preview */}
              {parsedQuestions.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-gray-900">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      Found {parsedQuestions.length} Questions
                    </h3>
                  </div>
                  
                  <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                    {parsedQuestions.map((q, index) => (
                      <div key={index} className="bg-gray-50 rounded-2xl p-4 relative">
                        <button
                          onClick={() => removeParsedQuestion(index)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
                        >
                          <i className="fas fa-times text-sm"></i>
                        </button>
                        
                        <div className="pr-10">
                          <div className="text-xs font-black text-gray-400 mb-1">Q{index + 1}</div>
                          <p className="font-bold text-gray-800 mb-2">{q.title}</p>
                          
                          {q.type === 'MCQ' && (
                            <div className="text-sm text-gray-600 mb-2 whitespace-pre-wrap">{q.problemStatement}</div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' : q.difficulty === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {q.difficulty}
                            </span>
                            {q.solution && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Answer:</span>
                                <select
                                  value={q.solution}
                                  onChange={(e) => updateParsedQuestion(index, 'solution', e.target.value)}
                                  className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded border-0"
                                >
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="D">D</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveParsedQuestions}
                    disabled={isSaving}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {isSaving ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</>
                    ) : (
                      <><i className="fas fa-save mr-2"></i> Save {parsedQuestions.length} Questions</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topic Creation Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">Create Question Bank</h2>
              <button
                onClick={() => { 
                  setIsTopicModalOpen(false); 
                  setNewTopicName(''); 
                  setNewTopicCourseId(''); 
                  setIsCreatingNewCourse(false);
                  setNewCourseForTopic({ title: '', code: '', description: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Course Selection Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIsCreatingNewCourse(false)}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition ${
                    !isCreatingNewCourse 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Select Course
                </button>
                <button
                  onClick={() => setIsCreatingNewCourse(true)}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition ${
                    isCreatingNewCourse 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Create Course
                </button>
              </div>

              {/* Select Existing Course */}
              {!isCreatingNewCourse && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Course *</label>
                  <select
                    value={newTopicCourseId}
                    onChange={(e) => setNewTopicCourseId(e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a course...</option>
                    {localCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Create New Course */}
              {isCreatingNewCourse && (
                <div className="space-y-3 bg-indigo-50 p-4 rounded-xl border-2 border-indigo-200">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Course Code *</label>
                    <input
                      type="text"
                      value={newCourseForTopic.code}
                      onChange={(e) => setNewCourseForTopic({ ...newCourseForTopic, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., CS101"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Course Title *</label>
                    <input
                      type="text"
                      value={newCourseForTopic.title}
                      onChange={(e) => setNewCourseForTopic({ ...newCourseForTopic, title: e.target.value })}
                      placeholder="e.g., Data Structures"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Description</label>
                    <textarea
                      value={newCourseForTopic.description}
                      onChange={(e) => setNewCourseForTopic({ ...newCourseForTopic, description: e.target.value })}
                      placeholder="Course description..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm h-20 resize-none"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Topic Name *</label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g., Binary Trees, SQL Joins, etc."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { 
                    setIsTopicModalOpen(false); 
                    setNewTopicName(''); 
                    setNewTopicCourseId(''); 
                    setIsCreatingNewCourse(false);
                    setNewCourseForTopic({ title: '', code: '', description: '' });
                  }}
                  className="flex-1 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTopic}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i> Creating...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i> Create Topic</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default FacultyDashboard;
