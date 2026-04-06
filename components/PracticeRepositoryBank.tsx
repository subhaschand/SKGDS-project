import React, { useState, useEffect } from 'react';
import { practiceQuestionsAPI, topicsAPI, coursesAPI, PracticeQuestionResponse, PracticeQuestionCreateData, TopicResponse, CourseResponse } from '../services/api';

interface Props {
  user: { id: string; name: string; role: string };
}

const PracticeRepositoryBank: React.FC<Props> = ({ user }) => {
  const [questions, setQuestions] = useState<PracticeQuestionResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicCourseId, setNewTopicCourseId] = useState('');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PracticeQuestionResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  
  const [formData, setFormData] = useState<PracticeQuestionCreateData>({
    title: '',
    description: '',
    topicId: '',
    courseId: '',
    difficulty: 'EASY',
    type: 'MCQ',
    problemStatement: '',
    hints: [],
    solution: '',
    solutionExplanation: '',
    testCases: [],
    tags: [],
    timeLimit: 30,
    points: 10,
    createdBy: user.id,
  });
  
  const [hintsInput, setHintsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, topicsData, coursesData] = await Promise.all([
        practiceQuestionsAPI.getAll(),
        topicsAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      setQuestions(questionsData);
      setTopics(topicsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      topicId: '',
      courseId: '',
      difficulty: 'EASY',
      type: 'MCQ',
      problemStatement: '',
      hints: [],
      solution: '',
      solutionExplanation: '',
      testCases: [],
      tags: [],
      timeLimit: 30,
      points: 10,
      createdBy: user.id,
    });
    setHintsInput('');
    setTagsInput('');
    setEditingQuestion(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (question: PracticeQuestionResponse) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      description: question.description,
      topicId: question.topicId || '',
      courseId: question.courseId || '',
      difficulty: question.difficulty,
      type: question.type,
      problemStatement: question.problemStatement,
      hints: question.hints || [],
      solution: question.solution || '',
      solutionExplanation: question.solutionExplanation || '',
      testCases: question.testCases || [],
      tags: question.tags || [],
      timeLimit: question.timeLimit || 30,
      points: question.points || 10,
      createdBy: question.createdBy,
    });
    setHintsInput((question.hints || []).join('\n'));
    setTagsInput((question.tags || []).join(', '));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        hints: hintsInput.split('\n').filter(h => h.trim()),
        tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
      };

      if (editingQuestion) {
        await practiceQuestionsAPI.update(editingQuestion.id, dataToSubmit);
      } else {
        await practiceQuestionsAPI.create(dataToSubmit);
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) {
      alert('Please enter a topic name');
      return;
    }
    if (!newTopicCourseId) {
      alert('Please select a course');
      return;
    }
    
    setIsCreatingTopic(true);
    try {
      await topicsAPI.create({ name: newTopicName, courseId: newTopicCourseId });
      await loadData();
      setNewTopicName('');
      setNewTopicCourseId('');
      setShowTopicModal(false);
      alert('Question Bank created successfully!');
    } catch (error) {
      console.error('Error creating topic:', error);
      alert('Failed to create question bank');
    } finally {
      setIsCreatingTopic(false);
    }
  };

  const getQuestionCountByTopic = (topicId: string) => {
    return questions.filter(q => q.topicId === topicId).length;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await practiceQuestionsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.problemStatement?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !filterDifficulty || q.difficulty === filterDifficulty;
    const matchesType = !filterType || q.type === filterType;
    const matchesTopic = !filterTopic || q.topicId === filterTopic;
    return matchesSearch && matchesDifficulty && matchesType && matchesTopic;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'HARD': return 'bg-orange-100 text-orange-700';
      case 'EXPERT': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CODING': return 'fa-code';
      case 'MCQ': return 'fa-list-ul';
      case 'SHORT_ANSWER': return 'fa-pen';
      case 'FILL_IN_BLANK': return 'fa-underline';
      case 'TRUE_FALSE': return 'fa-check-double';
      default: return 'fa-question';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black mb-2">Practice Repository Bank</h1>
            <p className="text-purple-100">{user.role === 'STUDENT' ? 'Browse and practice questions' : 'Manage practice questions for students'}</p>
          </div>
          {user.role !== 'STUDENT' && (
            <button
              onClick={openCreateModal}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add Question
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black">{questions.length}</div>
            <div className="text-purple-200 text-sm">Total Questions</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black">{questions.filter(q => q.difficulty === 'EASY').length}</div>
            <div className="text-purple-200 text-sm">Easy</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black">{questions.filter(q => q.difficulty === 'MEDIUM').length}</div>
            <div className="text-purple-200 text-sm">Medium</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-black">{questions.filter(q => q.difficulty === 'HARD' || q.difficulty === 'EXPERT').length}</div>
            <div className="text-purple-200 text-sm">Hard/Expert</div>
          </div>
        </div>
      </div>

      {/* Question Banks Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">
            <i className="fas fa-folder text-indigo-500 mr-2"></i>
            Question Banks ({topics.length})
          </h2>
          {user.role !== 'STUDENT' && (
            <button
              onClick={() => setShowTopicModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Create Question Bank
            </button>
          )}
        </div>
        {topics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-folder-open text-4xl mb-3"></i>
            <p>No question banks yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topics.map(topic => {
              const questionCount = getQuestionCountByTopic(topic.id);
              const course = courses.find(c => c.id === topic.courseId);
              return (
                <div
                  key={topic.id}
                  onClick={() => setFilterTopic(filterTopic === topic.id ? '' : topic.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    filterTopic === topic.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      <i className="fas fa-book"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{topic.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{course?.title || 'No course'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      <i className="fas fa-question-circle mr-1"></i>
                      {questionCount} questions
                    </span>
                    {filterTopic === topic.id && (
                      <span className="text-indigo-600 font-bold text-xs">ACTIVE</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Types</option>
            <option value="CODING">Coding</option>
            <option value="MCQ">MCQ</option>
            <option value="SHORT_ANSWER">Short Answer</option>
            <option value="FILL_IN_BLANK">Fill in Blank</option>
            <option value="TRUE_FALSE">True/False</option>
          </select>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic.id} value={topic.id}>{topic.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border">
            <i className="fas fa-folder-open text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Questions Found</h3>
            <p className="text-gray-500 mb-4">Start by adding your first practice question</p>
            <button
              onClick={openCreateModal}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition"
            >
              <i className="fas fa-plus mr-2"></i>Add Question
            </button>
          </div>
        ) : (
          filteredQuestions.map(question => (
            <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDifficultyColor(question.difficulty)}`}>
                      <i className={`fas ${getTypeIcon(question.type)}`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{question.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {question.topicName && <span><i className="fas fa-tag mr-1"></i>{question.topicName}</span>}
                        <span><i className="fas fa-clock mr-1"></i>{question.timeLimit} min</span>
                        <span><i className="fas fa-star mr-1"></i>{question.points} pts</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2 mb-3">{question.description || question.problemStatement}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {question.type.replace('_', ' ')}
                    </span>
                    {question.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center mr-4">
                    <div className="text-sm text-gray-500">Success Rate</div>
                    <div className="text-lg font-bold text-green-600">
                      {question.attemptCount > 0 
                        ? Math.round((question.successCount / question.attemptCount) * 100) 
                        : 0}%
                    </div>
                  </div>
                  {user.role !== 'STUDENT' && (
                    <>
                      <button
                        onClick={() => openEditModal(question)}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h2>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <i className="fas fa-times text-gray-500"></i>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter question title"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Brief description of the question"
                  />
                </div>
              </div>

              {/* Topic, Course, Difficulty, Type */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => setFormData({...formData, topicId: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Topic</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Course</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty *</label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="CODING">Coding</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="FILL_IN_BLANK">Fill in Blank</option>
                    <option value="TRUE_FALSE">True/False</option>
                  </select>
                </div>
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Problem Statement *</label>
                <textarea
                  required
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({...formData, problemStatement: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="Enter the complete problem statement..."
                />
              </div>

              {/* Solution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Solution</label>
                  <textarea
                    value={formData.solution}
                    onChange={(e) => setFormData({...formData, solution: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                    placeholder="Enter the solution..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Solution Explanation</label>
                  <textarea
                    value={formData.solutionExplanation}
                    onChange={(e) => setFormData({...formData, solutionExplanation: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Explain the solution approach..."
                  />
                </div>
              </div>

              {/* Hints & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hints (one per line)</label>
                  <textarea
                    value={hintsInput}
                    onChange={(e) => setHintsInput(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Add hints for students..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                  <textarea
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="arrays, sorting, beginner..."
                  />
                </div>
              </div>

              {/* Time & Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({...formData, timeLimit: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Question Bank Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">
                <i className="fas fa-folder-plus text-indigo-500 mr-2"></i>
                Create Question Bank
              </h2>
              <button
                onClick={() => { setShowTopicModal(false); setNewTopicName(''); setNewTopicCourseId(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <i className="fas fa-times text-gray-500"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course *</label>
                <select
                  value={newTopicCourseId}
                  onChange={(e) => setNewTopicCourseId(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Question Bank Name *</label>
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
                  onClick={() => { setShowTopicModal(false); setNewTopicName(''); setNewTopicCourseId(''); }}
                  className="flex-1 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTopic}
                  disabled={isCreatingTopic}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isCreatingTopic ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i> Creating...</>
                  ) : (
                    <><i className="fas fa-plus mr-2"></i> Create</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeRepositoryBank;
