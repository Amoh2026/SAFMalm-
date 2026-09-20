// ============================================================
// /api/chat/rooms/[roomId]/shared-docs
//   GET  → list active shared docs
//   POST → share a document (upload OR external link)
// ============================================================

import { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import {
  verifyChatUser,
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/chat/auth-server';
import {
  MAX_SHARED_FILE_SIZE,
  type SharedDocKind,
  type SharedDocSource,
} from '@/types/chat';

export const runtime = 'nodejs';

type Params = { params: Promise<{ roomId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;
    const snap = await adminDb()
      .collection('chatRooms')
      .doc(roomId)
      .collection('sharedDocs')
      .where('isActive', '==', true)
      .orderBy('sharedAt', 'desc')
      .limit(20)
      .get();

    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return Response.json({ docs });
  } catch (err) {
    console.error('GET shared-docs error:', err);
    return serverError();
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  try {
    const { roomId } = await params;
    const body = await req.json();

    const source = String(body?.source ?? '').trim() as SharedDocSource;
    const kind = String(body?.kind ?? '').trim() as SharedDocKind;
    const title = String(body?.title ?? '').trim().slice(0, 120);
    const embedUrl = String(body?.embedUrl ?? '').trim();
    const originalUrl = String(body?.originalUrl ?? '').trim();
    const downloadUrl = String(body?.downloadUrl ?? '').trim();
    const mimeType = String(body?.mimeType ?? '').trim();
    const fileSize = Number(body?.fileSize ?? 0);

    const validSources: SharedDocSource[] = ['upload', 'drive', 'dropbox', 'youtube', 'link'];
    const validKinds: SharedDocKind[] = ['pdf', 'image', 'video', 'embed', 'download'];

    if (!validSources.includes(source)) return badRequest('Invalid source');
    if (!validKinds.includes(kind)) return badRequest('Invalid kind');
    if (!title) return badRequest('Title required');
    if (!embedUrl) return badRequest('embedUrl required');

    if (source === 'upload' && fileSize > MAX_SHARED_FILE_SIZE) {
      return badRequest(
        `File too large (max ${MAX_SHARED_FILE_SIZE / 1024 / 1024} MB)`
      );
    }

    const roomSnap = await adminDb().collection('chatRooms').doc(roomId).get();
    if (!roomSnap.exists) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    const roomData = roomSnap.data()!;
    const isMember = (roomData.members ?? []).some((m: any) => m.id === user.uid);
    if (!isMember) {
      return new Response(JSON.stringify({ error: 'Not a member' }), { status: 403 });
    }

    const displayName = user.name || user.email?.split('@')[0] || 'Member';

    const docRef = await adminDb()
      .collection('chatRooms')
      .doc(roomId)
      .collection('sharedDocs')
      .add({
        roomId,
        sharedBy: user.uid,
        sharedByName: displayName,
        sharedAt: FieldValue.serverTimestamp(),
        source,
        kind,
        title,
        mimeType: mimeType || undefined,
        fileSize: fileSize || undefined,
        originalUrl: originalUrl || undefined,
        embedUrl,
        downloadUrl: downloadUrl || undefined,
        isActive: true,
      });

    return Response.json({ id: docRef.id, ok: true });
  } catch (err) {
    console.error('POST shared-docs error:', err);
    return serverError();
  }
}