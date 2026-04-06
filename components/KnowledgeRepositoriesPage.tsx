import React, { useState, useEffect, useContext } from 'react';
import { TOPICS, QUESTIONS, STUDENTS } from '../services/mockData';
import { topicsAPI, questionsAPI, assignmentsAPI, usersAPI, QuestionCreateData } from '../services/api';
import { Topic, Question, Difficulty, User } from '../types';
import { AuthContext } from '../App';

interface RepositoryView {
  topic: Topic;
  questions: Question[];
  assignmentCount: number;
}

const KnowledgeRepositoriesPage: React.FC = () => {
  const [repositories, setRepositories] = useState<RepositoryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTopicForAssign, setSelectedTopicForAssign] = useState<Topic | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
  const [localTopics, setLocalTopics] = useState<Topic[]>([]);
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const { assignTest } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, questionsData, assignmentsData, studentsData] = await Promise.all([
          topicsAPI.getAll(),
          questionsAPI.getAll(),
          assignmentsAPI.getAll(),
          usersAPI.getStudents()
        ]);

        setLocalTopics(topicsData);
        setLocalQuestions(questionsData);
        setStudents(studentsData);

        const repos: RepositoryView[] = topicsData.map(topic => ({
          topic,
          questions: questionsData.filter(q => q.topicId === topic.id),
          assignmentCount: assignmentsData.filter(a => a.topicId === topic.id).length
        }));

        setRepositories(repos);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        
        // Fallback to mock data
        setLocalTopics(TOPICS);
        setLocalQuestions(QUESTIONS);
        setStudents(STUDENTS);

        const repos: RepositoryView[] = TOPICS.map(topic => ({
          topic,
          questions: QUESTIONS.filter(q => q.topicId === topic.id),
          assignmentCount: Math.floor(Math.random() * 15) + 1
        }));

        setRepositories(repos);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map(s => s.id));
    }
  };

  const handleConfirmAssignment = async () => {
    if (selectedTopicForAssign && selectedStudentIds.length > 0) {
      try {
        await assignmentsAPI.assign(
          selectedTopicForAssign.id, 
          selectedStudentIds,
          ''
        );
        assignTest(selectedTopicForAssign.id, selectedStudentIds);
        setIsAssignModalOpen(false);
        setSelectedStudentIds([]);
        alert(`Test assigned to ${selectedStudentIds.length} student(s) successfully!`);
      } catch (error) {
        console.error('Failed to assign:', error);
        alert('Failed to assign test. Please try again.');
      }
    } else {
      alert('Please select at least one student');
    }
  };

  const toggleExpand = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const openAddQuestionModal = (topicId: string) => {
    setEditingQuestion(null);
    setQuestionFormData({
      topicId,
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

  const openEditQuestionModal = (question: Question) => {
    setEditingQuestion(question);
    setQuestionFormData({...question});
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
                correctOption: updatedQuestion.correctOption as 'A' | 'B' | 'C' | 'D',
                difficulty: updatedQuestion.difficulty,
              }
            : q
        ));
      } else {
        const newQuestion = await questionsAPI.create(questionData);
        setLocalQuestions([...localQuestions, {
          id: newQuestion.id,
          topicId: newQuestion.topicId,
          content: newQuestion.content,
          optionA: newQuestion.optionA,
          optionB: newQuestion.optionB,
          optionC: newQuestion.optionC,
          optionD: newQuestion.optionD,
          correctOption: newQuestion.correctOption as 'A' | 'B' | 'C' | 'D',
          difficulty: newQuestion.difficulty,
        }]);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'HARD':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'EASY';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'HARD':
        return 'HARD';
      default:
        return difficulty;
    }
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Knowledge Repositories</h1>
        <p className="text-gray-600 font-bold text-lg">
          <span className="bg-gray-100 px-3 py-1 rounded-lg">{repositories.length} Items</span>
        </p>
      </div>

      {/* Repositories List */}
      <div className="space-y-8">
        {repositories.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-bold text-lg">No repositories available yet</p>
          </div>
        ) : (
          repositories.map(repo => (
            <div 
              key={repo.topic.id}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Repository Header */}
              <div className="px-10 py-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-2xl font-black text-gray-900">{repo.topic.name}</h2>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg">
                        Question Bank
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg">
                        {repo.assignmentCount} Assigned
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{repo.topic.description}</p>
                  </div>

                  <button 
                    onClick={() => toggleExpand(repo.topic.id)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all"
                  >
                    <i className={`fas fa-chevron-down transition-transform font-bold text-gray-600 ${expandedTopics.has(repo.topic.id) ? 'rotate-180' : ''}`}></i>
                  </button>
                </div>
              </div>

              {/* Repository Actions */}
              <div className="px-10 py-6 border-b border-gray-100 bg-white flex gap-3 flex-wrap">
                <button 
                  onClick={() => {
                    setSelectedTopicForAssign(repo.topic);
                    setIsAssignModalOpen(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-users"></i>
                  Assign to Students
                </button>
                <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg">
                  <i className="fas fa-file-pdf"></i>
                  Upload PDF
                </button>
                <button 
                  onClick={() => openAddQuestionModal(repo.topic.id)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-plus"></i>
                  Add Item
                </button>
              </div>

              {/* Repository Content - Questions Table */}
              {expandedTopics.has(repo.topic.id) && (
                <div className="px-10 py-6 bg-white overflow-x-auto">
                  {repo.questions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No questions in this repository</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-black text-gray-700 text-sm uppercase tracking-wider">Knowledge Probe</th>
                          <th className="text-left py-4 px-4 font-black text-gray-700 text-sm uppercase tracking-wider">Proficiency</th>
                          <th className="text-left py-4 px-4 font-black text-gray-700 text-sm uppercase tracking-wider">Key</th>
                          <th className="text-left py-4 px-4 font-black text-gray-700 text-sm uppercase tracking-wider">Ops</th>
                        </tr>
                      </thead>
                      <tbody>
                        {repo.questions.map((question, idx) => (
                          <tr key={`${question.id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <p className="text-gray-900 font-bold text-sm line-clamp-2">{question.content}</p>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider inline-block ${getDifficultyColor(question.difficulty)}`}>
                                {getDifficultyLabel(question.difficulty)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-black text-sm">
                                {question.correctOption}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => openEditQuestionModal(question)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-indigo-600 font-bold"
                                  title="Edit Question"
                                >
                                  <i className="fas fa-pen-to-square"></i>
                                </button>
                                <button 
                                  onClick={() => handleDeleteQuestion(question.id)}
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-red-600 font-bold"
                                  title="Delete Question"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Question Count Summary */}
              <div className="px-10 py-4 bg-gray-50/50 border-t border-gray-100">
                <p className="text-sm text-gray-600 font-bold">
                  <span className="text-gray-900 font-black">{repo.questions.length}</span> Items
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && selectedTopicForAssign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[105] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Assign to Students</h2>
                <p className="text-sm text-gray-600 font-bold mt-1">{selectedTopicForAssign.name}</p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)} 
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-all"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <p className="text-gray-600 font-bold mb-6">Select students to assign this topic:</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-100 rounded-xl hover:border-blue-600 hover:bg-blue-50 cursor-pointer transition-all">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5" 
                    checked={selectedStudentIds.length === students.length && students.length > 0}
                    onChange={toggleSelectAllStudents}
                  />
                  <span className="font-bold text-gray-900">Select All Students ({students.length})</span>
                </label>
                
                <div className="border-t border-gray-200 pt-4 space-y-2 max-h-64 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No students available</p>
                  ) : (
                    students.map(student => (
                      <label key={student.id} className="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4" 
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{student.fullName}</p>
                          <p className="text-gray-500 text-xs">{student.rollNumber}</p>
                        </div>
                        {student.rollNumber && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">{student.rollNumber}</span>}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {setIsAssignModalOpen(false); setSelectedStudentIds([]);}}
                className="flex-1 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAssignment}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                disabled={selectedStudentIds.length === 0}
              >
                Assign ({selectedStudentIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-10 border-b flex justify-between items-center bg-white shrink-0">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
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
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Difficulty Level</label>
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
                  placeholder="Ask a question..."
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
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Correct Answer</label>
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
                {isSaving ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeRepositoriesPage;
