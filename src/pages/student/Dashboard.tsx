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
    const [chartData, setChartData] = useState([{ label: '-', value: 0 }]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!user) return;
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            const [
                { count: classesCount },
                { count: pendingCount },
                { count: quizzesCount },
                { data: recentSubms }
            ] = await Promise.all([
                supabase.from('classroom_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('student_id', user.id).eq('status', 'pending'),
                supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('is_published', true),
                supabase.from('submissions').select('created_at').eq('student_id', user.id).eq('status', 'completed').gte('created_at', sevenDaysAgo)
            ]);

            setStats([
                { label: 'Enrolled Classrooms', value: classesCount || 0 },
                { label: 'Pending Assignments', value: pendingCount || 0 },
                { label: 'Quizzes Available', value: quizzesCount || 0 },
            ]);

            const weekAgg = [0, 0, 0, 0, 0, 0, 0];
            recentSubms?.forEach(s => {
                const d = new Date(s.created_at).getDay();
                weekAgg[d]++;
            });

            setChartData([
                { label: 'Mon', value: weekAgg[1] },
                { label: 'Tue', value: weekAgg[2] },
                { label: 'Wed', value: weekAgg[3] },
                { label: 'Thu', value: weekAgg[4] },
                { label: 'Fri', value: weekAgg[5] },
                { label: 'Sat', value: weekAgg[6] },
                { label: 'Sun', value: weekAgg[0] },
            ]);

            setLoading(false);
        };
        fetchMetrics();
    }, [user]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating metrics...</div>;

    return (
        <DashboardHome
            role="student"
            name={user?.user_metadata?.first_name || user?.user_metadata?.full_name || 'Student'}
            stats={stats}
            chartData={chartData}
        />
    );
};

export default StudentDashboard;
