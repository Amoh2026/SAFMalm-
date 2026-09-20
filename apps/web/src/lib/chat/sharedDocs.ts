// ============================================================
// Shared Docs helpers — URL detection + type classification
// ============================================================

import type { SharedDocKind, SharedDocSource } from '@/types/chat';

export function classifyUpload(mimeType: string): SharedDocKind {
  if (!mimeType) return 'download';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'download';
}

export interface DetectedLink {
  source: SharedDocSource;
  kind: SharedDocKind;
  title: string;
  embedUrl: string;
  originalUrl: string;
}

export function detectAndTransformLink(input: string): DetectedLink | null {
  const raw = input.trim();
  if (!raw) return null;

  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProto);
    const host = url.hostname.toLowerCase();

    // Google Drive file
    const driveFileMatch = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (host.includes('drive.google.com') && driveFileMatch) {
      const id = driveFileMatch[1];
      return {
        source: 'drive',
        kind: 'embed',
        title: 'Google Drive file',
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        originalUrl: raw,
      };
    }

    // Google Docs / Sheets / Slides
    const docsMatch = url.pathname.match(
      /^\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
    );
    if (host.includes('docs.google.com') && docsMatch) {
      const type = docsMatch[1];
      const id = docsMatch[2];
      return {
        source: 'drive',
        kind: 'embed',
        title: `Google ${type}`,
        embedUrl: `https://docs.google.com/${type}/d/${id}/preview`,
        originalUrl: raw,
      };
    }

    // Dropbox
    if (host.includes('dropbox.com')) {
      let embedUrl = raw.replace(/\?dl=0$/, '?raw=1');
      embedUrl = embedUrl.replace(/\?dl=0&/, '?raw=1&');
      if (!embedUrl.includes('raw=1') && !embedUrl.includes('preview=1')) {
        const sep = embedUrl.includes('?') ? '&' : '?';
        embedUrl = `${embedUrl}${sep}raw=1`;
      }
      const ext = url.pathname.split('.').pop()?.toLowerCase() || '';
      let kind: SharedDocKind = 'download';
      if (ext === 'pdf') kind = 'pdf';
      else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) kind = 'image';

      return {
        source: 'dropbox',
        kind,
        title: 'Dropbox file',
        embedUrl,
        originalUrl: raw,
      };
    }

    // YouTube
    let youtubeId: string | null = null;
    if (host.includes('youtube.com')) {
      youtubeId = url.searchParams.get('v');
    } else if (host === 'youtu.be') {
      youtubeId = url.pathname.slice(1).split('/')[0];
    }
    if (youtubeId) {
      return {
        source: 'youtube',
        kind: 'embed',
        title: 'YouTube video',
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        originalUrl: raw,
      };
    }

    // Generic link
    return {
      source: 'link',
      kind: 'download',
      title: url.hostname.replace('www.', ''),
      embedUrl: raw,
      originalUrl: raw,
    };
  } catch {
    return null;
  }
}

export function labelForSource(source: SharedDocSource): string {
  switch (source) {
    case 'drive': return 'Google Drive';
    case 'dropbox': return 'Dropbox';
    case 'youtube': return 'YouTube';
    case 'upload': return 'Uppladdat';
    default: return 'Länk';
  }
}