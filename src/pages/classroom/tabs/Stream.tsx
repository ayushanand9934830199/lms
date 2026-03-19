import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';

interface Post { id: number; author: string; content: string; time: string; }

const MOCK_POSTS: Post[] = [
    { id: 1, author: 'Prof. Mehta', content: 'Welcome to Economics Batch A! Please review the syllabus under Materials before our first session.', time: '2 days ago' },
    { id: 2, author: 'Prof. Mehta', content: 'Assignment 1 is now live — submit by March 25. Reach out on the stream if you have questions.', time: '1 day ago' },
];

const ClassroomStream: React.FC<{ classroom: Classroom; role: string }> = ({ role }) => {
    const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
    const [draft, setDraft] = useState('');

    const post = () => {
        if (!draft.trim()) return;
        setPosts(p => [{ id: Date.now(), author: 'You', content: draft, time: 'Just now' }, ...p]);
        setDraft('');
    };

    return (
        <div style={{ maxWidth: 680 }}>
            {/* Compose box — teacher only */}
            {role === 'teacher' && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <textarea
                        className="input"
                        style={{ minHeight: 80, marginBottom: '0.875rem', resize: 'none' }}
                        placeholder="Announce something to your class…"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button className="btn btn-ghost"><Paperclip size={14} /> Attach</button>
                        <button className="btn btn-primary" onClick={post}><Send size={14} /> Post</button>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div className="flex-col gap-3">
                {posts.map(p => (
                    <div key={p.id} className="card">
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                            <div className="flex items-center gap-3">
                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                                    {p.author[0]}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.author}</p>
                                    <p className="text-sm text-muted">{p.time}</p>
                                </div>
                            </div>
                        </div>
                        <p style={{ lineHeight: 1.65, fontSize: '0.9375rem' }}>{p.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClassroomStream;
