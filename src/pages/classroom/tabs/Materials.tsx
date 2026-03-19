import React, { useEffect, useState, useMemo } from 'react';
import {
    Plus, ChevronRight, ChevronDown, FileText, Link, Video,
    X, ArrowLeft, ExternalLink, ChevronLeft, Play, CheckCircle, Trash2,
} from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';
import { supabase } from '../../../lib/supabase';

/* ─── Types ──────────────────────────────────────────── */
interface Material { id: string; title: string; type: 'file' | 'link' | 'video'; url: string; topic: string; subtopic: string; }
interface Topic { name: string; subtopics: { name: string; materials: Material[] }[]; }

const ICONS = { file: FileText, link: Link, video: Video };
const TYPE_COLOR: Record<string, string> = { file: '#FEF3C7', link: '#DBEAFE', video: '#FCE7F3' };
const TYPE_TEXT: Record<string, string> = { file: '#92400E', link: '#1E40AF', video: '#9D174D' };

function groupMaterials(mats: Material[]): Topic[] {
    const map: Record<string, Record<string, Material[]>> = {};
    for (const m of mats) {
        if (!map[m.topic]) map[m.topic] = {};
        const sub = m.subtopic || 'General';
        if (!map[m.topic][sub]) map[m.topic][sub] = [];
        map[m.topic][sub].push(m);
    }
    return Object.entries(map).map(([name, subs]) => ({
        name,
        subtopics: Object.entries(subs).map(([subName, materials]) => ({ name: subName, materials })),
    }));
}

