import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Clock, AlertTriangle, CheckCircle, ShieldAlert, Trash2 } from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

/* ─────────────────────── Types ─────────────────────── */
interface Question {
    id: number;
    question: string;
    type: 'mcq' | 'short';
    options?: string[];
    correctAnswer?: string;
    points: number;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    duration_mins: number;
    max_tab_switches: number;
    published: boolean;
    questions: Question[];
}

/* ─────────────────────── Proctored Runner ─────────────────────── */
const QuizRunner: React.FC<{ quiz: Quiz; onExit: () => void }> = ({ quiz, onExit }) => {
    const { user } = useAuth();
    const [started, setStarted] = useState(false);
    const [qIdx, setQIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [violations, setViolations] = useState(0);
    const [status, setStatus] = useState<'ready' | 'running' | 'terminated' | 'submitted'>('ready');
    const [secsLeft, setSecsLeft] = useState(quiz.duration_mins * 60);
    const [warning, setWarning] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

    const submitQuiz = useCallback(async (flagged = false) => {
        stopTimer();
        setStatus('submitted');
        if (!user) return;
        await supabase.from('submissions').insert({
            assignment_id: null,
            student_id: user.id,
            status: flagged ? 'flagged' : 'completed',
            game_results: { quiz_id: quiz.id, answers, violations },
        });
    }, [user, quiz.id, answers, violations]);

    const handleVisibility = useCallback(() => {
        if (document.hidden && status === 'running') {
            setViolations(v => {
                const next = v + 1;
                if (next >= quiz.max_tab_switches) {
                    setStatus('terminated');
                    submitQuiz(true);
                } else {
                    setWarning(`⚠️ Warning ${next}/${quiz.max_tab_switches}: You switched tabs. One more will auto-submit your quiz.`);
                    setTimeout(() => setWarning(null), 5000);
                }
                return next;
            });
        }
    }, [status, quiz.max_tab_switches, submitQuiz]);

    useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('blur', handleVisibility);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('blur', handleVisibility);
        };
    }, [handleVisibility]);

    const startQuiz = () => {
        setStarted(true);
        setStatus('running');
        timerRef.current = setInterval(() => {
            setSecsLeft(s => {
                if (s <= 1) { clearInterval(timerRef.current!); submitQuiz(); return 0; }
                return s - 1;
            });
        }, 1000);
    };

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const q = quiz.questions[qIdx];
    const totalPts = quiz.questions.reduce((s, q) => s + q.points, 0);

    if (!started) {
        return (
            <div style={{ maxWidth: 560 }}>
                <div className="card" style={{ marginBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{quiz.title}</h2>
                    <p style={{ lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{quiz.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
                        {[['Questions', quiz.questions.length], ['Duration', `${quiz.duration_mins} min`], ['Total Marks', totalPts]].map(([l, v]) => (
                            <div key={l as string} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
                                <p className="text-sm text-muted">{l}</p>
                                <p style={{ fontWeight: 700, fontSize: '1.125rem' }}>{v}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#FEF3C7', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.375rem' }}>
                            <ShieldAlert size={15} style={{ color: '#92400E' }} />
                            <span style={{ fontWeight: 600, color: '#92400E', fontSize: '0.875rem' }}>Proctoring Active</span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#78350F', lineHeight: 1.55 }}>
                            This quiz is monitored. Switching tabs or windows will be logged.
                            You are allowed <strong>{quiz.max_tab_switches}</strong> tab switch{quiz.max_tab_switches !== 1 ? 'es' : ''} — after that, your quiz will be <strong>automatically submitted</strong> and flagged.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn btn-secondary" onClick={onExit}>Cancel</button>
                        <button className="btn btn-primary" onClick={startQuiz}>Start Quiz</button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'terminated') {
        return (
            <div style={{ maxWidth: 500 }}>
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <AlertTriangle size={40} style={{ color: 'var(--danger)', margin: '0 auto 1.25rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Quiz Terminated</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                        Your quiz has been <strong>automatically submitted</strong> because you exceeded the allowed tab switches ({quiz.max_tab_switches}).
                        Your answers have been saved and flagged for your teacher's review.
                    </p>
                    <button className="btn btn-secondary" onClick={onExit}>Back to Quizzes</button>
                </div>
            </div>
        );
    }

    if (status === 'submitted') {
        return (
            <div style={{ maxWidth: 500 }}>
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <CheckCircle size={40} style={{ color: 'var(--success)', margin: '0 auto 1.25rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Submitted!</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                        Your quiz has been submitted. Results will be available once your teacher publishes grades.
                    </p>
                    {violations > 0 && <p style={{ fontSize: '0.875rem', color: 'var(--danger)', marginBottom: '1rem' }}>Tab violations: {violations}</p>}
                    <button className="btn btn-secondary" onClick={onExit}>Back to Quizzes</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 680 }}>
            {warning && (
                <div style={{ background: '#FEF3C7', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#92400E', fontWeight: 500, fontSize: '0.875rem' }}>
                    <AlertTriangle size={15} /> {warning}
                </div>
            )}
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem' }}>{quiz.title}</h2>
                    <p className="text-sm text-muted">Question {qIdx + 1} of {quiz.questions.length}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.25rem', color: secsLeft < 120 ? 'var(--danger)' : 'inherit' }}>
                    <Clock size={18} /> {fmt(secsLeft)}
                </div>
            </div>
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(qIdx / quiz.questions.length) * 100}%`, background: 'var(--accent)', transition: 'width 0.4s' }} />
            </div>
            <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.5 }}>{q.question}</p>
                    <span className="badge badge-yellow">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                </div>
                {q.type === 'mcq' && q.options && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {q.options.map((opt, i) => (
                            <button key={i} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))} style={{ padding: '0.75rem 1rem', border: `1px solid ${answers[q.id] === opt ? 'var(--accent)' : 'var(--border-light)'}`, borderRadius: 'var(--radius-sm)', background: answers[q.id] === opt ? 'var(--accent-light)' : '#fff', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter,sans-serif', fontSize: '0.9375rem', transition: 'all 0.15s', fontWeight: answers[q.id] === opt ? 600 : 400 }}>
                                <span style={{ fontWeight: 600, marginRight: '0.625rem', color: 'var(--text-muted)' }}>{String.fromCharCode(65 + i)}.</span>
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                {q.type === 'short' && (
                    <textarea className="input" style={{ minHeight: 130 }} placeholder="Write your answer here…" value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} />
                )}
            </div>
            <div className="flex justify-between">
                <button className="btn btn-secondary" disabled={qIdx === 0} onClick={() => setQIdx(i => i - 1)}>← Previous</button>
                {qIdx < quiz.questions.length - 1
                    ? <button className="btn btn-primary" onClick={() => setQIdx(i => i + 1)}>Next →</button>
                    : <button className="btn btn-primary" onClick={() => submitQuiz()}>Submit Quiz</button>
                }
            </div>
        </div>
    );
};

/* ─────────────────────── Quiz List + Builder ─────────────────────── */
const ClassroomQuizzes: React.FC<{ classroom: Classroom; role: string }> = ({ classroom, role }) => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState<Quiz | null>(null);
    const [creating, setCreating] = useState(false);

    const [bTitle, setBTitle] = useState('');
    const [bDesc, setBDesc] = useState('');
    const [bDur, setBDur] = useState(20);
    const [bMax, setBMax] = useState(2);
    const [bQs, setBQs] = useState<Question[]>([]);

    const fetchQuizzes = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('quizzes')
            .select('*')
            .eq('classroom_id', classroom.id)
            .order('created_at', { ascending: false });
        if (data) setQuizzes(data as Quiz[]);
        setLoading(false);
    };

    useEffect(() => { fetchQuizzes(); }, [classroom.id]);

    const addQ = () => setBQs(qs => [...qs, { id: Date.now(), question: '', type: 'mcq', options: ['', '', '', ''], points: 1 }]);
    const removeQ = (id: number) => setBQs(qs => qs.filter(q => q.id !== id));
    const updateQ = (id: number, patch: Partial<Question>) => setBQs(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));
    const updateOpt = (qId: number, i: number, val: string) =>
        setBQs(qs => qs.map(q => q.id === qId ? { ...q, options: q.options?.map((o, j) => j === i ? val : o) } : q));

    const createQuiz = async () => {
        if (!bTitle.trim() || bQs.length === 0 || !user) return;
        await supabase.from('quizzes').insert({
            classroom_id: classroom.id,
            teacher_id: user.id,
            title: bTitle,
            description: bDesc,
            duration_mins: bDur,
            max_tab_switches: bMax,
            published: false,
            questions: bQs,
        });
        setCreating(false);
        setBTitle(''); setBDesc(''); setBDur(20); setBMax(2); setBQs([]);
        fetchQuizzes();
    };

    const togglePublish = async (q: Quiz) => {
        await supabase.from('quizzes').update({ published: !q.published }).eq('id', q.id);
        fetchQuizzes();
    };

    const deleteQuiz = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this quiz?')) return;
        await supabase.from('quizzes').delete().eq('id', id);
        fetchQuizzes();
    };

    if (running) return <QuizRunner quiz={running} onExit={() => setRunning(null)} />;

    return (
        <div style={{ maxWidth: 820 }}>
            {role === 'teacher' && (
                <div className="flex justify-end" style={{ marginBottom: '1.25rem' }}>
                    <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={15} /> New Quiz</button>
                </div>
            )}

            {/* Builder modal */}
            {creating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 200, overflowY: 'auto', padding: '2rem 0' }}>
                    <div className="card" style={{ width: 640, position: 'relative' }}>
                        <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.2rem' }} onClick={() => setCreating(false)}><X size={15} /></button>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Quiz Builder</h3>
                        <div className="field"><label className="label">Title *</label><input className="input" value={bTitle} onChange={e => setBTitle(e.target.value)} /></div>
                        <div className="field"><label className="label">Description</label><textarea className="input" style={{ minHeight: 60 }} value={bDesc} onChange={e => setBDesc(e.target.value)} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
                            <div className="field" style={{ marginBottom: 0 }}><label className="label">Duration (minutes)</label><input className="input" type="number" value={bDur} onChange={e => setBDur(+e.target.value)} /></div>
                            <div className="field" style={{ marginBottom: 0 }}>
                                <label className="label">Max Tab Switches</label>
                                <input className="input" type="number" min={1} max={5} value={bMax} onChange={e => setBMax(+e.target.value)} />
                            </div>
                        </div>
                        <hr className="divider" />
                        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                            <p style={{ fontWeight: 600 }}>Questions ({bQs.length})</p>
                            <button className="btn btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }} onClick={addQ}><Plus size={13} /> Add Question</button>
                        </div>
                        <div className="flex-col gap-4">
                            {bQs.map((q, qi) => (
                                <div key={q.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', position: 'relative' }}>
                                    <button className="btn btn-ghost" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem' }} onClick={() => removeQ(q.id)}><X size={13} /></button>
                                    <p style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.625rem', color: 'var(--text-muted)' }}>Q{qi + 1}</p>
                                    <div className="field"><label className="label">Question *</label><input className="input" value={q.question} onChange={e => updateQ(q.id, { question: e.target.value })} /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.875rem' }}>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label className="label">Type</label>
                                            <select className="input" value={q.type} onChange={e => updateQ(q.id, { type: e.target.value as 'mcq' | 'short', options: e.target.value === 'mcq' ? ['', '', '', ''] : undefined })}>
                                                <option value="mcq">Multiple Choice</option>
                                                <option value="short">Short Answer</option>
                                            </select>
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}><label className="label">Points</label><input className="input" type="number" min={1} value={q.points} onChange={e => updateQ(q.id, { points: +e.target.value })} /></div>
                                    </div>
                                    {q.type === 'mcq' && q.options && (
                                        <div>
                                            <label className="label" style={{ marginBottom: '0.5rem' }}>Options</label>
                                            <div className="flex-col gap-2">
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className="flex items-center gap-2">
                                                        <input type="radio" name={`correct-${q.id}`} onChange={() => updateQ(q.id, { correctAnswer: opt })} style={{ flexShrink: 0 }} title="Mark as correct answer" />
                                                        <input className="input" style={{ flex: 1 }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt} onChange={e => updateOpt(q.id, oi, e.target.value)} />
                                                    </div>
                                                ))}
                                                <p className="text-sm text-muted">Select radio button to mark correct answer.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {bQs.length === 0 && <p className="text-sm text-muted">No questions yet — add at least one.</p>}
                        </div>
                        <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={createQuiz} disabled={!bTitle.trim() || bQs.length === 0}>Create Quiz</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz list */}
            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No quizzes yet.{role === 'teacher' ? ' Click "New Quiz" to create one.' : ' Your teacher hasn\'t created any quizzes yet.'}
                </div>
            ) : (
                <div className="flex-col gap-3">
                    {quizzes.map(q => (
                        <div key={q.id} className="card flex items-center justify-between">
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{q.title}</div>
                                <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {q.duration_mins} min</span>
                                    <span>{q.questions.length} questions</span>
                                    <span className="flex items-center gap-1"><ShieldAlert size={12} /> max {q.max_tab_switches} tab switch{q.max_tab_switches !== 1 ? 'es' : ''}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${q.published ? 'badge-green' : 'badge-yellow'}`}>{q.published ? 'Published' : 'Draft'}</span>
                                {role === 'student' && q.published && (
                                    <button className="btn btn-primary" onClick={() => setRunning(q)}>Start</button>
                                )}
                                {role === 'teacher' && (
                                    <>
                                        <button className="btn btn-secondary" onClick={() => togglePublish(q)}>
                                            {q.published ? 'Unpublish' : 'Publish'}
                                        </button>
                                        <button className="btn btn-ghost" style={{ padding: '0.3rem', color: '#dc2626' }} onClick={e => deleteQuiz(q.id, e)} title="Delete quiz">
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassroomQuizzes;
