import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import Layout from './components/Layout';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherSubmissions from './pages/teacher/Submissions';
import TeacherClassrooms from './pages/teacher/Classrooms';
import StudentAssignments from './pages/student/Assignments';
import StudentClassrooms from './pages/student/Classrooms';
import Settings from './pages/shared/Settings';
import EmailTemplates from './pages/admin/EmailTemplates';
import DashboardHome from './components/DashboardHome';

/* ── Login ── */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { session, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if already logged in and role is resolved
  useEffect(() => {
    if (session && role) {
      navigate(`/${role}`);
    }
  }, [session, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // If success, AuthContext's onAuthStateChange will trigger, update session/role, and the useEffect will redirect.
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '0.25rem' }}>blast.</h1>
          <p className="text-sm text-muted">sign in to your secure portal</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label className="label">Email</label>
            <input required className="input" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label className="label">Password</label>
            <input required className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <p style={{ fontSize: '0.8125rem', color: '#DC2626', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Admin stubs ── */
const AdminDashboard: React.FC = () => (
  <DashboardHome role="teacher" name="Admin" stats={[
    { label: 'Total Students', value: 142 },
    { label: 'Active Assignments', value: 7 },
    { label: 'Pending Reviews', value: 23 },
  ]} />
);

const AdminUsers: React.FC = () => (
  <div>
    <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Manage Users</h1>
    <div className="card"><p className="text-muted text-sm">User CRUD — connect Supabase for live data.</p></div>
  </div>
);

const AdminInvites: React.FC = () => {
  const [emails, setEmails] = React.useState('');
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Send Invites</h1>
        <button className="btn btn-primary">Dispatch</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Email Template</h3>
          <div className="field"><label className="label">Subject</label><input className="input" placeholder="You've been invited to blast." /></div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="label">Body</label>
            <textarea className="input" style={{ minHeight: '140px' }} defaultValue={`Hello {{name}},\n\nYou've been invited to complete a video assessment.\nLink: {{invite_link}}\n\nGood luck!`} />
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Recipients</h3>
          <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Paste comma- or newline-separated emails.</p>
          <textarea className="input" style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '0.8125rem' }}
            placeholder={'student1@uni.edu\nstudent2@uni.edu'} value={emails} onChange={e => setEmails(e.target.value)} />
          <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>{emails.split(/[\n,]+/).filter(e => e.trim()).length} recipient(s)</p>
        </div>
      </div>
    </div>
  );
};

const TeacherOverview: React.FC = () => (
  <DashboardHome role="teacher" name="Prof. Mehta" stats={[
    { label: 'Classrooms', value: 2 },
    { label: 'Active Assignments', value: 4 },
    { label: 'Pending Reviews', value: 11 },
  ]} />
);

const StudentOverview: React.FC = () => (
  <DashboardHome role="student" name="Priya" stats={[
    { label: 'My Classrooms', value: 2 },
    { label: 'Pending Assignments', value: 3 },
    { label: 'Quizzes Due', value: 1 },
  ]} />
);

/* ── Router ── */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<Layout />}>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/invites" element={<AdminInvites />} />
              <Route path="/admin/templates" element={<EmailTemplates />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>

            {/* Teacher Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
              <Route path="/teacher" element={<TeacherOverview />} />
              <Route path="/teacher/classrooms" element={<TeacherClassrooms role="teacher" />} />
              <Route path="/teacher/assignments" element={<TeacherAssignments />} />
              <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
              <Route path="/teacher/settings" element={<Settings />} />
            </Route>

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentOverview />} />
              <Route path="/student/classrooms" element={<StudentClassrooms />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/settings" element={<Settings />} />
            </Route>

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
