import React, { useState } from 'react';
import { Rss, BookOpen, FileText, HelpCircle, Users } from 'lucide-react';
import ClassroomStream from '../pages/classroom/tabs/Stream';
import ClassroomMaterials from '../pages/classroom/tabs/Materials';
import ClassroomAssignments from '../pages/classroom/tabs/Assignments';
import ClassroomQuizzes from '../pages/classroom/tabs/Quizzes';
import ClassroomMembers from '../pages/classroom/tabs/Members';

export interface Classroom {
    id: string;
    name: string;
    section: string;
    code: string;
    students: number;
    teacher: string;
}

interface Props {
    classroom: Classroom;
    role: 'teacher' | 'student';
    onBack: () => void;
}

type Tab = 'stream' | 'materials' | 'assignments' | 'quizzes' | 'members';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'stream', label: 'Stream', icon: Rss },
    { key: 'materials', label: 'Materials', icon: BookOpen },
    { key: 'assignments', label: 'Assignments', icon: FileText },
    { key: 'quizzes', label: 'Quizzes', icon: HelpCircle },
    { key: 'members', label: 'Members', icon: Users },
];

const ClassroomDetail: React.FC<Props> = ({ classroom, role, onBack }) => {
    const [tab, setTab] = useState<Tab>('stream');

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <button className="btn btn-ghost" style={{ padding: '0.25rem 0', marginBottom: '0.75rem' }} onClick={onBack}>
                    ← Classrooms
                </button>

                {/* Classroom banner */}
                <div style={{
                    background: 'var(--accent)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{classroom.name}</h1>
                        <p style={{ fontWeight: 500, opacity: 0.75 }}>{classroom.section}</p>
                    </div>
                    <div className="code-box" style={{ background: 'rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.2)', color: '#000', minWidth: '110px', textAlign: 'center' }}>
                        {classroom.code}
                    </div>
                </div>

                {/* Tab bar */}
                <div className="tab-bar">
                    {TABS.map(t => (
                        <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
                            <t.icon size={14} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {tab === 'stream' && <ClassroomStream classroom={classroom} role={role} />}
            {tab === 'materials' && <ClassroomMaterials classroom={classroom} role={role} />}
            {tab === 'assignments' && <ClassroomAssignments classroom={classroom} role={role} />}
            {tab === 'quizzes' && <ClassroomQuizzes classroom={classroom} role={role} />}
            {tab === 'members' && <ClassroomMembers classroom={classroom} role={role} />}
        </div>
    );
};

export default ClassroomDetail;
