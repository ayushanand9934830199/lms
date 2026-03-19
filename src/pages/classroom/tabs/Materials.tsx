import React, { useState, useMemo } from 'react';
import {
    Plus, ChevronRight, ChevronDown, FileText, Link, Video,
    X, ArrowLeft, ExternalLink, ChevronLeft, Play, CheckCircle,
} from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';

/* ─── Types ──────────────────────────────────────────── */
interface Material { id: number; title: string; type: 'file' | 'link' | 'video'; url: string; }
interface Subtopic { name: string; materials: Material[]; }
interface Topic { name: string; subtopics: Subtopic[]; }

const INITIAL: Topic[] = [
    {
        name: 'Week 1 — Introduction',
        subtopics: [
            {
                name: 'Behavioural Economics Overview', materials: [
                    { id: 1, title: 'What is Behavioural Econ? (Slides)', type: 'file', url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1' },
                    { id: 2, title: 'Dan Ariely — TED Talk', type: 'video', url: 'https://www.youtube.com/embed/9X68dm92HVI' },
                ]
            },
            {
                name: 'Core Concepts', materials: [
                    { id: 3, title: 'Kahneman Reading (PDF)', type: 'file', url: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1' },
                    { id: 4, title: 'Loss Aversion Explainer', type: 'link', url: 'https://en.wikipedia.org/wiki/Loss_aversion' },
                ]
            },
        ],
    },
    {
        name: 'Week 2 — Market Failures',
        subtopics: [
            {
                name: 'Externalities', materials: [
                    { id: 5, title: 'Coase Theorem (Wikipedia)', type: 'link', url: 'https://en.wikipedia.org/wiki/Coase_theorem' },
                    { id: 6, title: 'Externalities Lecture Video', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
                ]
            },
        ],
    },
];

const ICONS = { file: FileText, link: Link, video: Video };
const TYPE_COLOR: Record<string, string> = { file: '#FEF3C7', link: '#DBEAFE', video: '#FCE7F3' };
const TYPE_TEXT: Record<string, string> = { file: '#92400E', link: '#1E40AF', video: '#9D174D' };

/* ─── Flat list helper ────────────────────────────────── */
function flatList(topics: Topic[]) {
    const items: Array<{ mat: Material; topicName: string; subName: string }> = [];
    topics.forEach(t => t.subtopics.forEach(s => s.materials.forEach(m => items.push({ mat: m, topicName: t.name, subName: s.name }))));
    return items;
}

/* ─── Viewer frame ───────────────────────────────────── */
const Viewer: React.FC<{
    mat: Material;
    flat: ReturnType<typeof flatList>;
    idx: number;
    onNavigate: (id: number) => void;
    onClose: () => void;
    done: Set<number>;
    markDone: (id: number) => void;
}> = ({ mat, flat, idx, onNavigate, onClose, done, markDone }) => {
    const prev = flat[idx - 1];
    const next = flat[idx + 1];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, height: 'calc(100vh - 220px)', minHeight: 520, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>

            {/* ── Left: main viewer ── */}
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                {/* breadcrumb toolbar */}
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
                    <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', padding: 0 }}>
                        <ArrowLeft size={14} /> Materials
                    </button>
                    <ChevronRight size={12} style={{ color: 'var(--border)' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{flat[idx].topicName}</span>
                    <ChevronRight size={12} style={{ color: 'var(--border)' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mat.title}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {mat.type !== 'video' && (
                            <a href={mat.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
                                <ExternalLink size={13} /> Open externally
                            </a>
                        )}
                    </div>
                </div>

                {/* content area */}
                <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: mat.type === 'video' ? '#000' : '#fff' }}>
                    {mat.type === 'video' && (
                        <iframe src={mat.url} style={{ width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    )}
                    {mat.type === 'link' && (
                        <iframe src={mat.url} style={{ width: '100%', height: '100%', border: 'none' }} title={mat.title}
                            sandbox="allow-scripts allow-same-origin allow-popups" />
                    )}
                    {mat.type === 'file' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                            <FileText size={48} style={{ opacity: 0.3 }} />
                            <p style={{ fontWeight: 600, fontSize: '1rem' }}>{mat.title}</p>
                            <a href={mat.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                <ExternalLink size={14} /> Open File
                            </a>
                        </div>
                    )}
                </div>

                {/* bottom nav bar */}
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
                    <button disabled={!prev} onClick={() => prev && onNavigate(prev.mat.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: '#fff', cursor: prev ? 'pointer' : 'default', opacity: prev ? 1 : 0.35, fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 600 }}>
                        <ChevronLeft size={14} /> Previous
                    </button>

                    <button
                        onClick={() => markDone(mat.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${done.has(mat.id) ? '#6EE7B7' : 'var(--border-light)'}`, background: done.has(mat.id) ? '#ECFDF5' : '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: done.has(mat.id) ? '#065F46' : 'var(--text)', transition: 'all 0.2s' }}>
                        <CheckCircle size={14} /> {done.has(mat.id) ? 'Completed!' : 'Mark complete'}
                    </button>

                    <button disabled={!next} onClick={() => next && onNavigate(next.mat.id)}
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', border: 'none', background: next ? 'var(--accent)' : 'var(--bg-tertiary)', cursor: next ? 'pointer' : 'default', opacity: next ? 1 : 0.4, fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 700 }}>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* ── Right: Up Next sidebar ── */}
            <div style={{ borderLeft: '1px solid var(--border-light)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: '0.875rem' }}>
                    Course Content <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({done.size}/{flat.length} done)</span>
                </div>

                {/* progress bar */}
                <div style={{ height: 3, background: 'var(--border-light)' }}>
                    <div style={{ height: '100%', width: `${(done.size / flat.length) * 100}%`, background: 'var(--accent)', transition: 'width 0.4s' }} />
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {flat.map((item, i) => {
                        const isActive = item.mat.id === mat.id;
                        const isDone = done.has(item.mat.id);

                        return (
                            <button key={item.mat.id} onClick={() => onNavigate(item.mat.id)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '0.625rem 1rem',
                                    background: isActive ? 'var(--accent)' : 'transparent',
                                    border: 'none', borderBottom: '1px solid var(--border-light)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem',
                                    fontFamily: 'Inter,sans-serif', transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {/* index / done indicator */}
                                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${isDone ? '#6EE7B7' : isActive ? 'rgba(0,0,0,0.3)' : 'var(--border-light)'}`, background: isDone ? '#ECFDF5' : isActive ? 'rgba(0,0,0,0.12)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.625rem', fontWeight: 700, color: isDone ? '#059669' : 'var(--text-muted)' }}>
                                    {isDone ? <CheckCircle size={11} style={{ color: '#059669' }} /> : i + 1}
                                </div>

                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{item.mat.title}</p>
                                    <p style={{ fontSize: '0.6875rem', color: isActive ? 'rgba(0,0,0,0.55)' : 'var(--text-muted)', marginTop: '0.1rem' }}>{item.subName}</p>
                                </div>

                                <div style={{ padding: '0.15rem 0.4rem', borderRadius: 99, background: TYPE_COLOR[item.mat.type], color: TYPE_TEXT[item.mat.type], fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.04em', flexShrink: 0 }}>
                                    {item.mat.type === 'video' ? <Play size={9} style={{ display: 'inline' }} /> : item.mat.type.toUpperCase()}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Materials Component ───────────────────────── */
const ClassroomMaterials: React.FC<{ classroom: Classroom; role: string }> = ({ role }) => {
    const [topics, setTopics] = useState<Topic[]>(INITIAL);
    const [openT, setOpenT] = useState<Record<string, boolean>>({ 'Week 1 — Introduction': true });
    const [adding, setAdding] = useState(false);
    const [viewId, setViewId] = useState<number | null>(null);
    const [done, setDone] = useState<Set<number>>(new Set());

    const flat = useMemo(() => flatList(topics), [topics]);
    const viewItem = flat.find(f => f.mat.id === viewId);
    const viewIdx = flat.findIndex(f => f.mat.id === viewId);

    // Add-material form
    const [mTopic, setMTopic] = useState('');
    const [mSub, setMSub] = useState('');
    const [mTitle, setMTitle] = useState('');
    const [mType, setMType] = useState<'file' | 'link' | 'video'>('link');
    const [mUrl, setMUrl] = useState('');

    const addMaterial = () => {
        if (!mTitle || !mTopic || !mUrl) return;
        const mat: Material = { id: Date.now(), title: mTitle, type: mType, url: mUrl };
        setTopics(ts => {
            const copy = JSON.parse(JSON.stringify(ts)) as Topic[];
            let topic = copy.find(t => t.name === mTopic);
            if (!topic) { topic = { name: mTopic, subtopics: [] }; copy.push(topic); }
            let sub = topic.subtopics.find(s => s.name === mSub);
            if (!sub) { sub = { name: mSub || 'General', materials: [] }; topic.subtopics.push(sub); }
            sub.materials.push(mat);
            return copy;
        });
        setAdding(false);
        setMTitle(''); setMTopic(''); setMSub(''); setMUrl('');
    };

    const markDone = (id: number) => setDone(d => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });

    /* ── Viewer mode ── */
    if (viewId !== null && viewItem) {
        return (
            <Viewer
                mat={viewItem.mat}
                flat={flat}
                idx={viewIdx}
                onNavigate={setViewId}
                onClose={() => setViewId(null)}
                done={done}
                markDone={markDone}
            />
        );
    }

    /* ── Tree mode ── */
    return (
        <div style={{ maxWidth: 820 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                {/* progress summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 120, height: 5, background: 'var(--bg-tertiary)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${flat.length ? (done.size / flat.length) * 100 : 0}%`, background: 'var(--accent)', transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{done.size}/{flat.length} completed</span>
                </div>
                {role === 'teacher' && (
                    <button className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={15} /> Add Material</button>
                )}
            </div>

            {/* Add material modal */}
            {adding && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div className="card" style={{ width: 460, position: 'relative' }}>
                        <button className="btn btn-ghost" style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.2rem' }} onClick={() => setAdding(false)}><X size={15} /></button>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Add Material</h3>
                        <div className="field"><label className="label">Topic *</label><input className="input" placeholder="e.g. Week 1 — Introduction" value={mTopic} onChange={e => setMTopic(e.target.value)} list="topics-dl" /><datalist id="topics-dl">{topics.map(t => <option key={t.name} value={t.name} />)}</datalist></div>
                        <div className="field"><label className="label">Sub-topic (optional)</label><input className="input" placeholder="e.g. Core Concepts" value={mSub} onChange={e => setMSub(e.target.value)} /></div>
                        <div className="field"><label className="label">Title *</label><input className="input" placeholder="e.g. Chapter 1 Slides" value={mTitle} onChange={e => setMTitle(e.target.value)} /></div>
                        <div className="field"><label className="label">Type</label>
                            <select className="input" value={mType} onChange={e => setMType(e.target.value as any)}>
                                <option value="link">Link / URL</option>
                                <option value="file">File (PDF / doc)</option>
                                <option value="video">YouTube Embed</option>
                            </select>
                        </div>
                        <div className="field" style={{ marginBottom: '1.5rem' }}><label className="label">URL *</label><input className="input" placeholder="https://…" value={mUrl} onChange={e => setMUrl(e.target.value)} /></div>
                        <div className="flex justify-end gap-2">
                            <button className="btn btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={addMaterial}>Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Topic tree */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {topics.map(topic => (
                    <div key={topic.name} className="card" style={{ padding: '1rem' }}>
                        <button onClick={() => setOpenT(o => ({ ...o, [topic.name]: !o[topic.name] }))}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '1rem', textAlign: 'left', padding: 0 }}>
                            {openT[topic.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            {topic.name}
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                                {topic.subtopics.reduce((a, s) => a + s.materials.length, 0)} items
                            </span>
                        </button>

                        {openT[topic.name] && (
                            <div style={{ marginTop: '0.875rem', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {topic.subtopics.map(sub => (
                                    <div key={sub.name}>
                                        {sub.name && <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{sub.name}</p>}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                            {sub.materials.map(mat => {
                                                const Icon = ICONS[mat.type];
                                                const isDone = done.has(mat.id);
                                                return (
                                                    <button key={mat.id} onClick={() => setViewId(mat.id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: isDone ? '#F0FDF4' : 'var(--bg-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textDecoration: 'none', color: 'inherit', border: `1px solid ${isDone ? '#6EE7B7' : 'transparent'}`, fontFamily: 'Inter,sans-serif', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                                                        onMouseEnter={e => !isDone && (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                                                        onMouseLeave={e => !isDone && (e.currentTarget.style.background = 'var(--bg-secondary)')}>
                                                        <Icon size={14} style={{ color: isDone ? '#059669' : 'var(--text-muted)', flexShrink: 0 }} />
                                                        <span style={{ flex: 1 }}>{mat.title}</span>
                                                        {isDone && <CheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} />}
                                                        <span style={{ padding: '0.125rem 0.4rem', borderRadius: 99, background: TYPE_COLOR[mat.type], color: TYPE_TEXT[mat.type], fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>{mat.type}</span>
                                                        <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassroomMaterials;
