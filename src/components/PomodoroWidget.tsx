import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, X, Pencil } from 'lucide-react';
import { useAppWidgets, MODE_LABELS, MODE_COLORS, type Mode } from '../context/AppWidgetContext';

const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ── Inline editable duration ── */
const DurationInput: React.FC<{ value: number; onChange: (m: number) => void }> = ({ value, onChange }) => {
    const [editing, setEditing] = useState(false);
    const [raw, setRaw] = useState(String(value));
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => { if (editing) ref.current?.select(); }, [editing]);

    const commit = () => {
        const n = parseInt(raw, 10);
        if (!isNaN(n) && n > 0) onChange(n);
        else setRaw(String(value));
        setEditing(false);
    };

    if (editing) return (
        <input ref={ref} type="number" min={1} value={raw}
            onChange={e => setRaw(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            style={{ width: 44, textAlign: 'center', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: 6, padding: '0.1rem 0.2rem', outline: 'none' }}
        />
    );
    return (
        <button onClick={() => { setRaw(String(value)); setEditing(true); }} title="Click to change duration"
            style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.1rem' }}>
            {value}m <Pencil size={9} />
        </button>
    );
};

/* ── Shared ring + controls (used both inline & floating) ── */
export const PomodoroFace: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
    const { pomo } = useAppWidgets();
    const { mode, secs, running, durations, setMode, setDuration, toggleRunning, reset } = pomo;
    const large = size === 'lg';

    const total = durations[mode] * 60;
    const pct = ((total - secs) / total) * 100;
    const r = large ? 70 : 44;
    const circ = 2 * Math.PI * r;
    const sz = large ? 160 : 116;
    const color = MODE_COLORS[mode];
    const fs = large ? 28 : 20;
    const cy = sz / 2;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? '1rem' : '0.75rem' }}>
            {/* mode pills */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {(['work', 'short', 'long'] as Mode[]).map(m => (
                    <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                        <button onClick={() => setMode(m)} style={{
                            padding: '0.2rem 0.6rem', fontSize: large ? '0.8125rem' : '0.6875rem', fontFamily: 'Inter,sans-serif',
                            fontWeight: 600, border: '1px solid var(--border-light)', borderRadius: 99, cursor: 'pointer',
                            background: mode === m ? MODE_COLORS[m] : 'transparent', color: mode === m ? '#000' : 'var(--text-muted)', transition: 'all 0.15s',
                        }}>
                            {MODE_LABELS[m]}
                        </button>
                        <DurationInput value={durations[m]} onChange={mins => setDuration(m, mins)} />
                    </div>
                ))}
            </div>

            {/* ring */}
            <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={cy} cy={cy} r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth={large ? 9 : 7} />
                <circle cx={cy} cy={cy} r={r} fill="none" stroke={color} strokeWidth={large ? 9 : 7}
                    strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
                    style={{ transition: 'stroke-dashoffset 1s linear', strokeLinecap: 'round' }} />
                <text x={cy} y={cy - (large ? 8 : 4)} textAnchor="middle" dominantBaseline="central"
                    style={{ fill: 'var(--text)', fontFamily: 'Inter,sans-serif', fontWeight: 800, fontSize: fs, transform: `rotate(90deg)`, transformOrigin: `${cy}px ${cy}px` }}>
                    {fmt(secs)}
                </text>
                <text x={cy} y={cy + (large ? 14 : 11)} textAnchor="middle" dominantBaseline="central"
                    style={{ fill: 'var(--text-muted)', fontFamily: 'Inter,sans-serif', fontWeight: 500, fontSize: large ? 10 : 8, transform: `rotate(90deg)`, transformOrigin: `${cy}px ${cy}px` }}>
                    {MODE_LABELS[mode].toUpperCase()} · {durations[mode]}m
                </text>
            </svg>

            {/* controls */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button onClick={toggleRunning}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: large ? '0.625rem 1.5rem' : '0.5rem 1.25rem', borderRadius: 99, border: 'none', background: color, fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: large ? '1rem' : '0.875rem', cursor: 'pointer' }}>
                    {running ? <><Pause size={large ? 16 : 13} /> Pause</> : <><Play size={large ? 16 : 13} /> Start</>}
                </button>
                <button onClick={reset}
                    style={{ padding: large ? '0.625rem 0.75rem' : '0.5rem', borderRadius: 99, border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <RotateCcw size={large ? 16 : 14} />
                </button>
            </div>
        </div>
    );
};

/* ── Floating widget (non-home pages) ── */
const PomodoroWidget: React.FC = () => {
    const { pomo } = useAppWidgets();
    const { secs, running, mode } = pomo;
    const color = MODE_COLORS[mode];
    const [open, setOpen] = useState(false);

    const pill = (
        <button onClick={() => setOpen(true)} title="Pomodoro Timer"
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: running ? color : '#fff',
                border: `1px solid ${running ? 'transparent' : 'var(--border)'}`,
                borderRadius: 99, padding: '0.4rem 0.875rem 0.4rem 0.625rem',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 700,
                color: running ? '#000' : 'var(--text)', transition: 'all 0.2s', letterSpacing: '-0.01em',
            }}>
            <Timer size={15} style={{ opacity: 0.7 }} />
            {fmt(secs)}
            {running && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />}
        </button>
    );

    const panel = (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.16)', padding: '1.25rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, fontSize: '0.9375rem' }}>
                    <Timer size={15} /> Pomodoro
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
            <PomodoroFace size="sm" />
        </div>
    );

    return (
        <div style={{ position: 'fixed', bottom: '2.25rem', right: '2.25rem', zIndex: 900, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            {open ? panel : pill}
        </div>
    );
};

export default PomodoroWidget;
