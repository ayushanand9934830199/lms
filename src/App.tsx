import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('admin');
  const dest = { admin: '/admin', teacher: '/teacher', student: '/student' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 420, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '0.25rem' }}>blast.</h1>
          <p className="text-sm text-muted">sign in to your portal</p>
        </div>
        <div className="field"><label className="label">Email</label><input className="input" type="email" placeholder="you@university.edu" /></div>
        <div className="field" style={{ marginBottom: '1.5rem' }}><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" /></div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['admin', 'teacher', 'student'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '0.375rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', background: role === r ? 'var(--accent)' : '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>{r}</button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} onClick={() => navigate(dest[role])}>Sign In</button>
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/invites" element={<AdminInvites />} />
          <Route path="/admin/templates" element={<EmailTemplates />} />
          <Route path="/admin/settings" element={<Settings />} />

          {/* Teacher */}
          <Route path="/teacher" element={<TeacherOverview />} />
          <Route path="/teacher/classrooms" element={<TeacherClassrooms role="teacher" />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
          <Route path="/teacher/settings" element={<Settings />} />

          {/* Student */}
          <Route path="/student" element={<StudentOverview />} />
          <Route path="/student/classrooms" element={<StudentClassrooms />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
