import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { filename, contentType } = req.body || {};

    if (!filename || !contentType) {
        return res.status(400).json({ error: 'Missing filename or contentType' });
    }

    const AccountId = process.env.R2_ACCOUNT_ID;
    const AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const Bucket = process.env.R2_BUCKET || 'lms';

    if (!AccountId || !AccessKeyId || !SecretAccessKey) {
        return res.status(500).json({ error: 'Server configuration missing R2 credentials' });
    }

    const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${AccountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: AccessKeyId,
            secretAccessKey: SecretAccessKey,
        },
    });

    try {
        const command = new PutObjectCommand({
            Bucket,
            Key: `videos/${filename}`,
            ContentType: contentType,
        });

        // URL expires in 1 hour
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

        return res.status(200).json({
            url,
            key: `videos/${filename}`,
            publicUrl: `https://pub-acc871d521e7446b833f820d0261b5db.r2.dev/videos/${filename}`
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
}
