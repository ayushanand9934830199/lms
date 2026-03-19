import React, { useState, useRef, useEffect } from 'react';
import { Youtube, X, Minimize2, Maximize2, Music } from 'lucide-react';
import { useAppWidgets } from '../context/AppWidgetContext';

/* ── Shared YouTube player face (embed + URL input) ── */
export const YouTubeFace: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => {
    const { yt } = useAppWidgets();
    const { input, embedUrl, error, portalNode, setInput, loadVideo, clearVideo } = yt;
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const large = size === 'lg';

    useEffect(() => {
        if (!embedUrl) inputRef.current?.focus();
    }, [embedUrl]);

    // Attach the persistent iframe's container to this instance of the widget!
    // Since React Router instantly mounts this widget and unmounts the old one on navigation,
    // the portalNode just moves here without unmounting the iframe inside it.
    useEffect(() => {
        if (!portalNode || !containerRef.current || !embedUrl) return;
        const parent = containerRef.current;
        parent.appendChild(portalNode);
        return () => {
            // Unmount: we don't strictly need to remove it manually if another component steals it,
            // but for safety we can leave it. Actually, better to just let it be stolen.
            // If we remove it here, it might flash gone before the new page mounts.
        };
    }, [portalNode, embedUrl]);

    const frameH = large ? 280 : 190;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Video frame DOM container */}
            <div style={{
                height: embedUrl ? frameH : (large ? 180 : 100),
                background: '#111',
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
            }}>
                {/* The iframe portalNode gets injected here via the useEffect */}
                <div ref={containerRef} style={{ width: '100%', height: '100%', display: embedUrl ? 'block' : 'none' }} />

                {!embedUrl && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Music size={large ? 36 : 24} style={{ color: '#555' }} />
                        <p style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'Inter,sans-serif' }}>No video loaded</p>
                    </div>
                )}
            </div>

            {/* URL input */}
            <div style={{ padding: large ? '1rem' : '0.75rem', borderTop: '1px solid var(--border-light)', background: '#fff' }}>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); }}
                        onKeyDown={e => e.key === 'Enter' && loadVideo()}
                        placeholder="Paste any YouTube URL…"
                        style={{ flex: 1, fontFamily: 'Inter,sans-serif', fontSize: large ? '0.875rem' : '0.75rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: large ? '0.5rem 0.625rem' : '0.35rem 0.5rem', outline: 'none' }}
                    />
                    <button onClick={loadVideo}
                        style={{ padding: large ? '0.5rem 0.875rem' : '0.35rem 0.625rem', background: '#FF0000', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: large ? '0.875rem' : '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Load
                    </button>
                    {embedUrl && (
                        <button onClick={clearVideo} title="Clear video"
                            style={{ padding: large ? '0.5rem' : '0.35rem', background: 'none', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <X size={13} />
                        </button>
                    )}
                </div>
                {error && <p style={{ fontSize: '0.6875rem', color: '#ef4444', marginTop: '0.3rem' }}>{error}</p>}
                {!large && <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>youtube.com/watch?v=… · youtu.be/… · /shorts/…</p>}
            </div>
        </div>
    );
};

/* ── Floating widget (non-home pages) ── */
const YouTubeWidget: React.FC = () => {
    const { yt } = useAppWidgets();
    const { embedUrl } = yt;
    const [open, setOpen] = useState(false);
    const [minimized, setMin] = useState(false);

    /* Collapsed pill */
    if (!open) return (
        <div style={{ position: 'fixed', bottom: '5rem', right: '2.25rem', zIndex: 900 }}>
            <button onClick={() => setOpen(true)} title="YouTube Player"
                style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: embedUrl ? '#FF0000' : '#fff',
                    border: `1px solid ${embedUrl ? 'transparent' : 'var(--border)'}`,
                    borderRadius: 99, padding: '0.4rem 0.875rem 0.4rem 0.625rem',
                    cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 700,
                    color: embedUrl ? '#fff' : 'var(--text)',
                }}>
                <Youtube size={15} />
                {embedUrl ? '▶ Playing' : 'YouTube'}
            </button>
        </div>
    );

    /* Expanded panel */
    return (
        <div style={{ position: 'fixed', bottom: '5rem', right: '2.25rem', zIndex: 900, width: 340 }}>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                {/* header bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#FF0000', color: '#fff', flexShrink: 0 }}>
                    <Youtube size={14} />
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', flex: 1 }}>YouTube Player</span>
                    <button onClick={() => setMin(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: '0.1rem' }} title={minimized ? 'Expand' : 'Minimise'}>
                        {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                    </button>
                    <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: '0.1rem' }}>
                        <X size={13} />
                    </button>
                </div>

                <div style={{ height: minimized ? 0 : 'auto', overflow: 'hidden', transition: 'height 0.25s' }}>
                    <YouTubeFace size="sm" />
                </div>
            </div>
        </div>
    );
};

export default YouTubeWidget;
