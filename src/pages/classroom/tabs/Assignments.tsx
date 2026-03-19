import React, { useState } from 'react';
import { Plus, Upload, Clock, X, CheckCircle, Video, Mic } from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';

interface VideoQuestion { id: number; question: string; timeSeconds: number; }
interface Assignment {
    id: number; title: string; description: string;
    type: 'file_upload' | 'text' | 'video';
    deadline: string; points: number; submissions: number; total: number;
    questions?: VideoQuestion[];
}

const MOCK: Assignment[] = [
    { id: 1, title: 'Research Essay — Nudge Theory', description: 'Submit your 1500-word essay on how nudge theory applies to public health campaigns.', type: 'file_upload', deadline: '2026-03-25', points: 100, submissions: 8, total: 22 },
    {
        id: 2, title: 'Video Reflection', description: 'Record a short video response to each question below.', type: 'video', deadline: '2026-03-28', points: 50, submissions: 3, total: 22, questions: [
            { id: 1, question: 'Describe a moment when you experienced anchoring bias in daily life.', timeSeconds: 90 },
            { id: 2, question: 'How would you design a nudge to improve recycling habits on campus?', timeSeconds: 120 },
        ]
    },
];

const TYPE_LABELS = { file_upload: 'File Upload', text: 'Text Response', video: 'Video Recording' };

/* ── In-classroom video recorder ── */
const VideoRecorder: React.FC<{ question: VideoQuestion; onDone: () => void }> = ({ question, onDone }) => {
    const [recording, setRecording] = useState(false);
    const [done, setDone] = useState(false);
    const [secs, setSecs] = useState(0);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
            setRecording(true);
            timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
        } catch { alert('Camera permission required.'); }
    };

    const stop = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setRecording(false); setDone(true);
    };

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ padding: '0.875rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{question.question}</p>
                <p className="text-sm text-muted">Max {fmt(question.timeSeconds)}</p>
            </div>
            <div style={{ padding: '1rem' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', marginBottom: '0.875rem' }}>
                    <video ref={videoRef} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {recording && (
                        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220,38,38,0.85)', borderRadius: 999, padding: '0.25rem 0.75rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} />
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{fmt(secs)}</span>
                        </div>
                    )}
                    {!recording && !done && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: '0.5rem' }}>
                            <Mic size={32} style={{ opacity: 0.6 }} />
                            <span style={{ fontSize: '0.875rem', opacity: 0.6 }}>Camera preview will appear here</span>
                        </div>
                    )}
                    {done && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', color: '#fff', flexDirection: 'column', gap: '0.5rem' }}>
                            <CheckCircle size={32} style={{ color: '#86efac' }} />
                            <span style={{ fontWeight: 600 }}>Recording saved</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    {!recording && !done && <button className="btn btn-primary" onClick={start}><Video size={14} /> Start Recording</button>}
                    {recording && <button className="btn" style={{ background: '#DC2626', color: '#fff', border: 'none' }} onClick={stop}>■ Stop</button>}
                    {done && <>
                        <button className="btn btn-secondary" onClick={() => { setDone(false); setSecs(0); }}>Re-record</button>
                        <button className="btn btn-primary" onClick={onDone}><CheckCircle size={14} /> Use This Take</button>
                    </>}
                </div>
            </div>
        </div>
    );
};

