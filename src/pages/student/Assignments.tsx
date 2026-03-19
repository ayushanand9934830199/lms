import React, { useState, useRef, useEffect } from 'react';
import { uploadVideoSubmission } from '../../lib/supabase';
import { Clock, Mic, StopCircle } from 'lucide-react';

interface Assignment {
    id: number;
    title: string;
    deadline: string;
    questions: string[];
    status: 'pending' | 'in_progress' | 'completed';
}

const mockAssignments: Assignment[] = [
    {
        id: 1,
        title: 'Behavioral Interview Round 1',
        deadline: '2026-03-25',
        questions: [
            'Tell me about a time you led a team under pressure.',
            'Describe a conflict with a colleague and how you resolved it.',
        ],
        status: 'pending',
    },
    {
        id: 2,
        title: 'Case Study Walkthrough',
        deadline: '2026-03-28',
        questions: ['Walk me through how you would approach a cold-start growth problem.'],
        status: 'completed',
    },
];

/* ── Live camera hook using getUserMedia directly ── */
function useLiveCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startPreview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (e) {
            console.error('Camera access denied', e);
        }
    };

    const stopPreview = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    return { videoRef, streamRef, startPreview, stopPreview };
}

const StudentAssignments: React.FC = () => {
    const [active, setActive] = useState<Assignment | null>(null);
    const [qIndex, setQIndex] = useState(0);
    const [recording, setRecording] = useState(false);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    const { videoRef, streamRef, startPreview, stopPreview } = useLiveCamera();
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Countdown clock while recording
    useEffect(() => {
        if (!recording) { setElapsed(0); return; }
        const id = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(id);
    }, [recording]);

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const beginSession = async (a: Assignment) => {
        setActive(a); setQIndex(0); setMediaUrl(null);
        // Small delay so DOM mounts before we attach stream
        setTimeout(startPreview, 200);
    };

    const exitSession = () => {
        stopRecordingMedia();
        stopPreview();
        setActive(null); setQIndex(0); setMediaUrl(null); setRecording(false);
    };

    const startRecordingMedia = () => {
        if (!streamRef.current) return;
        chunksRef.current = [];
        const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp8,opus' });
        mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setMediaUrl(url);
            // Show playback instead of live feed
            if (videoRef.current) {
                videoRef.current.srcObject = null;
                videoRef.current.src = url;
                videoRef.current.controls = true;
                videoRef.current.play();
            }
        };
        mr.start();
        recorderRef.current = mr;
        setRecording(true);
    };

    const stopRecordingMedia = () => {
        recorderRef.current?.stop();
        recorderRef.current = null;
        setRecording(false);
    };

    const handleUpload = async () => {
        if (!mediaUrl || !active) return;
        setIsUploading(true);
        try {
            const res = await fetch(mediaUrl);
            const blob = await res.blob();
            await uploadVideoSubmission('student-id', `a${active.id}-q${qIndex + 1}`, blob);
            setMediaUrl(null);
            if (videoRef.current) { videoRef.current.src = ''; videoRef.current.controls = false; }
            if (qIndex + 1 < active.questions.length) {
                setQIndex(i => i + 1);
                setTimeout(startPreview, 100);
            } else {
                alert('All responses submitted! Great work.');
                exitSession();
            }
        } catch {
            alert('Upload failed — check your Cloudbase connection.');
        } finally {
            setIsUploading(false);
        }
    };

    /* ── Recording Session View ── */
    if (active) {
        const question = active.questions[qIndex];
        return (
            <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem 0' }} onClick={exitSession}>← Exit</button>
                    {recording && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'block', animation: 'pulse 1.2s infinite' }} />
                            Recording · {fmt(elapsed)}
                        </div>
                    )}
                </div>

                <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }`}</style>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{active.title}</h2>
                <p className="text-sm text-muted" style={{ marginBottom: '1.75rem' }}>
                    Question {qIndex + 1} of {active.questions.length}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Question */}
                    <div>
                        <div className="card-bordered" style={{ marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '1.125rem', lineHeight: 1.65 }}>"{question}"</p>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-3">
                            {!mediaUrl && !recording && (
                                <button className="btn btn-primary" onClick={startRecordingMedia}>
                                    <Mic size={15} /> Start Recording
                                </button>
                            )}
                            {recording && (
                                <button className="btn btn-danger" onClick={stopRecordingMedia}>
                                    <StopCircle size={15} /> Stop
                                </button>
                            )}
                            {mediaUrl && !recording && (
                                <>
                                    <button className="btn btn-secondary" onClick={() => {
                                        setMediaUrl(null);
                                        if (videoRef.current) { videoRef.current.src = ''; videoRef.current.controls = false; }
                                        startPreview();
                                    }}>Re-record</button>
                                    <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading}>
                                        {isUploading ? 'Uploading…' : qIndex + 1 < active.questions.length ? 'Save & Next →' : 'Submit Final Answer'}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Question dots */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                            {active.questions.map((_, i) => (
                                <div key={i} style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: i < qIndex ? 'var(--success)' : i === qIndex ? 'var(--accent)' : 'var(--border-light)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* LIVE Camera Preview */}
                    <div style={{
                        background: '#111',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: recording ? '2px solid #DC2626' : '2px solid transparent',
                        transition: 'border-color 0.3s',
                        boxShadow: 'var(--shadow-md)',
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted={!mediaUrl} /* mute live preview, unmute playback */
                            playsInline
                            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ padding: '0.75rem 1rem', background: '#111', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: recording ? '#DC2626' : '#555', transition: 'background 0.3s' }} />
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{recording ? 'Recording' : mediaUrl ? 'Playback' : 'Live Preview'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Assignment List ── */
    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.75rem' }}>My Assignments</h1>

            <div className="flex-col gap-3">
                {mockAssignments.map(a => (
                    <div key={a.id} className="card flex items-center justify-between">
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{a.title}</div>
                            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                                <Clock size={13} /> Due {a.deadline} · {a.questions.length} question{a.questions.length > 1 ? 's' : ''}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`badge ${a.status === 'completed' ? 'badge-green' : a.status === 'in_progress' ? 'badge-yellow' : 'badge-red'}`}>
                                {a.status}
                            </span>
                            {a.status !== 'completed' && (
                                <button className="btn btn-primary" onClick={() => beginSession(a)}>
                                    {a.status === 'in_progress' ? 'Continue' : 'Begin'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentAssignments;
