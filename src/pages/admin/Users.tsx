import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Phone, Linkedin, MoreVertical } from 'lucide-react';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    whatsapp: string | null;
    linkedin_url: string | null;
    created_at: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) setUsers(data);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading live data...</div>;

    const roleColors: Record<string, string> = {
        'admin': 'badge-purple',
        'admissions_head': 'badge-yellow',
        'admissions_associate': 'badge-blue',
        'applicant': 'badge-gray'
    };

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Manage Users</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="text-sm" style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                        <strong>{users.length}</strong> Total Registered
                    </div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>User</th>
                            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</th>
                            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact</th>
                            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Joined</th>
                            <th style={{ padding: '0.875rem 1rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{u.full_name || 'Anonymous'}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8125rem' }}>{u.email}</div>
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <span className={`badge ${roleColors[u.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                                        {u.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '0.875rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {u.whatsapp && <a href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)' }}><Phone size={14} /></a>}
                                        {u.linkedin_url && <a href={u.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#0077b5' }}><Linkedin size={14} /></a>}
                                        {!u.whatsapp && !u.linkedin_url && <span className="text-muted">—</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }}><MoreVertical size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found in database.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
