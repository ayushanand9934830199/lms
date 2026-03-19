import React, { useEffect, useState } from 'react';
import DashboardHome from '../../components/DashboardHome';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState([
        { label: 'Total Users', value: 0 },
        { label: 'Classes', value: 0 },
        { label: 'Assignments', value: 0 },
    ]);
    const [chartData, setChartData] = useState([{ label: '-', value: 0 }]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            const [
                { count: usersCount },
                { count: classesCount },
                { count: assignCount },
                { data: recentSubms }
            ] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('classrooms').select('id', { count: 'exact', head: true }),
                supabase.from('assignments').select('id', { count: 'exact', head: true }),
                supabase.from('submissions').select('created_at').gte('created_at', sevenDaysAgo)
            ]);

            setStats([
                { label: 'Total Registered Users', value: usersCount || 0 },
                { label: 'Active Classrooms', value: classesCount || 0 },
                { label: 'Published Assignments', value: assignCount || 0 },
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
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating metrics...</div>;

    return (
        <DashboardHome
            role="teacher"
            name="Admin"
            stats={stats}
            chartData={chartData}
        />
    );
};

export default AdminDashboard;
