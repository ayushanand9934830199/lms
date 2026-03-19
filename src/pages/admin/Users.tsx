import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Phone, Linkedin, MoreVertical, Plus, X } from 'lucide-react';

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

    // Modal state
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('student');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        // Generate a random temporary password for the invitee
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

        const { error: signUpError } = await supabase.auth.signUp({
            email: newEmail,
            password: tempPassword,
            options: {
                data: {
                    full_name: newName,
                    role: newRole
                }
            }
        });

        if (signUpError) {
            setSubmitError(signUpError.message);
            setIsSubmitting(false);
            return;
        }

        setSubmitSuccess('User invited successfully! They will receive a confirmation email.');
        // Refresh the user list after a short delay for trigger to fire
        setTimeout(() => {
            fetchUsers();
            setIsSubmitting(false);
            setNewName('');
            setNewEmail('');
            setNewRole('student');
            setTimeout(() => {
                setIsAddingUser(false);
                setSubmitSuccess('');
            }, 1500);
        }, 800);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading live data...</div>;

    const roleColors: Record<string, string> = {
        'admin': 'badge-purple',
        'teacher': 'badge-blue',
        'student': 'badge-gray'
    };

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Manage Users</h1>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="text-sm" style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                        <strong>{users.length}</strong> Total Registered
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
                        onClick={() => setIsAddingUser(true)}
                    >
                        <Plus size={16} /> Add User
                    </button>
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

            {/* Add User Modal */}
            {isAddingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '420px',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Create New User</h3>
                            <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setIsAddingUser(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} style={{ padding: '1.5rem' }}>
                            {submitError && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>{submitError}</div>}
                            {submitSuccess && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>{submitSuccess}</div>}

                            <div className="field" style={{ marginBottom: '1rem' }}>
                                <label className="label">Full Name</label>
                                <input required type="text" className="input" placeholder="John Doe" value={newName} onChange={e => setNewName(e.target.value)} disabled={isSubmitting} />
                            </div>

                            <div className="field" style={{ marginBottom: '1rem' }}>
                                <label className="label">Email Address</label>
                                <input required type="email" className="input" placeholder="john@example.edu" value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={isSubmitting} />
                            </div>

                            <div className="field" style={{ marginBottom: '1.5rem' }}>
                                <label className="label">System Role</label>
                                <select required className="input" value={newRole} onChange={e => setNewRole(e.target.value)} disabled={isSubmitting}>
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setIsAddingUser(false)} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Send Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
