import React, { useState, useEffect } from 'react';
import { assessmentAPI, AssessmentAttemptResponse } from '../services/api';
import { Course, Topic } from '../types';
import { COURSES, TOPICS } from '../services/mockData';
import { AssessmentFlowchartView } from './FlowchartComponents';

interface ResultRow {
  studentName: string;
  studentId: string;
  courseName: string;
  courseCode: string;
  courseId: string;
  score: number;
  submissionDate: string;
  avatar: string;
}

const AssessmentResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [topics, setTopics] = useState<Topic[]>(TOPICS);
  const [filterStudent, setFilterStudent] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [studentNames, setStudentNames] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [viewMode, setViewMode] = useState<'table' | 'flowchart'>('table');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const assessments = await assessmentAPI.getAll();
        
        const mappedResults: ResultRow[] = assessments.map((a: AssessmentAttemptResponse) => ({
          studentName: a.studentName || 'Unknown',
          studentId: a.studentId || '',
          courseName: a.courseName || 'Unknown Course',
          courseCode: a.courseCode || '',
          courseId: a.courseId || '',
          score: Math.round(a.score || 0),
          submissionDate: a.submissionDate ? new Date(a.submissionDate).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A',
          avatar: a.studentName ? a.studentName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
        }));

        // Extract unique student names
        const uniqueStudents = new Set(mappedResults.map(r => r.studentName));
        setStudentNames(uniqueStudents);

        setResults(mappedResults);
      } catch (error) {
        console.error('Failed to fetch assessment results:', error);
        // Use mock data
        setResults([
          {
            studentName: 'subashchandra',
            studentId: '10',
            courseName: 'Data Structures & Algorithms',
            courseCode: 'CS201',
            courseId: '1',
            score: 30,
            submissionDate: 'Mar 9, 2026, 10:59 AM',
            avatar: 'S'
          },
          {
            studentName: 'subashchandra',
            studentId: '10',
            courseName: 'Data Structures & Algorithms',
            courseCode: 'CS201',
            courseId: '1',
            score: 0,
            submissionDate: 'Mar 9, 2026, 09:50 AM',
            avatar: 'S'
          },
          {
            studentName: 'subashchandra',
            studentId: '10',
            courseName: 'Data Structures & Algorithms',
            courseCode: 'CS201',
            courseId: '1',
            score: 67,
            submissionDate: 'Mar 9, 2026, 09:49 AM',
            avatar: 'S'
          },
          {
            studentName: 'subashchandra',
            studentId: '10',
            courseName: 'Data Structures & Algorithms',
            courseCode: 'CS201',
            courseId: '1',
            score: 50,
            submissionDate: 'Mar 8, 2026, 09:54 PM',
            avatar: 'S'
          },
          {
            studentName: 'Mahesh',
            studentId: '11',
            courseName: 'Database Management Systems',
            courseCode: 'CS301',
            courseId: '2',
            score: 100,
            submissionDate: 'Mar 8, 2026, 09:05 PM',
            avatar: 'M'
          },
          {
            studentName: 'Mahesh',
            studentId: '11',
            courseName: 'Data Structures & Algorithms',
            courseCode: 'CS201',
            courseId: '1',
            score: 33,
            submissionDate: 'Mar 8, 2026, 09:04 PM',
            avatar: 'M'
          },
          {
            studentName: 'subashchandra',
            studentId: '10',
            courseName: 'Data Structures & Algorithms',
            courseCode: 'CS201',
            courseId: '1',
            score: 33,
            submissionDate: 'Mar 8, 2026, 08:19 PM',
            avatar: 'S'
          },
        ]);
        setStudentNames(new Set(['subashchandra', 'Mahesh']));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Filter and sort results
  let filteredResults = results;
  if (filterStudent) {
    filteredResults = filteredResults.filter(r => r.studentName === filterStudent);
  }
  if (filterCourse) {
    filteredResults = filteredResults.filter(r => r.courseId === filterCourse);
  }

  if (sortBy === 'score') {
    filteredResults = [...filteredResults].sort((a, b) => b.score - a.score);
  } else {
    filteredResults = [...filteredResults].sort((a, b) => 
      new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 drop-shadow-lg"></div>
          <p className="text-gray-600 font-semibold text-lg animate-pulse">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Animated Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-down">
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <i className="fas fa-chart-bar text-lg animate-bounce-slow"></i>
            </div>
            <h1 className="text-4xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Knowledge Repository Results</h1>
          </div>
          <p className="text-gray-500 font-medium text-lg animate-fade-in" style={{ animationDelay: '200ms' }}>{results.length} Submissions</p>
               {/* View Mode Toggle */}
               <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '120ms' }}>
                 <button
                   onClick={() => setViewMode('table')}
                   className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg ${
                     viewMode === 'table'
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                   }`}
                 >
                   <i className="fas fa-table"></i>
                   Table View
                 </button>
                 <button
                   onClick={() => setViewMode('flowchart')}
                   className={`px-6 py-3 rounded-xl font-black text-sm transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg ${
                     viewMode === 'flowchart'
                       ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                       : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                   }`}
                 >
                   <i className="fas fa-project-diagram"></i>
                   Flowchart View
                 </button>
               </div>
        </div>
      </div>

      {/* Animated Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <label className="block text-sm font-bold text-gray-600 mb-2">Filter by Student</label>
          <select 
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 bg-white hover:shadow-md"
          >
            <option value="">All Students</option>
            {Array.from(studentNames).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <label className="block text-sm font-bold text-gray-600 mb-2">Filter by Course</label>
          <select 
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 bg-white hover:shadow-md"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <label className="block text-sm font-bold text-gray-600 mb-2">Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300 bg-white hover:shadow-md"
          >
            <option value="date">Latest First</option>
            <option value="score">Highest Score</option>
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
          <label className="block text-sm font-bold text-gray-600 mb-2">Results Count</label>
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-blue-700 font-bold hover:shadow-md transition-all duration-300">
            {filteredResults.length} Results
          </div>
        </div>
      </div>

      {/* Animated Results Table */}
      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center animate-fade-in">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-inbox text-6xl mb-4 opacity-30 animate-bounce-slow"></i>
                      <p className="text-gray-400 font-semibold text-lg">No results found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((result, index) => (
                  <tr 
                    key={`${result.studentId}-${result.submissionDate}-${index}`}
                    className="hover:bg-blue-50 transition-all duration-300 animate-fade-in border-b border-gray-100 hover:shadow-md hover:translate-x-1"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:scale-110 transition-transform duration-300 cursor-pointer">
                          {result.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 hover:text-blue-600 transition-colors">{result.studentName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-gray-900">{result.courseName}</div>
                      <div className="text-xs text-gray-500 font-medium">{result.courseCode}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-lg ${getScoreColor(result.score)} transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-1 animate-pop-in`} style={{ animationDelay: `${index * 50 + 100}ms` }}>
                        <span>{result.score.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-gray-600 font-medium">{result.submissionDate}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Animated Stats Summary */}
      {filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-[2rem] border border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="text-blue-600 text-xs font-black uppercase tracking-widest mb-2 animate-fade-in" style={{ animationDelay: '500ms' }}>Average Score</div>
            <div className="text-4xl font-black text-blue-700 mb-2 animate-number-count" style={{ animationDelay: '550ms' }}>
              {(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length).toFixed(1)}%
            </div>
            <div className="text-blue-600 text-sm font-medium">Across {filteredResults.length} attempts</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-[2rem] border border-green-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '450ms' }}>
            <div className="text-green-600 text-xs font-black uppercase tracking-widest mb-2 animate-fade-in" style={{ animationDelay: '550ms' }}>Highest Score</div>
            <div className="text-4xl font-black text-green-700 mb-2 animate-number-count" style={{ animationDelay: '600ms' }}>
              {Math.max(...filteredResults.map(r => r.score)).toFixed(1)}%
            </div>
            <div className="text-green-600 text-sm font-medium">Best performance</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-[2rem] border border-purple-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="text-purple-600 text-xs font-black uppercase tracking-widest mb-2 animate-fade-in" style={{ animationDelay: '600ms' }}>Lowest Score</div>
            <div className="text-4xl font-black text-purple-700 mb-2 animate-number-count" style={{ animationDelay: '650ms' }}>
              {Math.min(...filteredResults.map(r => r.score)).toFixed(1)}%
            </div>
            <div className="text-purple-600 text-sm font-medium">Areas to improve</div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounceSlowly {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes numberCount {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-down {
          animation: slideDown 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slideUp 0.7s ease-out forwards;
          opacity: 0;
        }

        .animate-pop-in {
          animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounceSlowly 3s ease-in-out infinite;
        }

        .animate-number-count {
          animation: numberCount 0.8s ease-out forwards;
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AssessmentResultsPage;

