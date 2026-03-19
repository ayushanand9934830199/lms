import React, { useState } from 'react';
import { Play } from 'lucide-react';

const submissions = [
    { id: 1, student: 'Alice Johnson', assignment: 'Behavioral Interview Round 1', submitted: '2026-03-18', status: 'pending' as const },
    { id: 2, student: 'Bob Smith', assignment: 'Behavioral Interview Round 1', submitted: '2026-03-17', status: 'reviewed' as const },
    { id: 3, student: 'Priya Mehta', assignment: 'Case Study Presentation', submitted: '2026-03-19', status: 'pending' as const },
];

const TeacherSubmissions: React.FC = () => {
    const [selected, setSelected] = useState<typeof submissions[0] | null>(null);
    const [feedback, setFeedback] = useState('');

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.75rem' }}>Video Submissions</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Submission List */}
                <div className="flex-col gap-2">
                    {submissions.map(s => (
                        <div
                            key={s.id}
                            className="card"
                            style={{ cursor: 'pointer', borderColor: selected?.id === s.id ? 'var(--accent)' : undefined, borderWidth: selected?.id === s.id ? '2px' : undefined }}
                            onClick={() => { setSelected(s); setFeedback(''); }}
                        >
                            <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600 }}>{s.student}</span>
                                <span className={`badge ${s.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <div className="text-sm text-muted">{s.assignment}</div>
                            <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Submitted {s.submitted}</div>
                        </div>
                    ))}
                </div>

                {/* Review Panel */}
                {selected ? (
                    <div className="card flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.375rem' }}>{selected.student}</h3>
                                <p className="text-sm text-muted">{selected.assignment} · {selected.submitted}</p>
                            </div>
                            <span className={`badge ${selected.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{selected.status}</span>
                        </div>

                        {/* Video Player */}
                        <div style={{
                            height: '340px',
                            background: '#111',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            border: '1px solid var(--border-light)',
                        }}>
                            <div style={{ textAlign: 'center', opacity: 0.6 }}>
                                <Play size={48} />
                                <p className="text-sm" style={{ marginTop: '0.75rem' }}>Student video playback</p>
                                <p className="text-sm" style={{ marginTop: '0.25rem' }}>Pulls from Cloudbase (Supabase Storage)</p>
                            </div>
                        </div>

                        {/* Feedback Form */}
                        <div>
                            <label className="label" style={{ marginBottom: '0.5rem', display: 'block' }}>Your Feedback</label>
                            <textarea
                                className="input"
                                style={{ minHeight: '120px' }}
                                placeholder="Excellent pacing and eye contact. Could elaborate further on the resolution..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button className="btn btn-danger">Request Resubmission</button>
                            <button className="btn btn-primary" onClick={() => alert('Feedback saved!')}>
                                Submit Feedback
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card flex items-center justify-center" style={{ height: '400px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        <div>
                            <Play size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                            <p>Select a submission to review</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherSubmissions;
