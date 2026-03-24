import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { practiceQuestionsAPI, topicsAPI, mcqAttemptsAPI, PracticeQuestionResponse, TopicResponse } from '../services/api';
import { AuthContext } from '../App';

const MCQPractice: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [questions, setQuestions] = useState<PracticeQuestionResponse[]>([]);
  const [topic, setTopic] = useState<TopicResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
  }, [topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allQuestions, allTopics] = await Promise.all([
        topicId ? practiceQuestionsAPI.getByTopic(topicId) : practiceQuestionsAPI.getAll(),
        topicsAPI.getAll(),
      ]);
      
      // Filter only MCQ questions
      const mcqQuestions = allQuestions.filter(q => q.type === 'MCQ');
      setQuestions(mcqQuestions);
      
      if (topicId) {
        const foundTopic = allTopics.find(t => t.id === topicId);
        setTopic(foundTopic || null);
      }
    } catch (error) {
      console.error('Error loading MCQ questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - Date.now()) / 1000));
    }, 1000);
  };
  
  // Update timer every second
  useEffect(() => {
    if (quizStarted && !showResults && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStarted, showResults, startTime]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    setElapsedTime(finalTime);
    setShowResults(true);
    
    // Calculate score
    const { correct, total, percentage } = calculateScore();
    
    // Submit full attempt data
    if (user && topicId) {
      try {
        console.log('Submitting attempt with:', { studentId: user.id, topicId, total, correct, percentage, finalTime });
        await mcqAttemptsAPI.submit({
          studentId: user.id,
          topicId: topicId,
          totalQuestions: total,
          correctAnswers: correct,
          scorePercentage: percentage,
          timeTakenSeconds: finalTime,
        });
        console.log('Attempt saved successfully');
      } catch (error: any) {
        console.error('Failed to save attempt:', error);
        alert(`Failed to save assessment result: ${error.message || 'Please check if backend is running and try logging out and back in.'}`);
      }
    } else {
      console.warn('Cannot submit: user or topicId missing', { user: !!user, topicId });
    }
    
    // Record individual question attempts
    for (const question of questions) {
      const selected = selectedAnswers[question.id];
      const isCorrect = selected === question.solution;
      try {
        await practiceQuestionsAPI.recordAttempt(question.id, isCorrect);
      } catch (error) {
        console.error('Failed to record attempt:', error);
      }
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.solution) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const parseOptions = (problemStatement: string) => {
    const lines = problemStatement.split('\n');
    const questionText = lines.filter(l => !l.match(/^[A-D]\)/)).join('\n');
    const options: { label: string; text: string }[] = [];
    
    lines.forEach(line => {
      const match = line.match(/^([A-D])\)\s*(.+)/);
      if (match) {
        options.push({ label: match[1], text: match[2] });
      }
    });
    
    return { questionText, options };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-6">📝</div>
        <h2 className="text-2xl font-black text-gray-800 mb-4">No MCQ Questions Available</h2>
        <p className="text-gray-500 mb-8">There are no MCQ questions for this topic yet.</p>
        <Link to="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Results View
  if (showResults) {
    const score = calculateScore();
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white text-center">
          <div className="text-8xl font-black mb-4">{score.percentage}%</div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-blue-100">You got {score.correct} out of {score.total} questions correct</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-800">Review Your Answers</h3>
          {questions.map((question, idx) => {
            const { questionText, options } = parseOptions(question.problemStatement);
            const userAnswer = selectedAnswers[question.id];
            const isCorrect = userAnswer === question.solution;
            
            return (
              <div key={question.id} className={`bg-white rounded-2xl p-6 border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <i className="fas fa-check"></i> : <i className="fas fa-times"></i>}
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm text-gray-500 mb-1">Question {idx + 1}</div>
                    <h4 className="font-bold text-gray-800">{question.title}</h4>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-line">{questionText}</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {options.map(opt => (
                    <div
                      key={opt.label}
                      className={`p-3 rounded-xl border-2 ${
                        opt.label === question.solution
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : opt.label === userAnswer && opt.label !== question.solution
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="font-bold">{opt.label})</span> {opt.text}
                      {opt.label === question.solution && <i className="fas fa-check ml-2 text-green-500"></i>}
                    </div>
                  ))}
                </div>
                {!isCorrect && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-sm font-bold text-blue-600 mb-1">Explanation</div>
                    <p className="text-blue-800 text-sm">{question.solutionExplanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={startQuiz}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            <i className="fas fa-redo mr-2"></i>Retry Quiz
          </button>
          <Link
            to="/dashboard"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-10 text-white text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl font-black mb-2">MCQ Practice Quiz</h1>
            <p className="text-purple-100">{topic?.name || 'All Topics'}</p>
          </div>
          <div className="p-10">
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-800">{questions.length}</div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-gray-800">{questions.reduce((sum, q) => sum + (q.points || 5), 0)}</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-gray-800">{questions.reduce((sum, q) => sum + (q.timeLimit || 2), 0)}</div>
                <div className="text-sm text-gray-500">Minutes</div>
              </div>
            </div>
            
            <div className="space-y-3 mb-10">
              <div className="flex items-center gap-3 text-gray-600">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Answer all questions to see your score</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Review explanations for incorrect answers</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Retry as many times as you want</span>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <i className="fas fa-play mr-2"></i>Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Question View
  const currentQuestion = questions[currentIndex];
  const { questionText, options } = parseOptions(currentQuestion.problemStatement);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-600">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-sm text-gray-500">{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
              currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-sm text-gray-500">{currentQuestion.points} points</span>
          </div>
          
          <h2 className="text-xl font-black text-gray-800 mb-4">{currentQuestion.title}</h2>
          <p className="text-gray-600 whitespace-pre-line mb-8">{questionText}</p>

          <div className="space-y-3">
            {options.map(opt => (
              <button
                key={opt.label}
                onClick={() => handleAnswerSelect(currentQuestion.id, opt.label)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswers[currentQuestion.id] === opt.label
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <span className="font-bold mr-3">{opt.label})</span>
                {opt.text}
                {selectedAnswers[currentQuestion.id] === opt.label && (
                  <i className="fas fa-check-circle float-right text-purple-500 mt-1"></i>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 p-6 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <i className="fas fa-arrow-left mr-2"></i>Previous
          </button>

          <div className="flex gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                  idx === currentIndex
                    ? 'bg-purple-600 text-white'
                    : selectedAnswers[questions[idx].id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                Object.keys(selectedAnswers).length !== questions.length
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Submit Quiz<i className="fas fa-check ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition"
            >
              Next<i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-bold text-gray-600 mb-3">Answer Status</div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span><span className="inline-block w-4 h-4 bg-green-100 rounded mr-2"></span>Answered</span>
          <span><span className="inline-block w-4 h-4 bg-gray-200 rounded mr-2"></span>Not Answered</span>
          <span><span className="inline-block w-4 h-4 bg-purple-600 rounded mr-2"></span>Current</span>
        </div>
      </div>
    </div>
  );
};

export default MCQPractice;
