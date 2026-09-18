'use client';

// ============================================================
// VideoPanel — LiveKit video grid + document sharing
// v2 — integrates shared document viewer
// ============================================================

import { useEffect, useState } from 'react';
import { Video, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase/client';

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';

import { useSharedDocs } from '@/hooks/useSharedDocs';
import { ShareDocDialog } from './ShareDocDialog';
import { SharedDocViewer } from './SharedDocViewer';

interface Props {
  roomId: string;
  userId: string | undefined;
  userName: string | undefined;
  t: (key: string) => string;
}

interface TokenState {
  token: string;
  url: string;
  roomName: string;
  identity: string;
}

export function VideoPanel({ roomId, userId, userName, t }: Props) {
  const [state, setState] = useState<TokenState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared docs (real-time)
  const { docs } = useSharedDocs(roomId);
  const activeDoc = docs[0] ?? null;

  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      try {
        setLoading(true);
        setError(null);

        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('Not signed in');
        const idToken = await currentUser.getIdToken();

        const res = await fetch('/api/chat/livekit-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ roomId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Server error (${res.status})`);
        }

        const data = (await res.json()) as TokenState;
        if (!cancelled) setState(data);
      } catch (err: any) {
        console.error('VideoPanel fetch error:', err);
        if (!cancelled) setError(err?.message || 'Video unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchToken();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-gray-500 bg-gray-50">
        <Video className="h-4 w-4 mr-2 animate-pulse" />
        {t('chat.connecting')}
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="h-32 flex flex-col items-center justify-center text-sm text-gray-500 bg-gray-50 p-4">
        <AlertCircle className="h-5 w-5 mb-1 text-amber-500" />
        <p className="text-center">{error || t('chat.videoNotConfigured')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px] bg-black">
      {/* Main content: video + shared doc */}
      <div className="flex-1 flex min-h-0">
        {/* Video area */}
        <div
          className={`${
            activeDoc ? 'w-1/3 min-w-[200px]' : 'flex-1'
          } bg-black border-r border-gray-800 transition-all`}
        >
          <LiveKitRoom
            token={state.token}
            serverUrl={state.url}
            connect={true}
            video={false}
            audio={false}
            onDisconnected={() => {
              console.log('LiveKit disconnected');
            }}
            data-lk-theme="default"
            style={{ height: '100%' }}
          >
            <VideoConference />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>

        {/* Shared doc viewer */}
        {activeDoc && (
          <div className="flex-1 min-w-0">
            <SharedDocViewer
              doc={activeDoc}
              isSharer={activeDoc.sharedBy === userId}
              onClose={() => {
                // Just hide locally — actual revoke goes through DELETE API
                // (only sharer sees the Stop Sharing button)
              }}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Bottom toolbar — Share document */}
      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 border-t border-gray-800">
        <ShareDocDialog roomId={roomId} t={t} />
      </div>
    </div>
  );
}