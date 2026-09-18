// ============================================================
// /api/chat/livekit-token  (POST)
// ============================================================
// Body: { roomId }
// Returns: { token, url, roomName, identity }
//
// Requires env vars:
//   LIVEKIT_API_KEY
//   LIVEKIT_API_SECRET
//   NEXT_PUBLIC_LIVEKIT_URL
// ============================================================

import { NextRequest } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { adminDb } from '@/lib/firebase/admin';
import {
  verifyChatUser,
  unauthorized,
  badRequest,
  serverError,
} from '@/lib/chat/auth-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await verifyChatUser(req);
  if (!user) return unauthorized();

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return new Response(
      JSON.stringify({
        error:
          'Video not configured yet. Add LIVEKIT_API_KEY, LIVEKIT_API_SECRET and NEXT_PUBLIC_LIVEKIT_URL.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const roomId = String(body?.roomId ?? '').trim();
    if (!roomId) return badRequest('roomId required');

    const snap = await adminDb().collection('chatRooms').doc(roomId).get();
    if (!snap.exists) {
      return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
    }
    const data = snap.data()!;
    const members: any[] = data.members ?? [];
    if (!members.some((m) => m.id === user.uid)) {
      return new Response(JSON.stringify({ error: 'Not a member' }), { status: 403 });
    }

    const displayName = user.name || user.email?.split('@')[0] || 'Member';
    const roomName = `safmalmo-chat-${roomId}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.uid,
      name: displayName,
      ttl: '2h',
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return Response.json({
      token,
      url: wsUrl,
      roomName,
      identity: user.uid,
    });
  } catch (err) {
    console.error('POST /api/chat/livekit-token error:', err);
    return serverError();
  }
}