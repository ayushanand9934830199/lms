import React, { useEffect, useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import ClassroomDetail from '../../components/ClassroomDetail';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { type Classroom } from '../teacher/Classrooms';

const StudentClassrooms: React.FC = () => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    const [selected, setSelected] = useState<Classroom | null>(null);
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    const fetchClassrooms = async () => {
        if (!user) return;


        // Find classrooms where the student is a member
        const { data, error } = await supabase
            .from('classroom_members')
            .select(`
                classrooms!inner (
                    id, name, section, code,
                    profiles!classrooms_teacher_id_fkey(full_name),
                    classroom_members(id)
                )
            `)
            .eq('user_id', user.id);

        if (!error && data) {
            const parsed = data.map((item: any) => {
                const c = item.classrooms;
                return {
                    id: c.id,
                    name: c.name,
                    section: c.section || '',
                    code: c.code,
                    students: c.classroom_members?.length || 0,
                    teacher: c.profiles?.full_name || 'Professor'
                };
            });
            setClassrooms(parsed);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [user]);

    const handleJoin = async () => {
        if (joinCode.length !== 6 || !user) return;
        setIsJoining(true);
        setJoinError('');

        // Find the classroom by code
        const { data: targetClass, error: findErr } = await supabase
            .from('classrooms')
            .select('id')
            .eq('code', joinCode)
            .maybeSingle();

        if (findErr || !targetClass) {
            setJoinError('Invalid Class Code');
            setIsJoining(false);
            setTimeout(() => setJoinError(''), 3000);
            return;
        }

        // Add the student
        const { error: joinErr } = await supabase.from('classroom_members').insert({
            classroom_id: targetClass.id,
            user_id: user.id,
            role: 'student'
        });

        if (joinErr) {
            setJoinError('You are already enrolled, or an error occurred.');
            setIsJoining(false);
            setTimeout(() => setJoinError(''), 3000);
            return;
        }

        setJoinCode('');
        fetchClassrooms();
        setIsJoining(false);
    };

    if (selected) return <ClassroomDetail classroom={selected} role="student" onBack={() => setSelected(null)} />;

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '2rem' }}>My Classrooms</h1>
                <div className="flex gap-2 items-center">
                    {joinError && <span style={{ color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600 }}>{joinError}</span>}
                    <input className="input" style={{ width: 160, padding: '0.5rem 0.75rem' }} placeholder="Class code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} disabled={isJoining} />
                    <button className="btn btn-primary" onClick={handleJoin} disabled={isJoining || joinCode.length !== 6}>
                        {isJoining ? 'Joining...' : 'Join'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                {classrooms.map((c: Classroom) => (
                    <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                            <div style={{ width: 42, height: 42, background: 'var(--accent)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem' }}>{c.name[0]}</div>
                            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{c.name}</h4>
                        <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{c.section} · {c.teacher}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            <Users size={13} /> {c.students} classmates
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentClassrooms;
