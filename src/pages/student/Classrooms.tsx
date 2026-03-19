import React, { useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import ClassroomDetail, { type Classroom } from '../../components/ClassroomDetail';

const JOINED: Classroom[] = [
    { id: '1', name: 'Economics Batch A', section: '2026', code: 'ECN4X2', students: 22, teacher: 'Prof. Mehta' },
    { id: '2', name: 'Policy Workshop', section: 'Elective', code: 'PLY9K1', students: 14, teacher: 'Prof. Mehta' },
];

const StudentClassrooms: React.FC = () => {
    const [selected, setSelected] = useState<Classroom | null>(null);
    const [joinCode, setJoinCode] = useState('');

    if (selected) return <ClassroomDetail classroom={selected} role="student" onBack={() => setSelected(null)} />;

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '2rem' }}>My Classrooms</h1>
                <div className="flex gap-2">
                    <input className="input" style={{ width: 160, padding: '0.5rem 0.75rem' }} placeholder="Class code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
                    <button className="btn btn-primary" onClick={() => { if (joinCode.length === 6) alert(`Joining ${joinCode}…`); }}>Join</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                {JOINED.map(c => (
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