const ClassroomAssignments: React.FC<{ classroom: Classroom; role: string }> = ({ role }) => {
    const [assignments, setAssignments] = useState<Assignment[]>(MOCK);
    const [creating, setCreating] = useState(false);
    const [selected, setSelected] = useState<Assignment | null>(null);
    const [videoQIdx, setVideoQIdx] = useState(0);

    // Create form state
    const [fTitle, setFTitle] = useState('');
    const [fDesc, setFDesc] = useState('');
    const [fType, setFType] = useState<'file_upload' | 'text' | 'video'>('file_upload');
    const [fDl, setFDl] = useState('');
    const [fPts, setFPts] = useState(100);
    const [fQs, setFQs] = useState<VideoQuestion[]>([]);

    // Student submission
    const [textSubmission, setTextSubmission] = useState('');
    const [fileSubmitted, setFileSubmitted] = useState(false);
    const [doneQs, setDoneQs] = useState<number[]>([]);

    const addQ = () => setFQs(qs => [...qs, { id: Date.now(), question: '', timeSeconds: 90 }]);
    const removeQ = (id: number) => setFQs(qs => qs.filter(q => q.id !== id));
    const updateQ = (id: number, patch: Partial<VideoQuestion>) => setFQs(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q));

    const create = () => {
        if (!fTitle.trim()) return;
        setAssignments(a => [...a, { id: Date.now(), title: fTitle, description: fDesc, type: fType, deadline: fDl, points: fPts, submissions: 0, total: 22, questions: fType === 'video' ? fQs : undefined }]);
        setCreating(false); setFTitle(''); setFDesc(''); setFDl(''); setFPts(100); setFQs([]);
    };

    /* ── Student video assignment view ── */
    if (selected && role === 'student' && selected.type === 'video' && selected.questions?.length) {
        const questions = selected.questions;
        const allDone = doneQs.length === questions.length;
        return (
            <div style={{ maxWidth: 740 }}>
                <button className="btn btn-ghost" style={{ padding: '0.25rem 0', marginBottom: '1.25rem' }} onClick={() => { setSelected(null); setDoneQs([]); setVideoQIdx(0); }}>← Assignments</button>
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.375rem' }}>{selected.title}</h2>
                        <span className="badge badge-yellow"><Clock size={11} /> Due {selected.deadline}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>{selected.description}</p>
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.875rem' }}>
                        {questions.map((_, i) => (
                            <div key={i} style={{ width: 28, height: 6, borderRadius: 99, background: doneQs.includes(i) ? 'var(--accent)' : videoQIdx === i ? 'var(--border)' : 'var(--bg-tertiary)', cursor: 'pointer', border: '1px solid var(--border-light)', transition: 'all 0.2s' }} onClick={() => setVideoQIdx(i)} />
                        ))}
                    </div>
                </div>

                {questions.map((q, i) => (
                    videoQIdx === i && (
                        <VideoRecorder key={q.id} question={q} onDone={() => {
                            if (!doneQs.includes(i)) setDoneQs(d => [...d, i]);
                            if (i < questions.length - 1) setVideoQIdx(i + 1);
                        }} />
                    )
                ))}

                {allDone && (
                    <div style={{ background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <CheckCircle size={18} style={{ color: '#059669' }} />
                        <span style={{ fontWeight: 600, color: '#065F46' }}>All {questions.length} responses recorded!</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <button className="btn btn-secondary" disabled={videoQIdx === 0} onClick={() => setVideoQIdx(i => i - 1)}>← Previous</button>
                    {allDone
                        ? <button className="btn btn-primary" onClick={() => { alert('Submitted!'); setSelected(null); }}>Submit All Recordings</button>
                        : <button className="btn btn-primary" disabled={videoQIdx >= questions.length - 1} onClick={() => setVideoQIdx(i => i + 1)}>Next →</button>
                    }
                </div>
            </div>
        );
    }

    /* ── Student file/text view ── */
    if (selected && role === 'student') {
        return (
            <div style={{ maxWidth: 680 }}>
                <button className="btn btn-ghost" style={{ padding: '0.25rem 0', marginBottom: '1.25rem' }} onClick={() => setSelected(null)}>← Assignments</button>
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.375rem' }}>{selected.title}</h2>
                        <span className="badge badge-yellow"><Clock size={11} /> Due {selected.deadline}</span>
                    </div>
                    <p style={{ lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>{selected.description}</p>
                    <p className="text-sm text-muted">{selected.points} points · {TYPE_LABELS[selected.type]}</p>
                </div>
                <div className="card">
                    <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Your Submission</h3>
                    {selected.type === 'file_upload' && (
                        !fileSubmitted ? (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-md)', padding: '2.5rem', cursor: 'pointer' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}>
                                <Upload size={28} style={{ color: 'var(--text-muted)' }} />
                                <span className="text-sm text-muted">Click to upload · PDF, DOCX up to 20 MB</span>
                                <input type="file" style={{ display: 'none' }} onChange={() => setFileSubmitted(true)} />
                            </label>
                        ) : (
                            <div className="flex items-center gap-3" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                                <span style={{ fontWeight: 500 }}>File attached</span>
                                <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '0.25rem 0.5rem' }} onClick={() => setFileSubmitted(false)}><X size={13} /></button>
                            </div>
                        )
                    )}
                    {selected.type === 'text' && <textarea className="input" style={{ minHeight: 180 }} value={textSubmission} onChange={e => setTextSubmission(e.target.value)} placeholder="Write your response here…" />}
                    <div className="flex justify-end" style={{ marginTop: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => { alert('Submitted!'); setSelected(null); }}>Submit</button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Teacher detail ── */
    if (selected && role === 'teacher') {
        return (
            <div style={{ maxWidth: 800 }}>
                <button className="btn btn-ghost" style={{ padding: '0.25rem 0', marginBottom: '1.25rem' }} onClick={() => setSelected(null)}>← Assignments</button>
                <h2 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>{selected.title}</h2>
                <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Due {selected.deadline} · {selected.submissions}/{selected.total} submitted · {TYPE_LABELS[selected.type]}</p>
                {selected.questions && (
                    <div className="card" style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Video Questions ({selected.questions.length})</p>
                        {selected.questions.map((q, i) => (
                            <div key={q.id} style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.5rem' }}>Q{i + 1}</span>
                                {q.question}
                                <span className="badge badge-yellow" style={{ marginLeft: '0.75rem', fontSize: '0.6875rem' }}>{Math.floor(q.timeSeconds / 60)}:{String(q.timeSeconds % 60).padStart(2, '0')}</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="card"><p className="text-muted text-sm">Student submissions will appear here once connected to Supabase.</p></div>
            </div>
        );
    }

    /* ── List view ── */
    return (
        <div style={{ maxWidth: 820 }}>
            {role === 'teacher' && (
                <div className="flex justify-end" style={{ marginBottom: '1.25rem' }}>
                    <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={15} /> New Assignment</button>
                </div>
            )}

            {creating && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 200, overflowY: 'auto', padding: '2rem 0' }}>
                    <div className="card" style={{ width: 580, position: 'relative' }}>
                        <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.2rem' }} onClick={() => setCreating(false)}><X size={15} /></button>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>New Assignment</h3>
                        <div className="field"><label className="label">Title *</label><input className="input" value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="e.g. Video Reflection" /></div>
                        <div className="field"><label className="label">Description</label><textarea className="input" style={{ minHeight: 70 }} value={fDesc} onChange={e => setFDesc(e.target.value)} /></div>
                        <div className="field">
                            <label className="label">Submission Type</label>
                            <select className="input" value={fType} onChange={e => { setFType(e.target.value as any); setFQs([]); }}>
                                <option value="file_upload">File Upload</option>
                                <option value="text">Text Response</option>
                                <option value="video">Video Recording (with questions)</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.25rem' }}>
                            <div className="field" style={{ marginBottom: 0 }}><label className="label">Deadline</label><input className="input" type="date" value={fDl} onChange={e => setFDl(e.target.value)} /></div>
                            <div className="field" style={{ marginBottom: 0 }}><label className="label">Points</label><input className="input" type="number" value={fPts} onChange={e => setFPts(+e.target.value)} /></div>
                        </div>

                        {/* Video questions builder */}
                        {fType === 'video' && (
                            <div>
                                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0 0 1.25rem' }} />
                                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontWeight: 600 }}>Interview Questions ({fQs.length})</p>
                                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8125rem' }} onClick={addQ}><Plus size={13} /> Add Question</button>
                                </div>
                                <div className="flex-col gap-3">
                                    {fQs.map((q, qi) => (
                                        <div key={q.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', position: 'relative' }}>
                                            <button className="btn btn-ghost" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem' }} onClick={() => removeQ(q.id)}><X size={13} /></button>
                                            <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Q{qi + 1}</p>
                                            <div className="field" style={{ marginBottom: '0.5rem' }}>
                                                <input className="input" value={q.question} onChange={e => updateQ(q.id, { question: e.target.value })} placeholder="e.g. Describe a challenge you overcame…" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Time limit (seconds)</label>
                                                <input className="input" type="number" style={{ width: 90 }} min={15} max={300} value={q.timeSeconds} onChange={e => updateQ(q.id, { timeSeconds: +e.target.value })} />
                                                <span className="text-sm text-muted">({Math.floor(q.timeSeconds / 60)}:{String(q.timeSeconds % 60).padStart(2, '0')})</span>
                                            </div>
                                        </div>
                                    ))}
                                    {fQs.length === 0 && <p className="text-sm text-muted">No questions yet — add at least one.</p>}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2" style={{ marginTop: '1.5rem' }}>
                            <button className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={create}>Create</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-col gap-3">
                {assignments.map(a => (
                    <div key={a.id} className="card flex items-center justify-between" style={{ cursor: 'pointer' }} onClick={() => { setSelected(a); setVideoQIdx(0); setDoneQs([]); }}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{a.title}</div>
                            <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                <span className="flex items-center gap-1"><Clock size={12} /> Due {a.deadline}</span>
                                <span>{a.points} pts · {TYPE_LABELS[a.type]}</span>
                                {a.questions && <span>{a.questions.length} questions</span>}
                                {role === 'teacher' && <span>{a.submissions}/{a.total} submitted</span>}
                            </div>
                        </div>
                        <span className={`badge ${role === 'student' ? 'badge-yellow' : a.submissions === a.total ? 'badge-green' : 'badge-yellow'}`}>
                            {role === 'student' ? 'Pending' : a.submissions === a.total ? 'All in' : 'Open'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassroomAssignments;
