import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        return new Response(JSON.stringify({ error: 'Server is missing SUPABASE_SERVICE_ROLE_KEY.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        // 1. Authenticate the caller
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
        }

        // 2. Verify caller is an Admin
        const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden: Valid Admin role required' }), { status: 403 });
        }

        // 3. Process the Mass Import
        const { emails, role, defaultPassword } = await req.json();

        if (!Array.isArray(emails) || emails.length === 0) {
            return new Response(JSON.stringify({ error: 'Provide an array of emails' }), { status: 400 });
        }

        const secureDefaultPassword = defaultPassword || 'Welcome123!';
        const results = [];
        let successCount = 0;

        for (const email of emails) {
            const cleanEmail = email.trim();
            if (!cleanEmail) continue;

            // admin.createUser cleanly bypasses all rate limits and creates the identity
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: cleanEmail,
                password: secureDefaultPassword,
                email_confirm: true,
                user_metadata: { role, full_name: cleanEmail.split('@')[0] }
            });

            if (error) {
                results.push({ email: cleanEmail, success: false, error: error.message });
            } else {
                successCount++;
                results.push({ email: cleanEmail, success: true, id: data.user.id });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            totalImported: successCount,
            defaultPassword: secureDefaultPassword,
            details: results
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
