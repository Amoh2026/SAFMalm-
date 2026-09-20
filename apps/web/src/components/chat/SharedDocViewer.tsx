'use client';

// ============================================================
// SharedDocViewer — displays a shared document in the call
// Renders PDFs, images, videos, embeds (Drive/Dropbox/YouTube),
// and download links.
// ============================================================

import { useState } from 'react';
import {
  X,
  ExternalLink,
  Download,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { auth } from '@/lib/firebase/client';
import type { SharedDocument } from '@/types/chat';
import { labelForSource } from '@/lib/chat/sharedDocs';

interface Props {
  doc: SharedDocument;
  isSharer: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

export function SharedDocViewer({ doc, isSharer, onClose, t }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function handleRevoke() {
    if (!window.confirm(t('chat.stopSharingConfirm') || 'Stop sharing this document?')) return;
    setRevoking(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not signed in');
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `/api/chat/rooms/${doc.roomId}/shared-docs/${doc.id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed');
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to stop sharing');
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{doc.title}</p>
            <p className="text-[10px] text-gray-400">
              {labelForSource(doc.source)} · {doc.sharedByName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {doc.downloadUrl && (
            <a
              href={doc.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-gray-700 transition"
              title={t('chat.download') || 'Download'}
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          <a
            href={doc.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-gray-700 transition"
            title={t('chat.openInNewTab') || 'Open in new tab'}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          {isSharer && (
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-xs font-medium disabled:opacity-50"
              title={t('chat.stopSharing') || 'Stop sharing'}
            >
              {revoking ? '...' : (t('chat.stopSharing') || 'Stop sharing')}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-700 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden">
        {error && (
          <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2 text-xs text-red-200 bg-red-800/80 border border-red-600 rounded p-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        )}

        {doc.kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.embedUrl}
            alt={doc.title}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Could not load image');
            }}
            className="w-full h-full object-contain"
          />
        ) : doc.kind === 'pdf' ? (
          <iframe
            src={doc.embedUrl}
            onLoad={() => setLoading(false)}
            className="w-full h-full bg-white"
            title={doc.title}
          />
        ) : doc.kind === 'video' ? (
          <video
            src={doc.embedUrl}
            controls
            onLoadedData={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Could not load video');
            }}
            className="w-full h-full"
          />
        ) : doc.kind === 'embed' ? (
          <iframe
            src={doc.embedUrl}
            onLoad={() => setLoading(false)}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full bg-white"
            title={doc.title}
          />
        ) : (
          // download / other
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
            <FileText className="h-12 w-12 text-gray-500" />
            <p className="text-sm text-gray-300">
              {t('chat.cannotPreview') || 'This file cannot be previewed here.'}
            </p>
            <a
              href={doc.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('chat.openFile') || 'Open file'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}