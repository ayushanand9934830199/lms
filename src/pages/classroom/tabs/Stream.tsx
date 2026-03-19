import React, { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

interface Post { id: string; author: string; content: string; created_at: string; author_id: string; }

const ClassroomStream: React.FC<{ classroom: Classroom; role: string }> = ({ classroom, role }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    const fetchPosts = async () => {
        const { data } = await supabase
            .from('stream_posts')
            .select('id, content, created_at, author_id, profiles(full_name)')
            .eq('classroom_id', classroom.id)
            .order('created_at', { ascending: false });

        if (data) {
            setPosts(data.map((p: any) => ({
                id: p.id,
                author: p.profiles?.full_name || 'Unknown',
                content: p.content,
                created_at: p.created_at,
                author_id: p.author_id,
            })));
        }
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, [classroom.id]);

    const post = async () => {
        if (!draft.trim() || !user) return;
        setPosting(true);
        await supabase.from('stream_posts').insert({
            classroom_id: classroom.id,
            author_id: user.id,
            content: draft,
        });
        setDraft('');
        fetchPosts();
        setPosting(false);
    };

    const deletePost = async (id: string, authorId: string) => {
        if (user?.id !== authorId) return;
        if (!confirm('Delete this post?')) return;
        await supabase.from('stream_posts').delete().eq('id', id);
        fetchPosts();
    };

    const timeAgo = (ts: string) => {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
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
                        <button className="btn btn-primary" onClick={post} disabled={posting || !draft.trim()}>
                            <Send size={14} /> {posting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading stream...</div>
            ) : posts.length === 0 ? (
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No announcements yet. {role === 'teacher' ? 'Post something above to get started.' : 'Check back later.'}
                </div>
            ) : (
                <div className="flex-col gap-3">
                    {posts.map(p => (
                        <div key={p.id} className="card">
                            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                                        {p.author[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.author}</p>
                                        <p className="text-sm text-muted">{timeAgo(p.created_at)}</p>
                                    </div>
                                </div>
                                {user?.id === p.author_id && (
                                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: '#dc2626' }} onClick={() => deletePost(p.id, p.author_id)} title="Delete post">
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                            <p style={{ lineHeight: 1.65, fontSize: '0.9375rem' }}>{p.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassroomStream;
