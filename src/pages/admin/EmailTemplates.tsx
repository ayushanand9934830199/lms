import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

interface Template {
    id: number;
    name: string;
    subject: string;
    body: string;
}

const DEFAULT_TEMPLATES: Template[] = [
    {
        id: 1,
        name: 'Classroom Invite',
        subject: 'You\'ve been invited to join {{classroom_name}} on blast.',
        body: `Hi {{student_name}},

Your teacher has invited you to join {{classroom_name}} on blast.

Click the link below to join, or use the class code when prompted:

  Join link: {{invite_link}}
  Class code: {{class_code}}

See you in class!
— The blast. team`,
    },
    {
        id: 2,
        name: 'Assignment Due Reminder',
        subject: 'Reminder: "{{assignment_title}}" is due {{deadline}}',
        body: `Hi {{student_name}},

Just a reminder that your video submission for "{{assignment_title}}" is due on {{deadline}}.

Log in to blast. to complete it before then.

Good luck!
— {{teacher_name}}`,
    },
    {
        id: 3,
        name: 'Feedback Notification',
        subject: 'Your feedback for "{{assignment_title}}" is ready',
        body: `Hi {{student_name}},

Your teacher has reviewed your video submission for "{{assignment_title}}" and left feedback.

Log in to blast. to read your feedback.

— {{teacher_name}}`,
    },
];

const AdminInviteTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
    const [editing, setEditing] = useState<number | null>(null);
    const [draft, setDraft] = useState<Template | null>(null);

    const startEdit = (t: Template) => { setEditing(t.id); setDraft({ ...t }); };
    const cancel = () => { setEditing(null); setDraft(null); };
    const save = () => {
        if (!draft) return;
        setTemplates(ts => ts.map(t => t.id === draft.id ? draft : t));
        cancel();
    };

    const VARS = ['{{student_name}}', '{{classroom_name}}', '{{invite_link}}', '{{class_code}}', '{{assignment_title}}', '{{deadline}}', '{{teacher_name}}'];

    return (
        <div>
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Email Templates</h1>
                <p className="text-sm text-muted">Edit the default templates used for classroom invites, reminders, and notifications.</p>
            </div>

            {/* Variable Reference */}
            <div className="card" style={{ marginBottom: '1.75rem', background: 'var(--bg-secondary)' }}>
                <p className="label" style={{ marginBottom: '0.625rem' }}>Available Variables</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {VARS.map(v => (
                        <code key={v} style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>{v}</code>
                    ))}
                </div>
            </div>

            {/* Template List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {templates.map(t => (
                    <div key={t.id} className="card">
                        {editing === t.id && draft ? (
                            /* Edit Mode */
                            <div>
                                <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontWeight: 600 }}>{draft.name}</h4>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost" onClick={cancel}><X size={14} /> Cancel</button>
                                        <button className="btn btn-primary" onClick={save}><Save size={14} /> Save</button>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Subject</label>
                                    <input className="input" value={draft.subject} onChange={e => setDraft(d => d ? { ...d, subject: e.target.value } : d)} />
                                </div>
                                <div className="field" style={{ marginBottom: 0 }}>
                                    <label className="label">Body</label>
                                    <textarea className="input" style={{ minHeight: '220px', fontFamily: 'monospace', fontSize: '0.875rem' }}
                                        value={draft.body} onChange={e => setDraft(d => d ? { ...d, body: e.target.value } : d)} />
                                </div>
                            </div>
                        ) : (
                            /* Read Mode */
                            <div>
                                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontWeight: 600 }}>{t.name}</h4>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.875rem' }} onClick={() => startEdit(t)}>
                                        <Edit2 size={13} /> Edit
                                    </button>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    <strong>Subject:</strong> {t.subject}
                                </p>
                                <pre style={{ fontFamily: 'inherit', fontSize: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {t.body}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminInviteTemplates;
