
import React, { useState, useContext, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TOPICS, QUESTIONS, STUDENTS } from '../services/mockData';
import { topicsAPI, questionsAPI, usersAPI, assignmentsAPI } from '../services/api';
import { Difficulty, Question, Topic, User } from '../types';
import { AuthContext } from '../App';

const CLASS_STATS = [
  { topic: 'Binary Trees', average: 75, gaps: 12 },
  { topic: 'Sorting Algorithms', average: 58, gaps: 25 },
  { topic: 'Normalization', average: 82, gaps: 5 },
  { topic: 'SQL Joins', average: 45, gaps: 38 },
];

const FacultyDashboard: React.FC = () => {
  const { user, assignTest, assignments } = useContext(AuthContext);
  const [localTopics, setLocalTopics] = useState<Topic[]>(TOPICS);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(QUESTIONS);
  const [students, setStudents] = useState<User[]>(STUDENTS);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
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

  const [newTopicName, setNewTopicName] = useState('');

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, questionsData, studentsData] = await Promise.all([
          topicsAPI.getAll(),
          questionsAPI.getAll(),
          usersAPI.getStudents(),
        ]);
        
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
          id: s.id.toString(),
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

  const openAddQuestionModal = (topicId?: number) => {
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
          selectedStudentIds.map(id => parseInt(id)),
          parseInt(user.id)
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

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      setLocalQuestions(localQuestions.map(q => q.id === editingQuestion.id ? { ...questionFormData, id: q.id } as Question : q));
    } else {
      const questionToSave: Question = {
        ...questionFormData,
        id: Math.max(0, ...localQuestions.map(q => q.id)) + 1,
      } as Question;
      setLocalQuestions([...localQuestions, questionToSave]);
    }
    setIsQuestionModalOpen(true);
    setIsQuestionModalOpen(false);
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
                            >
                              <i className="fas fa-sliders text-lg"></i>
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
                    onChange={e => setQuestionFormData({...questionFormData, topicId: parseInt(e.target.value)})}
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
                className="w-full bg-indigo-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95 mt-4"
              >
                {editingQuestion ? 'Deploy Updates' : 'Add to Repository'}
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
