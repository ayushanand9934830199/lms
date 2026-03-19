import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadVideoSubmission(studentId: string, assignmentId: string, blob: Blob) {
    const fileName = `${studentId}_${assignmentId}_${Date.now()}.webm`;

    // 1. Get presigned URL from our Vercel Serverless Function
    const res = await fetch('/api/uploadVideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filename: fileName,
            contentType: 'video/webm'
        })
    });

    if (!res.ok) {
        throw new Error('Failed to securely fetch R2 upload URL from Vercel');
    }

    const { url, key, publicUrl } = await res.json();

    // 2. Upload the video blob directly to Cloudflare R2
    const uploadRes = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'video/webm'
        },
        body: blob
    });

    if (!uploadRes.ok) {
        throw new Error('Cloudflare R2 direct upload failed');
    }

    // Return the public Cloudflare URL so we can save it in the Supabase Database
    return { path: key, publicUrl };
}
