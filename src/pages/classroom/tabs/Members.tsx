import React from 'react';
import { UserCircle } from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';

const MEMBERS = [
    { name: 'Priya Menon', email: 'priya@university.in', role: 'student' },
    { name: 'Arjun Kapoor', email: 'arjun@university.in', role: 'student' },
    { name: 'Sneha Reddy', email: 'sneha@university.in', role: 'student' },
    { name: 'Rohan Sharma', email: 'rohan@university.in', role: 'student' },
    { name: 'Anjali Verma', email: 'anjali@university.in', role: 'student' },
];

const ClassroomMembers: React.FC<{ classroom: Classroom; role: string }> = ({ classroom }) => (
    <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="flex items-center gap-3" style={{ padding: '0.25rem 0' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>T</div>
                <div>
                    <p style={{ fontWeight: 600 }}>Prof. Mehta</p>
                    <p className="text-sm text-muted">Teacher · mehta@university.in</p>
                </div>
                <span className="badge badge-yellow" style={{ marginLeft: 'auto' }}>Teacher</span>
            </div>
        </div>

        <p className="label" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>STUDENTS ({classroom.students})</p>

        <div className="flex-col gap-2">
            {MEMBERS.map(m => (
                <div key={m.email} className="card" style={{ padding: '0.875rem 1.25rem' }}>
                    <div className="flex items-center gap-3">
                        <UserCircle size={32} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 500 }}>{m.name}</p>
                            <p className="text-sm text-muted">{m.email}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default ClassroomMembers;
