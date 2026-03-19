import React, { useEffect, useState } from 'react';
import { Play, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Sub {
    id: string;
    student_name: string;
    assignment_title: string;
    submitted_at: string;
    status: string;
    video_url: string | null;
}

const TeacherSubmissions: React.FC = () => {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<Sub[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Sub | null>(null);
    const [feedback, setFeedback] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchSubmissions = async () => {
        if (!user) return;
        setLoading(true);
        // Grab submissions for assignments created by this teacher
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                id, status, submitted_at, video_url, game_results,
                assignments!inner(title, teacher_id),
                profiles!submissions_student_id_fkey(full_name)
            `)
            .eq('assignments.teacher_id', user.id)
            .order('submitted_at', { ascending: false });

        if (!error && data) {
            const parsed = data.map((s: any) => ({
                id: s.id,
                student_name: s.profiles?.full_name || 'Unknown Student',
                assignment_title: s.assignments?.title || 'Unknown Assignment',
                submitted_at: s.submitted_at?.split('T')[0] || '',
                status: s.status || 'pending',
                video_url: s.video_url || null,
            }));
            setSubmissions(parsed);
        }
        setLoading(false);
    };

    useEffect(() => { fetchSubmissions(); }, [user]);

    const handleSaveFeedback = async () => {
        if (!selected || !user) return;
        setSaving(true);
        await supabase.from('feedback').insert({
            submission_id: selected.id,
            teacher_id: user.id,
            comments: feedback,
        });
        // Mark submission as reviewed
        await supabase.from('submissions').update({ status: 'reviewed' }).eq('id', selected.id);
        setSaving(false);
        setFeedback('');
        setSelected(null);
        fetchSubmissions();
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this submission?')) return;
        await supabase.from('submissions').delete().eq('id', id);
        if (selected?.id === id) setSelected(null);
        fetchSubmissions();
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading submissions...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.75rem' }}>Video Submissions</h1>

            {submissions.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No submissions yet from your students.
                </div>
            ) : (
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
                                    <span style={{ fontWeight: 600 }}>{s.student_name}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className={`badge ${s.status === 'pending' ? 'badge-yellow' : s.status === 'reviewed' ? 'badge-green' : 'badge-gray'}`}>
                                            {s.status}
                                        </span>
                                        <button
                                            className="btn btn-ghost"
                                            style={{ padding: '0.2rem', color: '#dc2626' }}
                                            onClick={(e) => handleDelete(s.id, e)}
                                            title="Delete submission"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-muted">{s.assignment_title}</div>
                                <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Submitted {s.submitted_at}</div>
                            </div>
                        ))}
                    </div>

                    {/* Review Panel */}
                    {selected ? (
                        <div className="card flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 style={{ fontSize: '1.375rem' }}>{selected.student_name}</h3>
                                    <p className="text-sm text-muted">{selected.assignment_title} · {selected.submitted_at}</p>
                                </div>
                                <span className={`badge ${selected.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{selected.status}</span>
                            </div>

                            {/* Video Player */}
                            {selected.video_url ? (
                                <video
                                    src={selected.video_url}
                                    controls
                                    style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '340px', background: '#000' }}
                                />
                            ) : (
                                <div style={{
                                    height: '280px', background: '#111', borderRadius: 'var(--radius-md)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                }}>
                                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                        <Play size={40} />
                                        <p className="text-sm" style={{ marginTop: '0.75rem' }}>No video uploaded yet.</p>
                                    </div>
                                </div>
                            )}

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
                                <button className="btn btn-primary" onClick={handleSaveFeedback} disabled={saving || !feedback.trim()}>
                                    {saving ? 'Saving...' : 'Submit Feedback & Mark Reviewed'}
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
            )}
        </div>
    );
};

export default TeacherSubmissions;
