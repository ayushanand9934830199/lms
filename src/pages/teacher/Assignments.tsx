import React, { useState } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';

interface Question {
    id: number;
    text: string;
    prep: number;
    answer: number;
}

const TeacherAssignments: React.FC = () => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        { id: 1, text: '', prep: 30, answer: 120 }
    ]);

    const addQuestion = () =>
        setQuestions(q => [...q, { id: Date.now(), text: '', prep: 30, answer: 120 }]);

    const removeQuestion = (id: number) =>
        setQuestions(q => q.filter(x => x.id !== id));

    const updateQ = (id: number, field: keyof Question, value: string | number) =>
        setQuestions(q => q.map(x => x.id === id ? { ...x, [field]: value } : x));

    const mockAssignments = [
        { id: 1, title: 'Intro Behavioral Interview', deadline: '2026-03-25', submissions: 8, total: 22 },
        { id: 2, title: 'Case Study Presentation', deadline: '2026-03-28', submissions: 3, total: 22 },
    ];

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
                    <button className="btn btn-primary" onClick={() => { alert('Assignment created! (connect to Supabase)'); setView('list'); }}>
                        Publish Assignment
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Left: Details */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem' }}>Assignment Details</h3>
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

                    {/* Right: Preview / Settings */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem' }}>Assign To</h3>
                        <div className="field">
                            <label className="label">Class / Group</label>
                            <select className="input">
                                <option value="">All students</option>
                                <option value="a">Batch A — 2026</option>
                                <option value="b">Batch B — 2026</option>
                            </select>
                        </div>
                        <div className="field">
                            <label className="label">Or paste individual email addresses</label>
                            <textarea className="input" placeholder="jane@university.edu&#10;john@university.edu" style={{ minHeight: '120px', fontFamily: 'monospace', fontSize: '0.8125rem' }} />
                        </div>

                        <hr className="divider" />
                        <h4 style={{ marginBottom: '1rem' }}>Preview</h4>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <p><strong>Title:</strong> {title || <span className="text-muted">—</span>}</p>
                            <p style={{ marginTop: '0.25rem' }}><strong>Deadline:</strong> {deadline || <span className="text-muted">—</span>}</p>
                            <p style={{ marginTop: '0.25rem' }}><strong>Questions:</strong> {questions.length}</p>
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

            <div className="flex-col gap-3">
                {mockAssignments.map(a => (
                    <div key={a.id} className="card flex items-center justify-between" style={{ cursor: 'pointer' }}
                        onClick={() => setView('create')}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{a.title}</div>
                            <div className="text-sm text-muted">Due {a.deadline} · {a.submissions}/{a.total} submitted</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`badge ${a.submissions === a.total ? 'badge-green' : 'badge-yellow'}`}>
                                {a.submissions === a.total ? 'All In' : 'Pending'}
                            </span>
                            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherAssignments;
