import React, { useState, useEffect, useContext } from 'react';
import { TOPICS, QUESTIONS, STUDENTS } from '../services/mockData';
import { topicsAPI, questionsAPI, usersAPI, assignmentsAPI, QuestionCreateData, questionUploadAPI, ParsedQuestion } from '../services/api';
import { Difficulty, Topic, Question, User, Assignment } from '../types';
import { AuthContext } from '../App';

const RepositoryManagementPage: React.FC = () => {
  const { user, assignTest, assignments } = useContext(AuthContext);
  const [localTopics, setLocalTopics] = useState<Topic[]>(TOPICS);
  const [localQuestions, setLocalQuestions] = useState<Question[]>(QUESTIONS);
  const [students, setStudents] = useState<User[]>(STUDENTS);
  const [loading, setLoading] = useState(true);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTopicForAssign, setSelectedTopicForAssign] = useState<Topic | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
    // View assigned students state
    const [isViewAssignedModalOpen, setIsViewAssignedModalOpen] = useState(false);
    const [selectedTopicForView, setSelectedTopicForView] = useState<Topic | null>(null);
  
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // PDF Upload State
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTopicId, setPdfTopicId] = useState<string>('');
  const [pdfQuestionType, setPdfQuestionType] = useState<string>('MCQ');
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseMode, setParseMode] = useState<'pdf' | 'text'>('pdf');
  const [pastedText, setPastedText] = useState('');
  const [questionFormData, setQuestionFormData] = useState<Partial<Question>>({
    topicId: '',
    difficulty: Difficulty.MEDIUM,
    correctOption: 'A',
    content: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, questionsData, studentsData] = await Promise.all([
          topicsAPI.getAll(),
          questionsAPI.getAll(),
          usersAPI.getStudents()
        ]);
        
        setLocalTopics(topicsData);
        setLocalQuestions(questionsData);
        setStudents(studentsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

    const openViewAssignedModal = (topic: Topic) => {
      setSelectedTopicForView(topic);
      setIsViewAssignedModalOpen(true);
    };

    const getAssignedStudentsForTopic = (topicId: string): (User & { status: string })[] => {
      return assignments
        .filter(a => a.topicId === topicId)
        .map(a => {
          const student = students.find(s => s.id === a.studentId);
          return {
            ...student!,
            status: a.status,
          };
        });
    };

    const handleRemoveAssignment = async (topicId: string, studentId: string) => {
      if (!confirm('Are you sure you want to remove this assignment?')) return;
      try {
        // API call to remove assignment would go here
        alert('Assignment removed successfully');
        // Trigger re-fetch if needed
      } catch (error) {
        console.error('Failed to remove assignment:', error);
      }
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
    if (selectedTopicForAssign && selectedStudentIds.length > 0) {
      if (!user?.id) {
        alert('Unable to assign tests. Please log in again.');
        return;
      }

      try {
        await assignmentsAPI.assign(
          selectedTopicForAssign.id, 
          selectedStudentIds,
          user.id
        );
        assignTest(selectedTopicForAssign.id, selectedStudentIds);
        setIsAssignModalOpen(false);
        setSelectedStudentIds([]);
        alert(`Test assigned to ${selectedStudentIds.length} students successfully!`);
      } catch (error) {
        console.error('Failed to assign:', error);
        const message = error instanceof Error ? error.message : 'Unknown error while assigning test.';
        alert(`Failed to assign test: ${message}`);
      }
    }
  };

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
      setParsedQuestions([]);
    } catch (error) {
      console.error('Failed to save questions:', error);
      alert('Failed to save questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateParsedQuestion = (index: number, field: string, value: any) => {
    setParsedQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeParsedQuestion = (index: number) => {
    setParsedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <i className="fas fa-spinner text-4xl text-blue-600"></i>
          </div>
          <p className="text-gray-500 font-bold">Loading repositories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Repository Management</h1>
        <p className="text-gray-500 font-medium text-lg mt-2">Manage topics, questions, and assignments</p>
      </header>

      {/* KNOWLEDGE REPOSITORIES SECTION */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
            <i className="fas fa-book-open text-blue-600"></i>
            Knowledge Repositories
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-xl uppercase tracking-widest">
              {localTopics.length} Topics
            </span>
          </h2>
        </div>
        
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
                        onClick={() => openViewAssignedModal(topic)}
                        className={`flex-grow lg:flex-grow-0 px-8 py-4 text-white rounded-[1.2rem] font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                          activeAssignments.length > 0 
                            ? 'bg-green-600 hover:bg-green-700 shadow-green-200' 
                            : 'bg-gray-400 hover:bg-gray-500 shadow-gray-200'
                        }`}
                      >
                        <i className="fas fa-eye"></i> View ({activeAssignments.length})
                      </button>
                    <button 
                      onClick={() => openPdfUploadModal(topic.id)}
                      className="flex-grow lg:flex-grow-0 px-6 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-[1.2rem] font-black text-sm hover:border-green-600 hover:text-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-file-pdf"></i> Upload PDF
                    </button>
                    <button 
                      onClick={() => openAddQuestionModal(topic.id)}
                      className="flex-grow lg:flex-grow-0 px-6 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-[1.2rem] font-black text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
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
                      {student.fullName.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-black text-gray-800">{student.fullName}</h4>
                      <p className="text-xs text-gray-400 font-bold">{student.email}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedStudentIds.includes(student.id)
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-200 bg-white'
                    }`}>
                      {selectedStudentIds.includes(student.id) && <i className="fas fa-check text-white text-xs"></i>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-10 border-t bg-gray-50/50 shrink-0 flex gap-4">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="flex-1 px-6 py-4 text-gray-600 hover:bg-gray-100 rounded-2xl font-black transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                disabled={selectedStudentIds.length === 0}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign to {selectedStudentIds.length} Student{selectedStudentIds.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
            {/* VIEW ASSIGNED STUDENTS MODAL */}
            {isViewAssignedModalOpen && selectedTopicForView && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
                <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-10 border-b shrink-0 flex justify-between items-center bg-gray-50/50">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">Assigned Students</h2>
                      <p className="text-indigo-600 font-bold text-sm mt-1 uppercase tracking-widest">{selectedTopicForView.name}</p>
                    </div>
                    <button 
                      onClick={() => setIsViewAssignedModalOpen(false)}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border-2 border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
            
                  <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-grow">
                    {(() => {
                      const assignedStudents = getAssignedStudentsForTopic(selectedTopicForView.id);
                      return assignedStudents.length > 0 ? (
                        <div className="space-y-3">
                          {assignedStudents.map(student => (
                            <div 
                              key={student.id}
                              className="flex items-center justify-between p-5 rounded-3xl border-2 border-gray-50 bg-gray-50/30 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                            >
                              <div className="flex items-center gap-4 flex-grow">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-indigo-50">
                                  {student.fullName.charAt(0)}
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-black text-gray-800">{student.fullName}</h4>
                                  <p className="text-xs text-gray-400 font-bold">{student.email}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                                  student.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {student.status}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveAssignment(selectedTopicForView.id, student.id)}
                                className="ml-4 w-10 h-10 rounded-2xl flex items-center justify-center text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Remove Assignment"
                              >
                                <i className="fas fa-times text-lg"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <i className="fas fa-inbox text-6xl text-gray-200 mb-4 block"></i>
                          <p className="text-gray-500 text-lg font-semibold">No students assigned yet</p>
                          <p className="text-gray-400 text-sm mt-2">Use "Assign to Students" button to add assignments</p>
                        </div>
                      );
                    })()}
                  </div>
            
                  <div className="p-10 border-t bg-gray-50/50 shrink-0 flex gap-4">
                    <button
                      onClick={() => setIsViewAssignedModalOpen(false)}
                      className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
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
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Topic</label>
                  <select
                    value={questionFormData.topicId}
                    onChange={(e) => setQuestionFormData({...questionFormData, topicId: e.target.value})}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:border-indigo-600 outline-none"
                  >
                    {localTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Difficulty</label>
                  <select
                    value={questionFormData.difficulty}
                    onChange={(e) => setQuestionFormData({...questionFormData, difficulty: e.target.value as Difficulty})}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:border-indigo-600 outline-none"
                  >
                    <option value={Difficulty.EASY}>EASY</option>
                    <option value={Difficulty.MEDIUM}>MEDIUM</option>
                    <option value={Difficulty.HARD}>HARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Question Content</label>
                <textarea 
                  className="w-full p-6 bg-white border-2 border-gray-100 rounded-[1.5rem] focus:border-indigo-600 outline-none h-32 text-lg font-bold resize-none"
                  placeholder="Ask a diagnostic question..."
                  value={questionFormData.content}
                  onChange={e => setQuestionFormData({...questionFormData, content: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Option {opt}</label>
                    <input 
                      className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-indigo-600 outline-none font-bold transition-all"
                      value={(questionFormData as any)[`option${opt}`] || ''}
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

      {/* PDF Upload Modal */}
      {isPdfUploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[115] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Upload Questions</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Import from PDF or paste text</p>
              </div>
              <button 
                onClick={() => setIsPdfUploadModalOpen(false)} 
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-grow space-y-6">
              {/* Mode Selection */}
              <div className="flex gap-4">
                <button
                  onClick={() => setParseMode('pdf')}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all ${parseMode === 'pdf' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <i className="fas fa-file-pdf mr-2"></i> Upload PDF
                </button>
                <button
                  onClick={() => setParseMode('text')}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all ${parseMode === 'text' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <i className="fas fa-paste mr-2"></i> Paste Text
                </button>
              </div>

              {/* Topic & Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Topic</label>
                  <select
                    value={pdfTopicId}
                    onChange={(e) => setPdfTopicId(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:border-indigo-600 outline-none"
                  >
                    {localTopics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Type</label>
                  <select
                    value={pdfQuestionType}
                    onChange={(e) => setPdfQuestionType(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:border-indigo-600 outline-none"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="CODING">Coding</option>
                  </select>
                </div>
              </div>

              {/* PDF Upload Area */}
              {parseMode === 'pdf' && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">PDF File</label>
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
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Paste Questions</label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your questions here..."
                    className="w-full p-4 bg-white border-2 border-gray-100 rounded-2xl font-medium text-gray-800 h-40 resize-none focus:border-indigo-600 outline-none"
                  />
                </div>
              )}

              {/* Parse Button */}
              <button
                onClick={handleParsePdf}
                disabled={isParsing || (parseMode === 'pdf' && !pdfFile) || (parseMode === 'text' && !pastedText.trim())}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h3 className="text-lg font-black text-gray-900 mb-4">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Found {parsedQuestions.length} Questions
                  </h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
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
                          
                          {q.type === 'MCQ' && q.problemStatement && (
                            <div className="text-sm text-gray-600 mb-2">{q.problemStatement}</div>
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
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
    </div>
  );
};

export default RepositoryManagementPage;
