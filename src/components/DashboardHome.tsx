import React, { useState } from 'react';
import { Plus, X, StickyNote } from 'lucide-react';
import { PomodoroFace } from './PomodoroWidget';
import { YouTubeFace } from './YouTubeWidget';

/* ─── Data ────────────────────────────────────────────── */
const QUOTES = [
    { text: "The only way to do great work is to love what you do.", attr: "Steve Jobs" },
    { text: "From being ambiguous to ambitious — one step at a time.", attr: "Restless Dreamers" },
    { text: "We dream to become. We build to prove.", attr: "Restless Dreamers" },
    { text: "Education is not preparation for life; education is life itself.", attr: "John Dewey" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", attr: "Plutarch" },
    { text: "Growth happens at the edge of discomfort.", attr: "Restless Dreamers" },
    { text: "Clarity comes from engagement, not thought.", attr: "Marie Forleo" },
];

const STICKY_COLORS = ['#FDE68A', '#BBF7D0', '#BFDBFE', '#FECACA', '#E9D5FF', '#FED7AA'];
interface SNote { id: string; text: string; color: string; }

/* ─── Sticky Notes ────────────────────────────────────── */
const StickyNotes: React.FC = () => {
    const stored = () => { try { return JSON.parse(localStorage.getItem('blast_sticky') || '[]') as SNote[]; } catch { return []; } };
    const [notes, setNotes] = useState<SNote[]>(stored);
    const save = (n: SNote[]) => { setNotes(n); localStorage.setItem('blast_sticky', JSON.stringify(n)); };
    const add = () => save([...notes, { id: Date.now().toString(), text: '', color: STICKY_COLORS[notes.length % STICKY_COLORS.length] }]);

    return (
        <div className="card" style={{ height: '100%', boxSizing: 'border-box' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.875rem' }}>
                <div className="flex items-center gap-2" style={{ fontWeight: 700 }}>
                    <StickyNote size={16} style={{ color: 'var(--accent)' }} /> Sticky Notes
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8125rem' }} onClick={add}><Plus size={13} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.625rem' }}>
                {notes.map(n => (
                    <div key={n.id} style={{ background: n.color, borderRadius: 4, padding: '0.5rem', position: 'relative', boxShadow: '2px 3px 8px rgba(0,0,0,0.1)', minHeight: 90 }}>
                        <button onClick={() => save(notes.filter(x => x.id !== n.id))} style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: 0, lineHeight: 1 }}><X size={11} /></button>
                        <textarea value={n.text} onChange={e => save(notes.map(x => x.id === n.id ? { ...x, text: e.target.value } : x))}
                            style={{ width: '100%', height: 72, border: 'none', background: 'transparent', fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', resize: 'none', outline: 'none', lineHeight: 1.5 }}
                            placeholder="Write a note…" />
                    </div>
                ))}
                {notes.length === 0 && <p className="text-sm text-muted" style={{ gridColumn: '1/-1' }}>No notes yet — add one!</p>}
            </div>
        </div>
    );
};

/* ─── Mini SVG Bar Chart ──────────────────────────────── */
const ActivityChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    const W = 280, H = 90, pad = 10, barW = (W - pad * 2) / data.length - 4;
    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} style={{ overflow: 'visible' }}>
            {data.map((d, i) => {
                const barH = ((d.value / max) * H) || 2;
                const x = pad + i * ((W - pad * 2) / data.length) + 2;
                return (
                    <g key={d.label}>
                        <rect x={x} y={H - barH} width={barW} height={barH} rx={3} fill="var(--accent)" opacity={0.85} />
                        <text x={x + barW / 2} y={H + 15} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="Inter,sans-serif">{d.label}</text>
                    </g>
                );
            })}
        </svg>
    );
};

/* ─── Main ────────────────────────────────────────────── */
interface Props { role: 'teacher' | 'student'; name?: string; stats: { label: string; value: string | number }[]; }

const DashboardHome: React.FC<Props> = ({ role, name = 'User', stats }) => {
    const [quoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
    const quote = QUOTES[quoteIdx];

    const chartData = role === 'teacher'
        ? [{ label: 'Mon', value: 4 }, { label: 'Tue', value: 7 }, { label: 'Wed', value: 3 }, { label: 'Thu', value: 9 }, { label: 'Fri', value: 6 }, { label: 'Sat', value: 2 }, { label: 'Sun', value: 5 }]
        : [{ label: 'Wk1', value: 2 }, { label: 'Wk2', value: 5 }, { label: 'Wk3', value: 3 }, { label: 'Wk4', value: 7 }, { label: 'Wk5', value: 4 }, { label: 'Wk6', value: 8 }];

    return (
        <div>
            {/* ─ Hero banner ─ */}
            <div className="card" style={{ marginBottom: '1.25rem', background: 'var(--accent)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 180, height: 180, borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '60px', width: 120, height: 120, borderRadius: '50%', background: 'rgba(0,0,0,0.04)' }} />
                <h1 style={{ fontSize: '1.625rem', marginBottom: '0.25rem', position: 'relative' }}>Good morning, {name} 👋</h1>
                <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1.25rem', position: 'relative' }}>Here's what's happening today.</p>
                <blockquote style={{ borderLeft: '3px solid rgba(0,0,0,0.25)', paddingLeft: '1rem', position: 'relative' }}>
                    <p style={{ fontStyle: 'italic', fontWeight: 500, lineHeight: 1.55 }}>"{quote.text}"</p>
                    <footer style={{ fontSize: '0.8125rem', marginTop: '0.375rem', opacity: 0.65 }}>— {quote.attr}</footer>
                </blockquote>
            </div>

            {/* ─ Stat cards ─ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {stats.map(s => (
                    <div key={s.label} className="card">
                        <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>{s.label}</p>
                        <p style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* ─ Row 3: Chart + Sticky Notes ─ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="card">
                    <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>{role === 'teacher' ? 'Submissions this week' : 'Assignments completed'}</p>
                    <ActivityChart data={chartData} />
                </div>
                <StickyNotes />
            </div>

            {/* ─ Row 4: Pomodoro (full inline) + YouTube (full inline) ─ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Pomodoro — full size, live state via context */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.75rem 1.25rem', gap: '0' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', alignSelf: 'flex-start', marginBottom: '1.25rem' }}>⏱ Pomodoro Timer</p>
                    <PomodoroFace size="lg" />
                </div>

                {/* YouTube — full size, live state via context */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 22, height: 22, background: '#FF0000', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '0.6rem', fontWeight: 900 }}>▶</span>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>YouTube Player</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>Stays playing as you navigate</p>
                    </div>
                    <YouTubeFace size="lg" />
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