/* ─── Viewer frame ───────────────────────────────────── */
const Viewer: React.FC<{
    mat: Material; flat: Material[]; idx: number;
    onNavigate: (id: string) => void; onClose: () => void;
    done: Set<string>; markDone: (id: string) => void;
}> = ({ mat, flat, idx, onNavigate, onClose, done, markDone }) => {
    const prev = flat[idx - 1];
    const next = flat[idx + 1];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, height: 'calc(100vh - 220px)', minHeight: 520, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
                    <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', padding: 0 }}>
                        <ArrowLeft size={14} /> Materials
                    </button>
                    <ChevronRight size={12} style={{ color: 'var(--border)' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{mat.topic}</span>
                    <ChevronRight size={12} style={{ color: 'var(--border)' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{mat.title}</span>
                    {mat.type !== 'video' && (
                        <a href={mat.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
                            <ExternalLink size={13} /> Open externally
                        </a>
                    )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden', background: mat.type === 'video' ? '#000' : '#fff' }}>
                    {mat.type === 'video' && <iframe src={mat.url} style={{ width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                    {mat.type === 'link' && <iframe src={mat.url} style={{ width: '100%', height: '100%', border: 'none' }} title={mat.title} sandbox="allow-scripts allow-same-origin allow-popups" />}
                    {mat.type === 'file' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                            <FileText size={48} style={{ opacity: 0.3 }} />
                            <p style={{ fontWeight: 600 }}>{mat.title}</p>
                            <a href={mat.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><ExternalLink size={14} /> Open File</a>
                        </div>
                    )}
                </div>
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
                    <button disabled={!prev} onClick={() => prev && onNavigate(prev.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: '#fff', cursor: prev ? 'pointer' : 'default', opacity: prev ? 1 : 0.35, fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 600 }}>
                        <ChevronLeft size={14} /> Previous
                    </button>
                    <button onClick={() => markDone(mat.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', border: `1px solid ${done.has(mat.id) ? '#6EE7B7' : 'var(--border-light)'}`, background: done.has(mat.id) ? '#ECFDF5' : '#fff', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 600, color: done.has(mat.id) ? '#065F46' : 'var(--text)' }}>
                        <CheckCircle size={14} /> {done.has(mat.id) ? 'Completed!' : 'Mark complete'}
                    </button>
                    <button disabled={!next} onClick={() => next && onNavigate(next.id)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-sm)', border: 'none', background: next ? 'var(--accent)' : 'var(--bg-tertiary)', cursor: next ? 'pointer' : 'default', opacity: next ? 1 : 0.4, fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 700 }}>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-light)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: '0.875rem' }}>
                    Course Content <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({done.size}/{flat.length} done)</span>
                </div>
                <div style={{ height: 3, background: 'var(--border-light)' }}>
                    <div style={{ height: '100%', width: `${flat.length ? (done.size / flat.length) * 100 : 0}%`, background: 'var(--accent)', transition: 'width 0.4s' }} />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {flat.map((item, i) => {
                        const isActive = item.id === mat.id;
                        const isDone = done.has(item.id);
                        return (
                            <button key={item.id} onClick={() => onNavigate(item.id)} style={{ width: '100%', textAlign: 'left', padding: '0.625rem 1rem', background: isActive ? 'var(--accent)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem', fontFamily: 'Inter,sans-serif', transition: 'background 0.15s' }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${isDone ? '#6EE7B7' : isActive ? 'rgba(0,0,0,0.3)' : 'var(--border-light)'}`, background: isDone ? '#ECFDF5' : isActive ? 'rgba(0,0,0,0.12)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.625rem', fontWeight: 700, color: isDone ? '#059669' : 'var(--text-muted)' }}>
                                    {isDone ? <CheckCircle size={11} style={{ color: '#059669' }} /> : i + 1}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.subtopic}</p>
                                </div>
                                <div style={{ padding: '0.15rem 0.4rem', borderRadius: 99, background: TYPE_COLOR[item.type], color: TYPE_TEXT[item.type], fontSize: '0.5625rem', fontWeight: 700, flexShrink: 0 }}>
                                    {item.type === 'video' ? <Play size={9} style={{ display: 'inline' }} /> : item.type.toUpperCase()}
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
const ClassroomMaterials: React.FC<{ classroom: Classroom; role: string }> = ({ classroom, role }) => {
    const [mats, setMats] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [openT, setOpenT] = useState<Record<string, boolean>>({});
    const [adding, setAdding] = useState(false);
    const [viewId, setViewId] = useState<string | null>(null);
    const [done, setDone] = useState<Set<string>>(new Set());

    const [mTopic, setMTopic] = useState('');
    const [mSub, setMSub] = useState('');
    const [mTitle, setMTitle] = useState('');
    const [mType, setMType] = useState<'file' | 'link' | 'video'>('link');
    const [mUrl, setMUrl] = useState('');

    const fetchMaterials = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('materials')
            .select('*')
            .eq('classroom_id', classroom.id)
            .order('created_at');
        if (data) setMats(data as Material[]);
        setLoading(false);
    };

    useEffect(() => { fetchMaterials(); }, [classroom.id]);

    const topics = useMemo(() => groupMaterials(mats), [mats]);
    const flat = useMemo(() => mats, [mats]);
    const viewItem = flat.find(f => f.id === viewId);
    const viewIdx = flat.findIndex(f => f.id === viewId);

    const addMaterial = async () => {
        if (!mTitle || !mTopic || !mUrl) return;
        await supabase.from('materials').insert({
            classroom_id: classroom.id,
            topic: mTopic,
            subtopic: mSub || 'General',
            title: mTitle,
            type: mType,
            url: mUrl,
        });
        setAdding(false);
        setMTitle(''); setMTopic(''); setMSub(''); setMUrl('');
        fetchMaterials();
    };

    const deleteMaterial = async (id: string) => {
        if (!confirm('Delete this material?')) return;
        await supabase.from('materials').delete().eq('id', id);
        fetchMaterials();
    };

    const markDone = (id: string) => setDone(d => { const n = new Set(d); n.has(id) ? n.delete(id) : n.add(id); return n; });

    if (viewId !== null && viewItem) {
        return <Viewer mat={viewItem} flat={flat} idx={viewIdx} onNavigate={setViewId} onClose={() => setViewId(null)} done={done} markDone={markDone} />;
    }

    return (
        <div style={{ maxWidth: 820 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading materials...</div>
            ) : topics.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No materials yet.{role === 'teacher' ? ' Click "Add Material" to upload the first resource.' : ' Your teacher hasn\'t added any materials yet.'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {topics.map(topic => (
                        <div key={topic.name} className="card" style={{ padding: '1rem' }}>
                            <button onClick={() => setOpenT(o => ({ ...o, [topic.name]: !o[topic.name] }))} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: '1rem', textAlign: 'left', padding: 0 }}>
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
                                            {sub.name && sub.name !== 'General' && <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{sub.name}</p>}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                {sub.materials.map(mat => {
                                                    const Icon = ICONS[mat.type];
                                                    const isDone = done.has(mat.id);
                                                    return (
                                                        <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <button onClick={() => setViewId(mat.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: isDone ? '#F0FDF4' : 'var(--bg-secondary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left', color: 'inherit', border: `1px solid ${isDone ? '#6EE7B7' : 'transparent'}`, fontFamily: 'Inter,sans-serif' }}>
                                                                <Icon size={14} style={{ color: isDone ? '#059669' : 'var(--text-muted)', flexShrink: 0 }} />
                                                                <span style={{ flex: 1 }}>{mat.title}</span>
                                                                {isDone && <CheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} />}
                                                                <span style={{ padding: '0.125rem 0.4rem', borderRadius: 99, background: TYPE_COLOR[mat.type], color: TYPE_TEXT[mat.type], fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>{mat.type}</span>
                                                            </button>
                                                            {role === 'teacher' && (
                                                                <button className="btn btn-ghost" style={{ padding: '0.3rem', color: '#dc2626', flexShrink: 0 }} onClick={() => deleteMaterial(mat.id)} title="Delete material">
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            )}
                                                        </div>
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
            )}
        </div>
    );
};

export default ClassroomMaterials;
