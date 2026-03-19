import React, { useEffect, useState } from 'react';
import { UserCircle, Trash2 } from 'lucide-react';
import type { Classroom } from '../../../components/ClassroomDetail';
import { supabase } from '../../../lib/supabase';


interface Member { id: string; name: string; email: string; role: string; member_row_id: string; }

const ClassroomMembers: React.FC<{ classroom: Classroom; role: string }> = ({ classroom, role }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [teacher, setTeacher] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMembers = async () => {
        setLoading(true);
        // Fetch teacher profile
        const { data: classData } = await supabase
            .from('classrooms')
            .select('teacher_id, profiles!classrooms_teacher_id_fkey(full_name, email)')
            .eq('id', classroom.id)
            .maybeSingle();

        if (classData?.profiles) {
            const p = classData.profiles as any;
            setTeacher({ name: p.full_name || 'Teacher', email: p.email || '' });
        }

        // Fetch enrolled students via classroom_members
        const { data } = await supabase
            .from('classroom_members')
            .select('id, profiles(id, full_name, email, role)')
            .eq('classroom_id', classroom.id);

        if (data) {
            setMembers(data.map((m: any) => ({
                id: m.profiles?.id || m.id,
                name: m.profiles?.full_name || 'Unknown',
                email: m.profiles?.email || '',
                role: m.profiles?.role || 'student',
                member_row_id: m.id,
            })));
        }
        setLoading(false);
    };

    useEffect(() => { fetchMembers(); }, [classroom.id]);

    const removeMember = async (memberRowId: string) => {
        if (!confirm('Remove this student from the classroom?')) return;
        await supabase.from('classroom_members').delete().eq('id', memberRowId);
        fetchMembers();
    };

    return (
        <div style={{ maxWidth: 600 }}>
            {/* Teacher card */}
            {teacher && (
                <div className="card" style={{ marginBottom: '1rem' }}>
                    <div className="flex items-center gap-3" style={{ padding: '0.25rem 0' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {teacher.name[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 600 }}>{teacher.name}</p>
                            <p className="text-sm text-muted">Teacher · {teacher.email}</p>
                        </div>
                        <span className="badge badge-yellow" style={{ marginLeft: 'auto' }}>Teacher</span>
                    </div>
                </div>
            )}

            <p className="label" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                STUDENTS ({members.length})
            </p>

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading members...</div>
            ) : members.length === 0 ? (
                <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students enrolled yet. Share the class code to invite them.
                </div>
            ) : (
                <div className="flex-col gap-2">
                    {members.map(m => (
                        <div key={m.id} className="card" style={{ padding: '0.875rem 1.25rem' }}>
                            <div className="flex items-center gap-3">
                                <UserCircle size={32} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 500 }}>{m.name}</p>
                                    <p className="text-sm text-muted">{m.email}</p>
                                </div>
                                {role === 'teacher' && (
                                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: '#dc2626' }} onClick={() => removeMember(m.member_row_id)} title="Remove student">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassroomMembers;
