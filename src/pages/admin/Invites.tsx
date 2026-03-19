import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AdminInvites: React.FC = () => {
    const [emails, setEmails] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplates = async () => {
            const { data } = await supabase.from('email_templates').select('*').limit(1).maybeSingle();
            if (data) {
                setSubject(data.subject);
                setBody(data.body_html || `Hello {{name}},\n\nYou've been invited to complete a video assessment.\nLink: {{invite_link}}\n\nGood luck!`);
            } else {
                setSubject("You've been invited to blast.");
                setBody(`Hello {{name}},\n\nYou've been invited to complete a video assessment.\nLink: {{invite_link}}\n\nGood luck!`);
            }
            setLoading(false);
        };
        fetchTemplates();
    }, []);

    const dispatch = async () => {
        alert("Integrate your Vercel/Resend backend here to dispatch " + emails.split(/[\n,]+/).filter(e => e.trim()).length + " emails!");
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading templates...</div>;

    return (
        <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Send Invites</h1>
                <button className="btn btn-primary" onClick={dispatch}>Dispatch</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Email Template</h3>
                    <div className="field">
                        <label className="label">Subject</label>
                        <input className="input" value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Body</label>
                        <textarea className="input" style={{ minHeight: '140px' }} value={body} onChange={e => setBody(e.target.value)} />
                    </div>
                </div>
                <div className="card">
                    <h3 style={{ fontWeight: 600, marginBottom: '1.25rem' }}>Recipients</h3>
                    <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>Paste comma- or newline-separated emails.</p>
                    <textarea className="input" style={{ minHeight: '200px', fontFamily: 'monospace', fontSize: '0.8125rem' }}
                        placeholder={'student1@uni.edu\nstudent2@uni.edu'} value={emails} onChange={e => setEmails(e.target.value)} />
                    <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>{emails.split(/[\n,]+/).filter(e => e.trim()).length} recipient(s)</p>
                </div>
            </div>
        </div>
    );
};

export default AdminInvites;
