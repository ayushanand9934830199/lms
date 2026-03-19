import React, { useEffect, useState } from 'react';
import { Plus, X, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Question {
    id: number;
    text: string;
    prep: number;
    answer: number;
}

interface Assignment {
    id: string;
    title: string;
    deadline: string;
    submission_count: number;
    classroom_name: string | null;
}

const TeacherAssignments: React.FC = () => {
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classrooms, setClassrooms] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    // Create form state
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [classroomId, setClassroomId] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        { id: 1, text: '', prep: 30, answer: 120 }
    ]);
    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState('');

    const fetchAssignments = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                id, title, deadline,
                classrooms(name),
                submissions(id)
            `)
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const parsed = data.map((a: any) => ({
                id: a.id,
                title: a.title,
                deadline: a.deadline?.split('T')[0] || '',
                submission_count: a.submissions?.length || 0,
                classroom_name: a.classrooms?.name || null,
            }));
            setAssignments(parsed);
        }
        setLoading(false);
    };

    const fetchClassrooms = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('teacher_id', user.id)
            .order('name');
        if (data) setClassrooms(data);
    };

    useEffect(() => {
        fetchAssignments();
        fetchClassrooms();
    }, [user]);

    const addQuestion = () =>
        setQuestions(q => [...q, { id: Date.now(), text: '', prep: 30, answer: 120 }]);

    const removeQuestion = (id: number) =>
        setQuestions(q => q.filter(x => x.id !== id));

    const updateQ = (id: number, field: keyof Question, value: string | number) =>
        setQuestions(q => q.map(x => x.id === id ? { ...x, [field]: value } : x));

    const handlePublish = async () => {
        if (!title.trim() || !deadline || !user) return;
        setPublishing(true);
        setPublishError('');

        const { error } = await supabase.from('assignments').insert({
            title,
            deadline,
            teacher_id: user.id,
            classroom_id: classroomId || null,
            type: 'video_interview',
            questions_or_config: questions,
        });

        if (error) {
            setPublishError(error.message);
            setPublishing(false);
            return;
        }

        setTitle(''); setDeadline(''); setClassroomId('');
        setQuestions([{ id: 1, text: '', prep: 30, answer: 120 }]);
        setView('list');
        fetchAssignments();
        setPublishing(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this assignment? All linked submissions will be deleted too.')) return;
        await supabase.from('assignments').delete().eq('id', id);
        fetchAssignments();
    };

    if (view === 'create') {
        return (
            <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                    <div>
                        <button className="btn btn-ghost" onClick={() => setView('list')} style={{ marginBottom: '0.5rem', padding: '0.25rem 0' }}>
                            ← Back to Assignments
                        </button>
                        <h1 style={{ fontSize: '2rem' }}>Create Video Assignment</h1>
                    </div>
                    <button className="btn btn-primary" onClick={handlePublish} disabled={publishing || !title.trim() || !deadline}>
                        {publishing ? 'Publishing...' : 'Publish Assignment'}
                    </button>
                </div>

                {publishError && (
                    <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        {publishError}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Left: Details */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Assignment Details</h3>
                        <div className="field">
                            <label className="label">Assignment Title *</label>
                            <input className="input" placeholder="e.g. Behavioral Interview Round 1" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="label">Submission Deadline *</label>
                            <input className="input" type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
                        </div>

                        <hr className="divider" />

                        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                            <h4>Interview Questions ({questions.length})</h4>
                            <button className="btn btn-secondary" onClick={addQuestion}>
                                <Plus size={14} /> Add Question
                            </button>
                        </div>

                        <div className="flex-col gap-3">
                            {questions.map((q, i) => (
                                <div key={q.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                    <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                                        <span className="text-sm font-bold">Question {i + 1}</span>
                                        {questions.length > 1 && (
                                            <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => removeQuestion(q.id)}>
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="field" style={{ marginBottom: '0.75rem' }}>
                                        <textarea
                                            className="input"
                                            style={{ minHeight: '72px' }}
                                            placeholder="e.g. Tell me about a time you led a team under pressure."
                                            value={q.text}
                                            onChange={e => updateQ(q.id, 'text', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label className="label">Prep time (sec)</label>
                                            <input className="input" type="number" value={q.prep} onChange={e => updateQ(q.id, 'prep', +e.target.value)} />
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label className="label">Answer time (sec)</label>
                                            <input className="input" type="number" value={q.answer} onChange={e => updateQ(q.id, 'answer', +e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Assign To */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Assign To</h3>
                        <div className="field">
                            <label className="label">Classroom</label>
                            <select className="input" value={classroomId} onChange={e => setClassroomId(e.target.value)}>
                                <option value="">All students (no class filter)</option>
                                {classrooms.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <hr className="divider" />
                        <h4 style={{ marginBottom: '1rem' }}>Preview</h4>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <p><strong>Title:</strong> {title || <span className="text-muted">—</span>}</p>
                            <p style={{ marginTop: '0.25rem' }}><strong>Deadline:</strong> {deadline || <span className="text-muted">—</span>}</p>
                            <p style={{ marginTop: '0.25rem' }}><strong>Questions:</strong> {questions.length}</p>
                            <p style={{ marginTop: '0.25rem' }}><strong>Classroom:</strong> {classrooms.find(c => c.id === classroomId)?.name || 'All students'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Assignments</h1>
                <button className="btn btn-primary" onClick={() => setView('create')}>
                    <Plus size={16} /> New Assignment
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading assignments...</div>
            ) : assignments.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No assignments yet. Create one to get started.
                </div>
            ) : (
                <div className="flex-col gap-3">
                    {assignments.map(a => (
                        <div key={a.id} className="card flex items-center justify-between">
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{a.title}</div>
                                <div className="text-sm text-muted">
                                    Due {a.deadline}
                                    {a.classroom_name && <> · {a.classroom_name}</>}
                                    {' · '}{a.submission_count} submitted
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${a.submission_count > 0 ? 'badge-green' : 'badge-yellow'}`}>
                                    {a.submission_count > 0 ? `${a.submission_count} in` : 'Pending'}
                                </span>
                                <button
                                    className="btn btn-ghost"
                                    style={{ padding: '0.3rem', color: '#dc2626' }}
                                    onClick={(e) => handleDelete(a.id, e)}
                                    title="Delete assignment"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherAssignments;
