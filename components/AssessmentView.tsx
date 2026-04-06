
import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { topicsAPI, questionsAPI, assessmentAPI, assignmentsAPI } from '../services/api';
import { AssessmentResult, Difficulty, Question, Topic } from '../types';
import ResultView from './ResultView';

const AssessmentView: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user, completeAssignment } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [topicQuestions, setTopicQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const tId = topicId || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!tId) {
        setLoading(false);
        return;
      }
      try {
        const [topicData, questionsData] = await Promise.all([
          topicsAPI.getById(tId),
          questionsAPI.getByTopic(tId),
        ]);
        
        setTopic({
          id: topicData.id,
          name: topicData.name,
          courseId: topicData.courseId,
        });
        
        setTopicQuestions(questionsData.map(q => ({
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
      } catch (error) {
        console.error('Failed to fetch assessment data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
        <p className="text-gray-500 font-bold">Loading assessment...</p>
      </div>
    );
  }

  if (!topic || topicQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-8">
        <div className="w-32 h-32 bg-red-50 text-red-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-sm border border-red-100">
          <i className="fas fa-triangle-exclamation text-5xl"></i>
        </div>
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Probe Unavailable</h2>
          <p className="text-gray-500 font-bold text-lg">This knowledge bank is empty or being updated.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all">
          Back to Command Center
        </button>
      </div>
    );
  }

  const handleAnswer = (option: string) => {
    const qId = topicQuestions[currentIdx].id;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const next = () => {
    if (currentIdx < topicQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const submit = async () => {
    if (!topic || !user) return;
    
    setSubmitting(true);
    
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt as string
      }));
      
      const evaluation = await assessmentAPI.submit({
        courseId: topic.courseId,
        studentId: user.id,
        answers: formattedAnswers,
      });
      
      // Also complete assignment in backend
      try {
        await assignmentsAPI.complete(topic.id, user.id);
      } catch {
        // Assignment may not exist, that's ok
      }
      
      // Update local state
      completeAssignment(topic.id);
      
      // Convert API response to AssessmentResult format
      setResult({
        totalScore: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        breakdown: evaluation.breakdown,
        gaps: evaluation.gaps.map(g => ({
          id: g.id,
          studentId: g.studentId.toString(),
          topicId: g.topicId,
          weaknessScore: g.weaknessScore,
          detectedAt: g.detectedAt,
        })),
        recommendations: evaluation.recommendations.map(r => ({
          id: r.id,
          topicId: r.topicId,
          url: r.url,
          description: r.description,
          type: r.type as any,
        })),
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) return <ResultView result={result} onReset={() => navigate('/dashboard')} />;

  const currentQ = topicQuestions[currentIdx];
  const progress = ((currentIdx + 1) / topicQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100 mb-4 inline-block">Diagnostic Probe</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">{topic.name}</h2>
          </div>
          <div className="text-right">
             <div className="text-gray-400 font-black text-xs uppercase mb-2 tracking-widest">Stage {currentIdx + 1} of {topicQuestions.length}</div>
             <div className="flex gap-2 justify-end">
               {topicQuestions.map((_, i) => (
                 <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i <= currentIdx ? 'bg-blue-600 w-8' : 'bg-gray-200 w-3'}`}></div>
               ))}
             </div>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner border border-white">
          <div className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(37,99,235,0.4)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border border-gray-100 relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-full -mr-32 -mt-32"></div>
        
        <div className="mb-12 relative">
          <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.2em] mb-8 inline-block border-2 ${
            currentQ.difficulty === Difficulty.EASY ? 'bg-green-50 text-green-700 border-green-100' : 
            currentQ.difficulty === Difficulty.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
            'bg-red-50 text-red-700 border-red-100'
          }`}>
            <i className="fas fa-shield mr-2"></i> {currentQ.difficulty} Level Probe
          </span>
          <p className="text-3xl font-black text-gray-900 leading-snug tracking-tighter">{currentQ.content}</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {['A', 'B', 'C', 'D'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className={`w-full text-left p-8 rounded-[2rem] border-2 transition-all group flex items-center gap-6 ${
                answers[currentQ.id] === opt 
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xl shadow-blue-500/10' 
                : 'border-gray-50 hover:border-blue-200 bg-gray-50/20 hover:bg-white'
              }`}
            >
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${
                answers[currentQ.id] === opt ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-gray-100 text-gray-300 group-hover:border-blue-200 group-hover:text-blue-600'
              }`}>
                {opt}
              </span>
              <span className="font-bold text-xl tracking-tight">{(currentQ as any)[`option${opt}`]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center gap-8">
        <button 
          onClick={prev} 
          disabled={currentIdx === 0}
          className="px-12 py-6 rounded-[2rem] font-black text-gray-400 hover:text-gray-900 hover:bg-white transition-all disabled:opacity-20 flex items-center gap-3"
        >
          <i className="fas fa-chevron-left"></i> Previous Stage
        </button>
        {currentIdx === topicQuestions.length - 1 ? (
          <button 
            onClick={submit}
            disabled={Object.keys(answers).length < topicQuestions.length || submitting}
            className="flex-grow bg-green-600 text-white px-16 py-6 rounded-[2rem] font-black text-2xl hover:bg-green-700 shadow-2xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? 'Analyzing...' : 'Finalize Intelligence Review'}
          </button>
        ) : (
          <button 
            onClick={next}
            className="flex-grow bg-blue-600 text-white px-16 py-6 rounded-[2rem] font-black text-2xl hover:bg-blue-700 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            Next Probe <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default AssessmentView;
