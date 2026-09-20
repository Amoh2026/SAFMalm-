// ============================================================
// /api/chat/upload-shared-doc  (POST)
// ============================================================
// Receives a file upload, stores it in Vercel Blob, returns
// the public URL. Client then creates the shared-doc record
// in Firestore.
//
// Requires env var: BLOB_READ_WRITE_TOKEN (already in .env.local)
// ============================================================

import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { verifyChatUser, unauthorized, badRequest, serverError } from '@/lib/chat/auth-server';
import { MAX_SHARED_FILE_SIZE } from '@/types/chat';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const roomId = String(formData.get('roomId') ?? '').trim();

    if (!file) return badRequest('No file provided');
    if (!roomId) return badRequest('roomId required');

    // Size guard (also enforced client-side)
    if (file.size > MAX_SHARED_FILE_SIZE) {
      return badRequest(
        `File too large (max ${MAX_SHARED_FILE_SIZE / 1024 / 1024} MB)`
      );
    }

    // Sanitize file name for the blob path
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `chat-shared-docs/${roomId}/${user.uid}/${Date.now()}-${safeName}`;

    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      addRandomSuffix: false,
    });

    return Response.json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type || 'application/octet-stream',
      size: file.size,
    });
  } catch (err: any) {
    console.error('POST /api/chat/upload-shared-doc error:', err);
    return serverError(err?.message || 'Upload failed');
  }
}
