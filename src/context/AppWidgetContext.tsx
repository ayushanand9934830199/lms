import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

/* ─── Pomodoro ──────────────────────────────────────── */
type Mode = 'work' | 'short' | 'long';
const DEFAULTS: Record<Mode, number> = { work: 25, short: 5, long: 15 };
const MODE_LABELS: Record<Mode, string> = { work: 'Focus', short: 'Short Break', long: 'Long Break' };
const MODE_COLORS: Record<Mode, string> = { work: 'var(--accent)', short: '#86efac', long: '#93c5fd' };

export { MODE_LABELS, MODE_COLORS };
export type { Mode };

interface PomodoroCtx {
    mode: Mode;
    secs: number;
    running: boolean;
    durations: Record<Mode, number>;
    setMode: (m: Mode) => void;
    setDuration: (m: Mode, mins: number) => void;
    toggleRunning: () => void;
    reset: () => void;
}

/* ─── YouTube ───────────────────────────────────────── */
export function toEmbedUrl(raw: string): string | null {
    try {
        const url = new URL(raw.trim());
        let id = '';
        if (url.hostname.includes('youtu.be')) {
            id = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
            if (url.pathname.startsWith('/embed/')) return raw.trim();
            id = url.searchParams.get('v') || '';
            const shorts = url.pathname.match(/\/shorts\/([^/?]+)/);
            if (shorts) id = shorts[1];
        }
        const clean = id.split('?')[0].split('&')[0];
        // autoplay=1 keeps it playing when we move it around, rel=0 hides related
        return clean ? `https://www.youtube.com/embed/${clean}?rel=0&autoplay=1` : null;
    } catch {
        return null;
    }
}

interface YouTubeCtx {
    input: string;
    embedUrl: string | null;
    error: string;
    // The DOM node holding the actual iframe
    portalNode: HTMLElement | null;
    setInput: (v: string) => void;
    loadVideo: () => void;
    clearVideo: () => void;
}

/* ─── Combined Context ──────────────────────────────── */
interface AppWidgetCtx {
    pomo: PomodoroCtx;
    yt: YouTubeCtx;
}

const AppWidgetContext = createContext<AppWidgetCtx | null>(null);

export const useAppWidgets = () => {
    const ctx = useContext(AppWidgetContext);
    if (!ctx) throw new Error('useAppWidgets must be used inside AppWidgetProvider');
    return ctx;
};

/* ─── Provider ──────────────────────────────────────── */
export const AppWidgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    /* Pomodoro state */
    const [mode, setModeState] = useState<Mode>('work');
    const [durations, setDurations] = useState<Record<Mode, number>>(DEFAULTS);
    const [secs, setSecs] = useState(DEFAULTS.work * 60);
    const [running, setRunning] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const setMode = (m: Mode) => {
        setModeState(m);
        setSecs(durations[m] * 60);
        setRunning(false);
    };

    const setDuration = (m: Mode, mins: number) => {
        setDurations(d => ({ ...d, [m]: mins }));
        if (m === mode) { setSecs(mins * 60); setRunning(false); }
    };

    const toggleRunning = () => setRunning(r => !r);
    const reset = () => { setSecs(durations[mode] * 60); setRunning(false); };

    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() =>
                setSecs(s => {
                    if (s <= 1) { clearInterval(timerRef.current!); setRunning(false); return 0; }
                    return s - 1;
                }), 1000);
        } else if (timerRef.current) clearInterval(timerRef.current);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [running]);

    /* YouTube state */
    const [input, setInput] = useState('');
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Create a detached DOM node once
    const [portalNode] = useState(() => {
        if (typeof document === 'undefined') return null;
        const el = document.createElement('div');
        el.style.width = '100%';
        el.style.height = '100%';
        return el;
    });

    const loadVideo = () => {
        const url = toEmbedUrl(input);
        if (url) { setEmbedUrl(url); setError(''); }
        else setError('Paste a valid YouTube link (youtube.com or youtu.be)');
    };

    const clearVideo = () => { setEmbedUrl(null); setInput(''); setError(''); };

    // The actual iframe element that we will portal into `portalNode`
    const iframeContent = embedUrl ? (
        <iframe
            src={embedUrl}
            width="100%" height="100%"
            style={{ display: 'block', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    ) : null;

    return (
        <AppWidgetContext.Provider value={{
            pomo: { mode, secs, running, durations, setMode, setDuration, toggleRunning, reset },
            yt: { input, embedUrl, error, portalNode, setInput, loadVideo, clearVideo },
        }}>
            {children}

            {/* 
              We use createPortal to render the iframe INTO our detached portalNode.
              Because the Provider is high up the tree (in Layout) and never unmounts across
              page transitions, the iframe (and thus the video/audio) stays loaded.
            */}
            {portalNode && iframeContent && ReactDOM.createPortal(iframeContent, portalNode)}
        </AppWidgetContext.Provider>
    );
};
