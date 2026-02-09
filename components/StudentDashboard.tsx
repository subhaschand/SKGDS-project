
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { COURSES, TOPICS } from '../services/mockData';
import { coursesAPI, topicsAPI, assignmentsAPI } from '../services/api';
import { AuthContext } from '../App';
import { GoogleGenAI } from "@google/genai";
import { Course, Topic } from '../types';

// Analytics Data
const PERFORMANCE_TREND = [
  { month: 'Jan', score: 45 },
  { month: 'Feb', score: 52 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 61 },
  { month: 'May', score: 75 },
  { month: 'Jun', score: 82 },
];

const KNOWLEDGE_FOOTPRINT = [
  { subject: 'Algorithms', value: 85, full: 100 },
  { subject: 'Data Structures', value: 70, full: 100 },
  { subject: 'SQL Logic', value: 45, full: 100 },
  { subject: 'System Design', value: 90, full: 100 },
  { subject: 'OS Concepts', value: 65, full: 100 },
];

const StudentDashboard: React.FC = () => {
  const { user, assignments } = useContext(AuthContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [topics, setTopics] = useState<Topic[]>(TOPICS);
  
  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, topicsData] = await Promise.all([
          coursesAPI.getAll(),
          topicsAPI.getAll(),
        ]);
        
        setCourses(coursesData.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          code: c.code,
          facultyId: c.facultyId,
        })));
        
        setTopics(topicsData.map(t => ({
          id: t.id,
          name: t.name,
          courseId: t.courseId,
        })));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Keep mock data as fallback
      }
    };
    
    fetchData();
  }, []);
  
  // Persistence logic ensures these are fetched from global state
  const myAssignments = assignments.filter(a => a.studentId === user?.id && a.status === 'PENDING');

  const handleExploreRoadmap = async () => {
    setIsGenerating(true);
    setShowRoadmap(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As an expert AI Academic Coach, generate a high-impact learning roadmap for a student named ${user?.fullName}.
        Current Status:
        - Overall Proficiency: 72%
        - Primary Knowledge Gap: SQL Normalization (1NF, 2NF, 3NF, BCNF)
        - Target Mastery: 100%
        
        Generate a 5-step sequential roadmap. For each step, provide:
        1. A bold Title
        2. Key concepts to focus on
        3. A practical mini-project or exercise
        4. Estimated study time
        
        Format the output clearly with headers and bullet points. Keep it professional, encouraging, and highly technical.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are the SKGDP AI Architect. You provide clear, concise, and technically rigorous learning roadmaps for Computer Science students.",
          temperature: 0.7,
        },
      });

      setRoadmap(response.text || "Failed to generate roadmap. Please try again.");
    } catch (error) {
      console.error("AI Generation Error:", error);
      setRoadmap("Our AI systems are currently recalibrating. Please try again in a moment.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* PREMIUM HERO SECTION */}
      <header className="relative bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-blue-500/5 border border-blue-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-none mb-6">
              Welcome back, <br /><span className="text-blue-600">{user?.fullName.split(' ')[0]}</span>.
            </h1>
            <p className="text-gray-500 text-xl font-medium max-w-lg leading-relaxed">
              Your overall proficiency is at <span className="text-blue-600 font-black">72%</span>. <br />
              Close <span className="text-orange-600 font-black">4 identified gaps</span> to reach mastery.
            </p>
            <div className="flex gap-4 mt-10 justify-center md:justify-start">
              <div className="bg-blue-600 text-white px-8 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-200">
                CS Undergraduate
              </div>
              <div className="bg-gray-100 text-gray-500 px-8 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
                Year 3 Student
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 shrink-0">
             <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 text-center min-w-[140px] shadow-sm">
                <div className="text-4xl font-black text-gray-900 mb-1">12</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagnostics</div>
             </div>
             <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-center min-w-[140px] shadow-2xl shadow-indigo-200">
                <div className="text-4xl font-black text-white mb-1">04</div>
                <div className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Active Gaps</div>
             </div>
          </div>
        </div>
      </header>

      {/* PERFORMANCE ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RADAR: KNOWLEDGE FOOTPRINT */}
        <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <i className="fas fa-microchip text-xl"></i>
            </div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Competency</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={KNOWLEDGE_FOOTPRINT}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} />
                <Radar
                  name="Proficiency"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 text-center text-sm font-bold text-gray-400">
            Peak performance in <span className="text-indigo-600">System Design</span>
          </div>
        </div>

        {/* AREA: LEARNING TREND */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">Performance Trend</h3>
            </div>
            <div className="text-xs font-black text-gray-400 uppercase bg-gray-50 px-6 py-2 rounded-xl border border-gray-100">H1 2024</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: '700' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '20px' }}
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ASSIGNED BY FACULTY */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-paper-plane"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Assigned Assessments</h2>
          <div className="flex-grow h-px bg-gray-100 ml-4"></div>
          {myAssignments.length === 0 && <span className="text-sm font-bold text-gray-300">No pending assignments</span>}
        </div>

        {myAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myAssignments.map(assign => {
              const topic = topics.find(t => t.id === assign.topicId);
              return (
                <div key={assign.id} className="bg-white border-2 border-orange-100 rounded-[3rem] p-12 shadow-2xl shadow-orange-500/5 relative overflow-hidden group hover:border-orange-500 transition-all duration-500">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.03] transform group-hover:scale-110 transition-transform">
                      <i className="fas fa-shield-halved text-9xl text-orange-600"></i>
                   </div>
                   <div className="flex items-center gap-3 mb-6">
                     <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                     <div className="text-orange-600 font-black text-xs uppercase tracking-[0.25em]">Priority Deployment</div>
                   </div>
                   <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter leading-tight">{topic?.name}</h3>
                   <p className="text-gray-400 text-sm font-bold mb-12">Assigned by Faculty on {new Date(assign.assignedAt).toLocaleDateString()}</p>
                   <Link 
                    to={`/assessment/${topic?.id}`}
                    className="block w-full text-center bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
                  >
                    Start Diagnostics
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[3rem] py-20 text-center">
             <i className="fas fa-inbox text-5xl text-gray-200 mb-4 block"></i>
             <p className="text-gray-400 font-bold">You are currently up to date with all faculty assignments.</p>
          </div>
        )}
      </section>

      {/* ROADMAP CALLOUT WITH AI INTEGRATION */}
      <div className="bg-indigo-900 p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full -mr-64 -mt-64 blur-[120px] group-hover:bg-blue-600/30 transition-all duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-grow">
            <h2 className="text-5xl font-black text-white mb-8 leading-tight tracking-tighter">Your AI Roadmap is <br /><span className="text-blue-400">Ready for Launch.</span></h2>
            <p className="text-indigo-100/70 font-medium text-xl leading-relaxed max-w-xl mb-12">
              Our analyzer detected "SQL Normalization" as a critical deficiency. Master this topic to improve overall proficiency by 12%.
            </p>
            <button 
              onClick={handleExploreRoadmap}
              className="bg-white text-indigo-900 px-12 py-5 rounded-3xl font-black text-xl hover:bg-blue-50 transition-all shadow-2xl shadow-indigo-950/20 active:scale-95 flex items-center gap-4"
            >
              <i className="fas fa-rocket text-indigo-400"></i>
              Explore AI Roadmap
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full lg:w-auto">
             {[
               { label: 'Proficiency', value: '72%', color: 'text-blue-400' },
               { label: 'Active Gaps', value: '04', color: 'text-orange-400' },
               { label: 'Class Rank', value: '#12', color: 'text-green-400' },
               { label: 'Learning Velocity', value: '8.4', color: 'text-yellow-400' }
             ].map((stat, i) => (
               <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-colors">
                 <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 opacity-60">{stat.label}</div>
                 <div className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* AI ROADMAP MODAL */}
      {showRoadmap && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl" onClick={() => setShowRoadmap(false)}></div>
          <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border border-indigo-100">
            <div className="p-10 md:p-14 border-b shrink-0 flex justify-between items-center bg-indigo-50/50">
              <div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">AI Learning Roadmap</h2>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mt-1">Personalized Path for {user?.fullName}</p>
              </div>
              <button 
                onClick={() => setShowRoadmap(false)}
                className="w-16 h-16 rounded-[2rem] bg-white border-2 border-indigo-100 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-10 md:p-16 custom-scrollbar bg-white">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                  <div className="relative">
                    <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <i className="fas fa-brain text-4xl animate-bounce"></i>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900">Architecting your path...</h3>
                    <p className="text-gray-400 font-bold mt-2">Gemini is analyzing your gap data and synthesizing resources.</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-indigo max-w-none">
                  <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2.5rem] mb-12 flex items-start gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                      <i className="fas fa-info-circle text-2xl"></i>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-indigo-900 mb-1 tracking-tight">AI Analysis Complete</h4>
                      <p className="text-indigo-700/70 font-bold text-sm leading-relaxed">This roadmap is specifically tuned to bridge your deficiency in <span className="text-indigo-900">SQL Normalization</span>, aiming to elevate your competency from foundational to expert level.</p>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap font-medium text-gray-700 text-lg leading-relaxed">
                    {roadmap}
                  </div>
                </div>
              )}
            </div>

            {!isGenerating && (
              <div className="p-10 bg-gray-50 shrink-0 flex gap-6">
                <button 
                  onClick={() => setShowRoadmap(false)}
                  className="flex-grow bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Confirm & Start Roadmap
                </button>
                <button 
                  onClick={() => handleExploreRoadmap()}
                  className="px-12 py-6 rounded-[2rem] bg-white border-2 border-indigo-100 text-indigo-600 font-black text-lg hover:bg-indigo-50 transition-all"
                >
                  <i className="fas fa-sync-alt mr-2"></i> Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRACTICE LIBRARY */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-book-open"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Practice Repositories</h2>
          <div className="flex-grow h-px bg-gray-100 ml-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white border-2 border-gray-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="px-5 py-2 bg-gray-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-gray-100">{course.code}</div>
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                    <i className="fas fa-database text-2xl"></i>
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-800 tracking-tighter leading-tight">{course.title}</h3>
                <p className="text-gray-400 font-medium text-sm mb-12 line-clamp-2 leading-relaxed">{course.description}</p>
                <div className="flex gap-4">
                   <Link 
                    to={`/assessment/${topics.find(t => t.courseId === course.id)?.id}`}
                    className="flex-grow text-center bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg shadow-gray-100"
                  >
                    Open Bank
                  </Link>
                  <button className="w-14 h-14 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                    <i className="fas fa-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
