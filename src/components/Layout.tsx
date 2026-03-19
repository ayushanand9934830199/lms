import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Video, Mail, Users, Settings, LogOut, BookOpen, School } from 'lucide-react';
import { AppWidgetProvider } from '../context/AppWidgetContext';
import PomodoroWidget from './PomodoroWidget';
import YouTubeWidget from './YouTubeWidget';

const Layout: React.FC = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const isTeacher = location.pathname.startsWith('/teacher');
    const isStudent = !isAdmin && !isTeacher;
    const role = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student';

    // Home pages — widgets shown inline there, not as floating pills
    const isHome = location.pathname === '/teacher' ||
        location.pathname === '/student' ||
        location.pathname === '/admin';

    return (
        <AppWidgetProvider>
            <div className="app-shell">
                {/* ── Horizontal Topnav ── */}
                <nav className="topnav">
                    {/* Brand */}
                    <div className="topnav-brand">
                        <div className="topnav-brand-icon"><Video size={17} /></div>
                        <h1>blast.</h1>
                    </div>

                    {/* Role Links */}
                    <div className="topnav-links">
                        {isAdmin && (
                            <>
                                <NavLink to="/admin" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <LayoutDashboard size={15} /> Dashboard
                                </NavLink>
                                <NavLink to="/admin/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <Users size={15} /> Users
                                </NavLink>
                                <NavLink to="/admin/invites" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <Mail size={15} /> Invites
                                </NavLink>
                            </>
                        )}

                        {isTeacher && (
                            <>
                                <NavLink to="/teacher" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <LayoutDashboard size={15} /> Overview
                                </NavLink>
                                <NavLink to="/teacher/classrooms" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <School size={15} /> Classrooms
                                </NavLink>
                                <NavLink to="/teacher/assignments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <BookOpen size={15} /> Assignments
                                </NavLink>
                                <NavLink to="/teacher/submissions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <Video size={15} /> Submissions
                                </NavLink>
                            </>
                        )}

                        {isStudent && (
                            <>
                                <NavLink to="/student" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <LayoutDashboard size={15} /> Home
                                </NavLink>
                                <NavLink to="/student/classrooms" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <School size={15} /> Classrooms
                                </NavLink>
                                <NavLink to="/student/assignments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                                    <Video size={15} /> Video Assignments
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* Right: Settings + Avatar */}
                    <div className="topnav-right">
                        <NavLink to={`/${role}/settings`} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} style={{ padding: '0.4rem 0.7rem' }}>
                            <Settings size={15} /> Settings
                        </NavLink>
                        <div className="avatar" title="Your account">A</div>
                        <button className="btn btn-ghost" style={{ border: 'none', padding: '0.4rem' }}
                            onClick={() => window.location.href = '/'} title="Sign Out">
                            <LogOut size={16} />
                        </button>
                    </div>
                </nav>

                {/* ── Page Content ── */}
                <div className="main">
                    <div className="page">
                        <Outlet />
                    </div>
                </div>

                {/* ── Persistent floating widgets — hidden on home (they appear inline there) ── */}
                {!isHome && <YouTubeWidget />}
                {!isHome && <PomodoroWidget />}
            </div>
        </AppWidgetProvider>
    );
};

export default Layout;
