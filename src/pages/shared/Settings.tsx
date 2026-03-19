import React, { useState } from 'react';
import { User, Lock, Bell } from 'lucide-react';

interface SettingsProps {
    role?: string;
}

const Settings: React.FC<SettingsProps> = () => {
    const [name, setName] = useState('Admin User');
    const [email, setEmail] = useState('admin@blast.edu');
    const [phone, setPhone] = useState('');
    const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile');

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h1>
            <p className="text-muted text-sm" style={{ marginBottom: '2rem' }}>Manage your account details and preferences.</p>

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0' }}>
                {([
                    { key: 'profile', label: 'Profile', icon: User },
                    { key: 'security', label: 'Security', icon: Lock },
                    { key: 'notifications', label: 'Notifications', icon: Bell },
                ] as const).map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.625rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: tab === t.key ? 600 : 400,
                            color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            marginBottom: '-1px',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <t.icon size={15} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <div style={{ maxWidth: '560px' }}>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Personal Information</h3>
                        <div className="field">
                            <label className="label">Full Name</label>
                            <input className="input" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="label">Email Address</label>
                            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="field" style={{ marginBottom: 0 }}>
                            <label className="label">Phone / WhatsApp</label>
                            <input className="input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Profile Photo</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>A</div>
                            <div>
                                <button className="btn btn-secondary" style={{ marginBottom: '0.5rem' }}>Upload Photo</button>
                                <p className="text-sm text-muted">JPG, PNG or GIF up to 5 MB.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => alert('Profile saved!')}>Save Changes</button>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
                <div style={{ maxWidth: '560px' }}>
                    <div className="card">
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Change Password</h3>
                        <div className="field">
                            <label className="label">Current Password</label>
                            <input className="input" type="password" placeholder="••••••••" />
                        </div>
                        <div className="field">
                            <label className="label">New Password</label>
                            <input className="input" type="password" placeholder="••••••••" />
                        </div>
                        <div className="field" style={{ marginBottom: 0 }}>
                            <label className="label">Confirm New Password</label>
                            <input className="input" type="password" placeholder="••••••••" />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => alert('Password updated!')}>Update Password</button>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {tab === 'notifications' && (
                <div style={{ maxWidth: '560px' }}>
                    <div className="card">
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Email Notifications</h3>
                        {[
                            'New assignment assigned to me',
                            'Feedback received on my submission',
                            'Assignment deadline reminders',
                            'Platform announcements',
                        ].map(label => (
                            <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                                <span style={{ fontSize: '0.9375rem' }}>{label}</span>
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={() => alert('Preferences saved!')}>Save Preferences</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
