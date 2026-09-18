'use client';

// ============================================================
// VideoPanel — LiveKit video grid (dynamic, safe-fails)
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

  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      try {
        setLoading(true);
        setError(null);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Not signed in');
        }
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
    <div className="h-[420px] bg-black">
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
  );
}