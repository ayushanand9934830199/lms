import React, { useEffect, useState } from 'react';
import { Plus, Copy, Link2, Users, ChevronRight, X, Mail } from 'lucide-react';
import ClassroomDetail from '../../components/ClassroomDetail';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

interface Props { role: 'teacher' | 'student'; }

export interface Classroom {
    id: string;
    name: string;
    section: string;
    code: string;
    students: number;
    teacher: string;
}

const Classrooms: React.FC<Props> = ({ role }) => {
    const { user } = useAuth();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);

    const [selected, setSelected] = useState<Classroom | null>(null);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newSec, setNewSec] = useState('');

    const [copied, setCopied] = useState<'code' | 'link' | null>(null);
    const [inviteTarget, setInviteTarget] = useState<Classroom | null>(null);

    const fetchClassrooms = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('classrooms')
            .select(`
                id, name, section, join_code, 
                profiles!classrooms_teacher_id_fkey(full_name),
                classroom_members(id)
            `)
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const parsed = data.map((c: any) => ({
                id: c.id,
                name: c.name,
                section: c.section || '',
                code: c.join_code,
                students: c.classroom_members?.length || 0,
                teacher: c.profiles?.full_name || 'Professor'
            }));
            setClassrooms(parsed);
        }
    };

    useEffect(() => {
        fetchClassrooms();
    }, [user]);

    const create = async () => {
        if (!newName.trim() || !user) return;
        const code = generateCode();

        const { error } = await supabase.from('classrooms').insert({
            name: newName,
            section: newSec,
            join_code: code,
            teacher_id: user.id
        });

        if (!error) {
            setNewName(''); setNewSec('');
            setCreating(false);
            fetchClassrooms();
        }
    };

    const copy = (text: string, type: 'code' | 'link') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    /* ── Classroom Detail ── */
    if (selected) return <ClassroomDetail classroom={selected} role={role} onBack={() => setSelected(null)} />;

    /* ── Invite Popover ── */
    const invLink = inviteTarget ? `${window.location.origin}/join/${inviteTarget.code}` : '';

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Classrooms</h1>
                {role === 'teacher' && (
                    <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> New Classroom</button>
                )}
            </div>

            {/* Create modal */}
            {creating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div className="card" style={{ width: 420, position: 'relative' }}>
                        <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem' }} onClick={() => setCreating(false)}><X size={16} /></button>
                        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Create Classroom</h3>
                        <div className="field"><label className="label">Name *</label><input className="input" placeholder="e.g. Behavioral Economics 2026" value={newName} onChange={e => setNewName(e.target.value)} /></div>
                        <div className="field" style={{ marginBottom: '1.5rem' }}><label className="label">Section (optional)</label><input className="input" placeholder="e.g. Batch A" value={newSec} onChange={e => setNewSec(e.target.value)} /></div>
                        <div className="flex gap-3 justify-end">
                            <button className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={create}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite modal */}
            {inviteTarget && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div className="card" style={{ width: 440, position: 'relative' }}>
                        <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem' }} onClick={() => setInviteTarget(null)}><X size={15} /></button>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Invite to {inviteTarget.name}</h3>
                        <p className="label" style={{ marginBottom: '0.5rem' }}>Class Code</p>
                        <div className="code-box" style={{ marginBottom: '0.75rem' }}>{inviteTarget.code}</div>
                        <button className="btn btn-secondary w-full" style={{ marginBottom: '1rem' }} onClick={() => copy(inviteTarget.code, 'code')}>
                            <Copy size={13} /> {copied === 'code' ? '✓ Copied!' : 'Copy Code'}
                        </button>
                        <p className="label" style={{ marginBottom: '0.5rem' }}>Invite Link</p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', marginBottom: '0.75rem', wordBreak: 'break-all', lineHeight: 1.4 }}>{invLink}</div>
                        <button className="btn btn-primary w-full" style={{ marginBottom: '1rem' }} onClick={() => copy(invLink, 'link')}>
                            <Link2 size={13} /> {copied === 'link' ? '✓ Copied!' : 'Copy Invite Link'}
                        </button>
                        <p className="label" style={{ marginBottom: '0.5rem' }}>Email Invite</p>
                        <textarea className="input" style={{ minHeight: 70, fontFamily: 'monospace', fontSize: '0.8125rem' }} placeholder={'student1@edu.in\nstudent2@edu.in'} />
                        <button className="btn btn-secondary w-full" style={{ marginTop: '0.75rem' }} onClick={() => alert('Emails dispatched!')}><Mail size={13} /> Send Invites</button>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
                {classrooms.map(c => (
                    <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                            <div style={{ width: 42, height: 42, background: 'var(--accent)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem' }}>{c.name[0]}</div>
                            <div className="flex items-center gap-1">
                                {role === 'teacher' && (
                                    <button className="btn btn-ghost" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                                        onClick={e => { e.stopPropagation(); setInviteTarget(c); }}>
                                        Invite
                                    </button>
                                )}
                                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        </div>
                        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{c.name}</h4>
                        <p className="text-sm text-muted" style={{ marginBottom: '0.75rem' }}>{c.section}</p>
                        <div className="flex items-center gap-3">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                <Users size={13} /> {c.students} students
                            </span>
                            <span className="code-box" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', letterSpacing: '0.1em' }}>{c.code}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Classrooms;
