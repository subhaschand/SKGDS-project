
import React, { useState, useContext, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TOPICS, QUESTIONS, STUDENTS, COURSES } from '../services/mockData';
import { topicsAPI, questionsAPI, usersAPI, assignmentsAPI, QuestionCreateData, coursesAPI, CourseCreateData } from '../services/api';
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
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedTopicForAssign, setSelectedTopicForAssign] = useState<Topic | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Question Form State
  const [questionFormData, setQuestionFormData] = useState<Partial<Question>>({
    topicId: localTopics[0]?.id,
    difficulty: Difficulty.MEDIUM,
    correctOption: 'A',
    content: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: ''
  });

  // Course Form State
  const [courseFormData, setCourseFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    code: ''
  });

  const [newTopicName, setNewTopicName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, topicsData, questionsData, studentsData] = await Promise.all([
          coursesAPI.getAll(),
          topicsAPI.getAll(),
          questionsAPI.getAll(),
          usersAPI.getStudents(),
        ]);
        
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

  const openAddQuestionModal = (topicId?: string) => {
    setEditingQuestion(null);
    setQuestionFormData({
      topicId: topicId || localTopics[0]?.id,
      difficulty: Difficulty.MEDIUM,
      correctOption: 'A',
      content: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: ''
    });
    setIsQuestionModalOpen(true);
  };

  const openAssignModal = (topic: Topic) => {
    setSelectedTopicForAssign(topic);
    setSelectedStudentIds([]);
    setIsAssignModalOpen(true);
  };

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

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleConfirmAssignment = async () => {
    if (selectedTopicForAssign && selectedStudentIds.length > 0 && user) {
      try {
        // Call backend API
        await assignmentsAPI.assign(
          selectedTopicForAssign.id, 
          selectedStudentIds,
          user.id
        );
      } catch (error) {
        console.error('Failed to assign via API:', error);
      }
      
      // Also update local state for immediate UI feedback
      assignTest(selectedTopicForAssign.id, selectedStudentIds);
      setIsAssignModalOpen(false);
      alert(`Test assigned to ${selectedStudentIds.length} students successfully!`);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const questionData: QuestionCreateData = {
        topicId: questionFormData.topicId!,
        content: questionFormData.content!,
        optionA: questionFormData.optionA!,
        optionB: questionFormData.optionB!,
        optionC: questionFormData.optionC!,
        optionD: questionFormData.optionD!,
        correctOption: questionFormData.correctOption!,
        difficulty: questionFormData.difficulty!,
      };
      
      if (editingQuestion) {
        // Update existing question via API
        const updatedQuestion = await questionsAPI.update(editingQuestion.id, questionData);
        setLocalQuestions(localQuestions.map(q => 
          q.id === editingQuestion.id 
            ? {
                id: updatedQuestion.id,
                topicId: updatedQuestion.topicId,
                content: updatedQuestion.content,
                optionA: updatedQuestion.optionA,
                optionB: updatedQuestion.optionB,
                optionC: updatedQuestion.optionC,
                optionD: updatedQuestion.optionD,
                correctOption: (updatedQuestion.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
                difficulty: updatedQuestion.difficulty as Difficulty,
              }
            : q
        ));
      } else {
        // Create new question via API
        const newQuestion = await questionsAPI.create(questionData);
        const mappedQuestion: Question = {
          id: newQuestion.id,
          topicId: newQuestion.topicId,
          content: newQuestion.content,
          optionA: newQuestion.optionA,
          optionB: newQuestion.optionB,
          optionC: newQuestion.optionC,
          optionD: newQuestion.optionD,
          correctOption: (newQuestion.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
          difficulty: newQuestion.difficulty as Difficulty,
        };
        setLocalQuestions([...localQuestions, mappedQuestion]);
      }
      
      setIsQuestionModalOpen(false);
      alert(editingQuestion ? 'Question updated successfully!' : 'Question added successfully!');
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await questionsAPI.delete(questionId);
      setLocalQuestions(localQuestions.filter(q => q.id !== questionId));
      alert('Question deleted successfully!');
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Faculty Intelligence</h1>
          <p className="text-gray-500 font-medium text-lg">Manage curriculum knowledge gaps and assign diagnostic content</p>
        </div>
        <button 
          onClick={() => setIsTopicModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-3 group"
        >
          <i className="fas fa-folder-plus group-hover:scale-110 transition-transform"></i>
          Create Question Bank
        </button>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
            <i className="fas fa-users text-2xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Total Students</div>
            <div className="text-3xl font-black">{students.length}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center text-green-600 shadow-inner">
            <i className="fas fa-check-double text-2xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Assigned Tests</div>
            <div className="text-3xl font-black text-green-600">{assignments.length}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-600 shadow-inner">
            <i className="fas fa-database text-2xl"></i>
          </div>
          <div>
            <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Bank Depth</div>
            <div className="text-3xl font-black text-orange-600">{localQuestions.length}</div>
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

      {/* TOPIC-BASED QUESTION BANKS */}
      <section className="space-y-8">
        <h2 className="text-2xl font-black text-gray-900 px-2 flex items-center gap-4">
          Knowledge Repositories
          <div className="h-0.5 flex-grow bg-gray-100"></div>
        </h2>
        
        <div className="grid grid-cols-1 gap-8">
          {localTopics.map(topic => {
            const topicQuestions = localQuestions.filter(q => q.topicId === topic.id);
            const activeAssignments = assignments.filter(a => a.topicId === topic.id);
            return (
              <div key={topic.id} className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 border-gray-100">
                <div className="px-10 py-8 border-b flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gray-50/30">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex flex-col items-center justify-center shadow-md border-2 border-indigo-50 font-black text-indigo-600 transform group-hover:rotate-6 transition-transform">
                      <span className="text-xl">{topicQuestions.length}</span>
                      <span className="text-[8px] uppercase tracking-tighter -mt-1 opacity-50">Items</span>
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-gray-800 tracking-tight">{topic.name}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <i className="fas fa-layer-group text-indigo-400"></i> Question Bank
                        </span>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                          <i className="fas fa-paper-plane"></i> {activeAssignments.length} Assigned
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full lg:w-auto gap-4">
                    <button 
                      onClick={() => openAssignModal(topic)}
                      className="flex-grow lg:flex-grow-0 px-8 py-4 bg-indigo-600 text-white rounded-[1.2rem] font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      <i className="fas fa-user-plus"></i> Assign to Students
                    </button>
                    <button 
                      onClick={() => openAddQuestionModal(topic.id)}
                      className="flex-grow lg:flex-grow-0 px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-[1.2rem] font-black text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-plus"></i> Add Item
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white text-gray-400 text-[10px] uppercase font-black border-b tracking-[0.2em]">
                      <tr>
                        <th className="px-10 py-5 w-[60%]">Knowledge Probe</th>
                        <th className="px-10 py-5">Proficiency</th>
                        <th className="px-10 py-5 text-center">Key</th>
                        <th className="px-10 py-5 text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm divide-gray-50">
                      {topicQuestions.length > 0 ? topicQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-indigo-50/20 transition-colors">
                          <td className="px-10 py-6">
                            <p className="text-gray-800 font-bold leading-relaxed">{q.content}</p>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              q.difficulty === Difficulty.EASY ? 'bg-green-50 text-green-700 border-green-100' : 
                              q.difficulty === Difficulty.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                              'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-black mx-auto border-2 border-indigo-50 shadow-sm">
                              {q.correctOption}
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button 
                              onClick={() => { setEditingQuestion(q); setQuestionFormData(q); setIsQuestionModalOpen(true); }}
                              className="text-gray-300 hover:text-indigo-600 p-2 transition-all"
                              title="Edit Question"
                            >
                              <i className="fas fa-sliders text-lg"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-gray-300 hover:text-red-600 p-2 transition-all ml-2"
                              title="Delete Question"
                            >
                              <i className="fas fa-trash text-lg"></i>
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-10 py-16 text-center text-gray-400 font-bold">
                            Empty Repository. Add questions to begin assignment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ASSIGN TEST MODAL */}
      {isAssignModalOpen && selectedTopicForAssign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b shrink-0 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Assign Assessment</h2>
                <p className="text-indigo-600 font-bold text-sm mt-1 uppercase tracking-widest">{selectedTopicForAssign.name}</p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-grow">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Select Students from System Table</label>
              
              <div className="space-y-3">
                {students.map(student => (
                  <div 
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer group ${
                      selectedStudentIds.includes(student.id) 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-gray-50 bg-gray-50/30 hover:border-indigo-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-indigo-50">
                      {student.avatar}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-gray-800">{student.fullName}</h4>
                      <p className="text-xs text-gray-400 font-bold">{student.email}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      selectedStudentIds.includes(student.id) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-transparent'
                    }`}>
                      <i className="fas fa-check text-xs"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-10 bg-gray-50/80 shrink-0 flex gap-4">
               <button 
                 onClick={handleConfirmAssignment}
                 disabled={selectedStudentIds.length === 0}
                 className="flex-grow bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200 transition-all"
               >
                 Confirm Assignment ({selectedStudentIds.length})
               </button>
               <button 
                 onClick={() => setIsAssignModalOpen(false)}
                 className="px-10 py-5 rounded-[1.5rem] bg-white border-2 border-gray-100 font-black text-gray-400 hover:bg-gray-100 transition-all"
               >
                 Cancel
               </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-10 border-b flex justify-between items-center bg-white shrink-0">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {editingQuestion ? 'Modify Item' : 'New Knowledge Probe'}
              </h2>
              <button 
                onClick={() => setIsQuestionModalOpen(false)} 
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="p-10 space-y-8 overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Target Bank</label>
                  <select 
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-600 outline-none font-bold text-gray-800 transition-all"
                    value={questionFormData.topicId}
                    onChange={e => setQuestionFormData({...questionFormData, topicId: e.target.value})}
                    required
                  >
                    {localTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Complexity</label>
                  <select 
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-600 outline-none font-bold text-gray-800 transition-all"
                    value={questionFormData.difficulty}
                    onChange={e => setQuestionFormData({...questionFormData, difficulty: e.target.value as Difficulty})}
                  >
                    <option value={Difficulty.EASY}>Basic Foundations</option>
                    <option value={Difficulty.MEDIUM}>Intermediate Logic</option>
                    <option value={Difficulty.HARD}>Complex Mastery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Question Content</label>
                <textarea 
                  className="w-full p-6 bg-white border-2 border-gray-100 rounded-[1.5rem] focus:border-indigo-600 outline-none h-32 text-lg font-bold resize-none placeholder:text-gray-200 leading-relaxed text-gray-900"
                  placeholder="Ask a diagnostic question..."
                  value={questionFormData.content}
                  onChange={e => setQuestionFormData({...questionFormData, content: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Option {opt}</label>
                    <input 
                      className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-600 outline-none font-bold transition-all"
                      value={(questionFormData as any)[`option${opt}`]}
                      onChange={e => setQuestionFormData({...questionFormData, [`option${opt}`]: e.target.value})}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Correct Solution Path</label>
                <div className="flex justify-around gap-4">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setQuestionFormData({...questionFormData, correctOption: opt as any})}
                      className={`w-16 h-16 rounded-2xl font-black text-xl transition-all border-2 ${
                        questionFormData.correctOption === opt 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                        : 'bg-white border-gray-100 text-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-indigo-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : (editingQuestion ? 'Deploy Updates' : 'Add to Repository')}
              </button>
            </form>
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
