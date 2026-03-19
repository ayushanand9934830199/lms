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
    const [chartData, setChartData] = useState([{ label: '-', value: 0 }]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!user) return;
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            const [
                { count: classesCount },
                { count: assignCount },
                { count: reviewCount },
                { data: recentSubms }
            ] = await Promise.all([
                supabase.from('classrooms').select('id', { count: 'exact', head: true }).eq('teacher_id', user.id),
                supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
                supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
                supabase.from('submissions').select('created_at, assignments!inner(created_by)').eq('assignments.created_by', user.id).gte('created_at', sevenDaysAgo)
            ]);

            setStats([
                { label: 'My Classrooms', value: classesCount || 0 },
                { label: 'Published Assignments', value: assignCount || 0 },
                { label: 'Submissions to Review', value: reviewCount || 0 },
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
            role="teacher"
            name={user?.user_metadata?.first_name || user?.user_metadata?.full_name || 'Professor'}
            stats={stats}
            chartData={chartData}
        />
    );
};

export default TeacherDashboard;
