'use client';

// ============================================================
// ShareDocDialog — modal for sharing a document in a call
// Two tabs: paste a link OR upload a file
// v2 — uploads go to Vercel Blob (not Firebase Storage)
// ============================================================

import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  FileUp,
  Link2,
  Loader2,
  X,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/client';
import { detectAndTransformLink, classifyUpload, labelForSource } from '@/lib/chat/sharedDocs';
import {
  MAX_SHARED_FILE_SIZE,
  formatFileSize,
  type SharedDocumentInput,
} from '@/types/chat';

interface Props {
  roomId: string;
  t: (key: string) => string;
  trigger?: React.ReactNode;
}

type Tab = 'link' | 'upload';

export function ShareDocDialog({ roomId, t, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('link');
  const [linkInput, setLinkInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setLinkInput('');
    setFile(null);
    setTitle('');
    setError(null);
    setSubmitting(false);
  }

  async function getIdToken() {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not signed in');
    return currentUser.getIdToken();
  }

  async function postShare(payload: SharedDocumentInput) {
    const token = await getIdToken();
    const res = await fetch(`/api/chat/rooms/${roomId}/shared-docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || `Failed (${res.status})`);
    }
    return res.json().catch(() => ({}));
  }

  // ---------------- LINK TAB ----------------
  async function handleShareLink() {
    setSubmitting(true);
    setError(null);
    try {
      const detected = detectAndTransformLink(linkInput);
      if (!detected) throw new Error('Invalid URL');

      await postShare({
        source: detected.source,
        kind: detected.kind,
        title: detected.title,
        embedUrl: detected.embedUrl,
        originalUrl: detected.originalUrl,
      });

      setOpen(false);
      reset();
    } catch (err: any) {
      setError(err?.message || 'Failed to share');
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------- UPLOAD TAB (Vercel Blob) ----------------
  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SHARED_FILE_SIZE) {
      setError(`File too large (max ${formatFileSize(MAX_SHARED_FILE_SIZE)})`);
      return;
    }
    setFile(f);
    setTitle(f.name);
    setError(null);
  }

  async function handleShareUpload() {
    if (!file) return;
    setSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();

      // 1) Upload file to Vercel Blob via our API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      const uploadRes = await fetch('/api/chat/upload-shared-doc', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json().catch(() => ({}));
        throw new Error(data?.error || `Upload failed (${uploadRes.status})`);
      }

      const uploadData = await uploadRes.json();
      const downloadUrl: string = uploadData.url;

      // 2) Create the shared-doc record in Firestore
      const kind = classifyUpload(file.type);
      await postShare({
        source: 'upload',
        kind,
        title: title.trim() || file.name,
        mimeType: file.type,
        fileSize: file.size,
        embedUrl: downloadUrl,
        downloadUrl,
      });

      setOpen(false);
      reset();
    } catch (err: any) {
      console.error('upload error:', err);
      setError(err?.message || 'Failed to upload');
    } finally {
      setSubmitting(false);
    }
  }

  const disabled =
    submitting ||
    (tab === 'link' && !linkInput.trim()) ||
    (tab === 'upload' && !file);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-medium">
            📄 {t('chat.shareDocument') || 'Share document'}
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[95vw] max-w-md z-50">
          <div className="flex items-start justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {t('chat.shareDocument') || 'Share document'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded hover:bg-gray-100" aria-label="Close">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => { setTab('link'); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition ${
                tab === 'link'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Link2 className="h-4 w-4" />
              {t('chat.pasteLink') || 'Paste link'}
            </button>
            <button
              onClick={() => { setTab('upload'); setError(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition ${
                tab === 'upload'
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileUp className="h-4 w-4" />
              {t('chat.uploadFile') || 'Upload file'}
            </button>
          </div>

          {/* Link tab */}
          {tab === 'link' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('chat.linkLabel') || 'Google Drive, Dropbox or YouTube link'}
                </label>
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  {t('chat.linkHint') || 'Make sure the link is public (Anyone with the link).'}
                </p>
              </div>

              {linkInput.trim() && (
                <LinkPreview input={linkInput} />
              )}
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFilePick}
                disabled={submitting}
                className="hidden"
              />

              {!file ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-8 hover:border-blue-400 hover:bg-blue-50 transition"
                >
                  <FileUp className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('chat.pickFile') || 'Click to pick a file'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t('chat.maxSize') || 'Max'} {formatFileSize(MAX_SHARED_FILE_SIZE)}
                  </span>
                </button>
              ) : (
                <div className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileIconForType mimeType={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} · {file.type}
                      </p>
                    </div>
                    <button
                      onClick={() => { setFile(null); setTitle(''); }}
                      disabled={submitting}
                      className="p-1 rounded hover:bg-gray-200"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                    placeholder="Display title"
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={() => { setOpen(false); reset(); }}
              disabled={submitting}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {t('chat.cancel') || 'Cancel'}
            </button>
            <Button
              onClick={tab === 'link' ? handleShareLink : handleShareUpload}
              disabled={disabled}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tab === 'upload'
                    ? (t('chat.uploading') || 'Uploading...')
                    : (t('chat.sharing') || 'Sharing...')}
                </>
              ) : (
                t('chat.share') || 'Share'
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ------------------------------------------------------------
// Preview helpers
// ------------------------------------------------------------
function LinkPreview({ input }: { input: string }) {
  const detected = detectAndTransformLink(input);
  if (!detected) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
        <AlertCircle className="h-3.5 w-3.5" />
        {`Invalid URL`}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
      <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
      <span className="font-medium">{labelForSource(detected.source)}</span>
      <span className="text-gray-400">·</span>
      <span className="truncate">{detected.title}</span>
    </div>
  );
}

function FileIconForType({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-600 shrink-0" />;
  }
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-emerald-600 shrink-0" />;
  }
  if (mimeType.startsWith('video/')) {
    return <Video className="h-5 w-5 text-purple-600 shrink-0" />;
  }
  return <FileText className="h-5 w-5 text-gray-500 shrink-0" />;
}