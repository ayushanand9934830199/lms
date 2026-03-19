import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: 'admin' | 'teacher' | 'student' | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchRole = async (userId: string, email?: string) => {
            try {
                if (email === 'ayushhaanand@gmail.com') {
                    if (mounted) setRole('admin');
                    return;
                }

                const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();

                if (mounted && data?.role) {
                    // Map legacy roles if necessary
                    const r = data.role;
                    if (r === 'admin' || r === 'admissions_head') setRole('admin');
                    else if (r === 'teacher' || r === 'admissions_associate') setRole('teacher');
                    else setRole('student');
                } else if (mounted) {
                    setRole('student');
                }
            } catch (err) {
                console.error("Failed to fetch role", err);
                if (mounted) setRole('student');
            }
        };

        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                setSession(session);
                setUser(session?.user || null);
                if (session?.user) {
                    await fetchRole(session.user.id, session.user.email);
                }
                setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (mounted) {
                setSession(newSession);
                setUser(newSession?.user || null);
                if (newSession?.user) {
                    await fetchRole(newSession.user.id, newSession.user.email);
                } else {
                    setRole(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
