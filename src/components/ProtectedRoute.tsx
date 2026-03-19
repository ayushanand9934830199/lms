import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ allowedRoles?: Array<'admin' | 'teacher' | 'student'> }> = ({ allowedRoles }) => {
    const { session, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Inter,sans-serif', color: 'var(--text-muted)' }}>Verifying credentials...</p>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Fallback redirects
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'teacher') return <Navigate to="/teacher" replace />;
        return <Navigate to="/student" replace />;
    }

    return <Outlet />;
};
