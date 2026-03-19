import React, { useEffect, useState } from 'react';
import DashboardHome from '../../components/DashboardHome';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState([
        { label: 'Total Users', value: 0 },
        { label: 'Classes', value: 0 },
        { label: 'Assignments', value: 0 },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            const [
                { count: usersCount },
                { count: classesCount },
                { count: assignCount }
            ] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('classrooms').select('id', { count: 'exact', head: true }),
                supabase.from('assignments').select('id', { count: 'exact', head: true })
            ]);

            setStats([
                { label: 'Total Registered Users', value: usersCount || 0 },
                { label: 'Active Classrooms', value: classesCount || 0 },
                { label: 'Published Assignments', value: assignCount || 0 },
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
        />
    );
};

export default AdminDashboard;
