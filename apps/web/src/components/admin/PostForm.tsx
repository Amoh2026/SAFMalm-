'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Loader2,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';

export type PostFormData = {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  images: { url: string; name: string }[];
  documents: { url: string; name: string; size: string }[];
  status: string;
  author: string;
  authorId: string;
  docVisibility: string;
  imageVisibility: string;
};

type PostFormProps = {
  initialData?: Partial<PostFormData> & {
    image?: string;
  };
  onSubmit: (data: PostFormData) => void | Promise<void>;
};

const STATUS_OPTIONS = ['draft', 'published', 'archived'];
const VISIBILITY_OPTIONS = ['public', 'members', 'admin'];

const IMAGE_MIME = /^image\//;

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PostForm({ initialData, onSubmit }: PostFormProps) {
  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    content: initialData?.content ?? '',
    imageUrl: initialData?.imageUrl ?? initialData?.image ?? '',
    images: initialData?.images ?? [],
    documents: initialData?.documents ?? [],
    status: initialData?.status ?? 'draft',
    author: initialData?.author ?? '',
    authorId: initialData?.authorId ?? '',
    docVisibility: initialData?.docVisibility ?? 'public',
    imageVisibility: initialData?.imageVisibility ?? 'public',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof PostFormData>(key: K, value: PostFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const uploadFile = async (file: File, visibility: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('visibility', visibility);

    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    setError(null);
    try {
      const url = await uploadFile(file, form.imageVisibility);
      update('imageUrl', url);
    } catch (err: any) {
      setError('Kunde inte ladda upp cover-bilden: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    setError(null);
    try {
      const uploaded: { url: string; name: string }[] = [];
      for (const file of Array.from(files)) {
        if (!IMAGE_MIME.test(file.type)) continue;
        const url = await uploadFile(file, form.imageVisibility);
        uploaded.push({ url, name: file.name });
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (err: any) {
      setError('Kunde inte ladda upp bild: ' + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDocsUpload = async (files: FileList) => {
    setUploadingDocs(true);
    setError(null);
    try {
      const uploaded: { url: string; name: string; size: string }[] = [];
      const rejected: string[] = [];

      for (const file of Array.from(files)) {
        if (!ALLOWED_DOC_TYPES.includes(file.type)) {
          rejected.push(file.name);
          continue;
        }
        const url = await uploadFile(file, form.docVisibility);
        uploaded.push({
          url,
          name: file.name,
          size: formatSize(file.size),
        });
      }

      if (rejected.length > 0) {
        setError(
          `Otillåtna filtyper: ${rejected.join(', ')}. Endast PDF och bilder är tillåtna.`
        );
      }

      if (uploaded.length > 0) {
        setForm((f) => ({ ...f, documents: [...f.documents, ...uploaded] }));
      }
    } catch (err: any) {
      setError('Kunde inte ladda upp dokument: ' + err.message);
    } finally {
      setUploadingDocs(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const removeDocument = (index: number) => {
    setForm((f) => ({ ...f, documents: f.documents.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) return setError('Titel krävs');

    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message ?? 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* ====== META ====== */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Titel <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Rubrik"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kort beskrivning</label>
        <Input
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Sammanfattning som visas i listor"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Innehåll</label>
        <textarea
          value={form.content}
          onChange={(e) => update('content', e.target.value)}
          rows={10}
          className="w-full border rounded-md p-2 text-sm font-mono"
          placeholder="Skriv inlägget här..."
          disabled={loading}
        />
      </div>

      {/* ====== COVER IMAGE ====== */}
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Cover-bild</h3>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Alternativ 1 — Ange URL
          </label>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
            <Input
              value={form.imageUrl}
              onChange={(e) => update('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Alternativ 2 — Ladda upp fil
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]);
                if (e.target) e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={loading || uploadingCover}
            >
              {uploadingCover ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Laddar upp...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" /> Välj bild
                </>
              )}
            </Button>
            {form.imageUrl && (
              <button
                type="button"
                onClick={() => update('imageUrl', '')}
                className="text-xs text-red-600 hover:underline"
              >
                Ta bort
              </button>
            )}
          </div>
        </div>

        {form.imageUrl && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Förhandsgranskning:</p>
            <img
              src={form.imageUrl}
              alt="Cover"
              className="max-h-40 rounded border border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
            />
          </div>
        )}
      </div>

      {/* ====== GALLERY ====== */}
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">
              Flera bilder (galleri)
            </h3>
            {form.images.length > 0 && (
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                {form.images.length}
              </span>
            )}
          </div>
          <div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleGalleryUpload(e.target.files);
                if (e.target) e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={loading || uploadingGallery}
            >
              {uploadingGallery ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Laddar upp...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" /> Lägg till bilder
                </>
              )}
            </Button>
          </div>
        </div>

        {form.images.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Inga galleribilder tillagda.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {form.images.map((img, i) => (
              <div
                key={i}
                className="relative group rounded-lg overflow-hidden border-2 border-gray-200"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  title="Ta bort"
                >
                  <X className="h-3 w-3" />
                </button>
                <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                  {img.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====== DOCUMENTS ====== */}
      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Dokument</h3>
            {form.documents.length > 0 && (
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                {form.documents.length}
              </span>
            )}
            <span className="text-xs text-gray-500 italic">
              (endast PDF och bilder)
            </span>
          </div>
          <div>
            <input
              ref={docsInputRef}
              type="file"
              multiple
              accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleDocsUpload(e.target.files);
                if (e.target) e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => docsInputRef.current?.click()}
              disabled={loading || uploadingDocs}
            >
              {uploadingDocs ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Laddar upp...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" /> Lägg till dokument
                </>
              )}
            </Button>
          </div>
        </div>

        {form.documents.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Inga dokument tillagda.</p>
        ) : (
          <ul className="space-y-2">
            {form.documents.map((doc, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(i)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Ta bort"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ====== SETTINGS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            className="w-full border rounded-md p-2 text-sm"
            disabled={loading}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Synlighet</label>
          <select
            value={form.docVisibility}
            onChange={(e) => update('docVisibility', e.target.value)}
            className="w-full border rounded-md p-2 text-sm"
            disabled={loading}
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bild-synlighet</label>
          <select
            value={form.imageVisibility}
            onChange={(e) => update('imageVisibility', e.target.value)}
            className="w-full border rounded-md p-2 text-sm"
            disabled={loading}
          >
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ====== SUBMIT ====== */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Sparar...' : 'Spara'}
        </Button>
      </div>
    </form>
  );
}