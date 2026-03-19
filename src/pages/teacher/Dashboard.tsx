import React, { useEffect, useState } from 'react';
import DashboardHome from '../../components/DashboardHome';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { label: 'My Classrooms', value: 0 },
        { label: 'Active Assignments', value: 0 },
        { label: 'Pending Reviews', value: 0 },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!user) return;
            const [
                { count: classesCount },
                { count: assignCount },
                { count: reviewCount }
            ] = await Promise.all([
                supabase.from('classrooms').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
                supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
                supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted')
            ]);

            setStats([
                { label: 'My Classrooms', value: classesCount || 0 },
                { label: 'Published Assignments', value: assignCount || 0 },
                { label: 'Submissions to Review', value: reviewCount || 0 },
            ]);
            setLoading(false);
        };
        fetchMetrics();
    }, [user]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating metrics...</div>;

    return (
        <DashboardHome
            role="teacher"
            name={user?.user_metadata?.first_name || 'Professor'}
            stats={stats}
        />
    );
};

export default TeacherDashboard;
