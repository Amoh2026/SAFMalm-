import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const files = blobs.map((blob) => {
      const pathname = blob.pathname;
      const parts = pathname.split('/');
      const filename = parts[parts.length - 1];
      const visibility = (parts[0] || 'public').toUpperCase();
      const displayName = filename.replace(/^\d+-/, '');
      const ext = displayName.split('.').pop()?.toLowerCase() || 'file';

      const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
      const sizeKB = (blob.size / 1024).toFixed(0);
      const sizeStr = blob.size > 1024 * 1024 ? sizeMB + ' MB' : sizeKB + ' KB';

      return {
        id: blob.url,
        name: displayName,
        type: 'file',
        fileType: ext,
        size: sizeStr,
        url: blob.url,
        visibility: visibility === 'MEMBER' ? 'MEMBER' : visibility === 'ADMIN' ? 'ADMIN' : 'PUBLIC',
        uploadedAt: blob.uploadedAt ? new Date(blob.uploadedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      };
    });

    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error('List files error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}