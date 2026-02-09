
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User, UserRole, Assignment } from './types';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import AssessmentView from './components/AssessmentView';
import FacultyDashboard from './components/FacultyDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  assignments: Assignment[];
  assignTest: (topicId: number, studentIds: string[]) => void;
  completeAssignment: (topicId: number) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  assignments: [],
  assignTest: () => {},
  completeAssignment: () => {}
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('skgdp_current_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('skgdp_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('skgdp_assignments', JSON.stringify(assignments));
  }, [assignments]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('skgdp_current_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skgdp_current_session');
  };

  const assignTest = (topicId: number, studentIds: string[]) => {
    const newAssignments: Assignment[] = studentIds.map(sid => ({
      id: Date.now() + Math.random(),
      topicId,
      studentId: sid,
      assignedBy: user?.id || '0',
      assignedAt: new Date().toISOString(),
      status: 'PENDING'
    }));
    setAssignments(prev => [...prev, ...newAssignments]);
  };

  const completeAssignment = (topicId: number) => {
    setAssignments(prev => prev.map(a => 
      (a.topicId === topicId && a.studentId === user?.id) 
      ? { ...a, status: 'COMPLETED' } 
      : a
    ));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, assignments, assignTest, completeAssignment }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50/50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  {user?.role === UserRole.STUDENT && <StudentDashboard />}
                  {user?.role === UserRole.FACULTY && <FacultyDashboard />}
                  {user?.role === UserRole.ADMIN && <AdminDashboard />}
                </ProtectedRoute>
              } />
              <Route path="/assessment/:topicId" element={
                <ProtectedRoute>
                  <AssessmentView />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            &copy; 2024 SKGDP • Knowledge Intelligence Platform
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

const Home = () => (
  <div className="max-w-4xl mx-auto text-center py-24">
    <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
      Adaptive Learning AI
    </div>
    <h1 className="text-7xl font-black text-gray-900 mb-8 tracking-tighter leading-tight">
      Bridge your <span className="text-blue-600">Knowledge Gaps</span>.
    </h1>
    <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
      Identify weak topics instantly with intelligent diagnostics. 
      Master concepts through personalized remedial pathways.
    </p>
    <div className="flex justify-center gap-6">
      <Link to="/login" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 active:scale-95">
        Launch Platform
      </Link>
      <button className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-4 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all">
        View Demo
      </button>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default App;
