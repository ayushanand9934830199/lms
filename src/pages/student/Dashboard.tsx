import React, { useEffect, useState } from 'react';
import DashboardHome from '../../components/DashboardHome';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { label: 'Enrolled Classes', value: 0 },
        { label: 'Pending Assignments', value: 0 },
        { label: 'Quizzes Due', value: 0 },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!user) return;
            const [
                { count: classesCount },
                { count: pendingCount },
                { count: quizzesCount }
            ] = await Promise.all([
                supabase.from('classroom_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'pending'),
                // Approximating active quizzes for now until full quizzes implementation
                supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('is_published', true)
            ]);

            setStats([
                { label: 'Enrolled Classrooms', value: classesCount || 0 },
                { label: 'Pending Assignments', value: pendingCount || 0 },
                { label: 'Quizzes Available', value: quizzesCount || 0 },
            ]);
            setLoading(false);
        };
        fetchMetrics();
    }, [user]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating metrics...</div>;

    return (
        <DashboardHome
            role="student"
            name={user?.user_metadata?.first_name || 'Student'}
            stats={stats}
        />
    );
};

export default StudentDashboard;
