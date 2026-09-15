'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Eye,
  User,
  FileText,
  X,
} from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { db } from '@/lib/firebase/client';
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';

interface MediaImage {
  url: string;
  name: string;
}

interface MediaDocument {
  url: string;
  name: string;
  size: string;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  content: string;
  author: string;
  date: string;
  views: number;
  imageUrl?: string;
  images?: MediaImage[];
  documents?: MediaDocument[];
  status: string;
}

interface RelatedPost {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  excerpt?: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const postId = params?.id as string;
  const { t, locale } = useLanguage();
  const tr = (key: string) => t(`news.${key}`);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<MediaDocument | null>(null);

  // All other published posts (for prev/next + related)
  const [allPosts, setAllPosts] = useState<RelatedPost[]>([]);
  const [prevPost, setPrevPost] = useState<RelatedPost | null>(null);
  const [nextPost, setNextPost] = useState<RelatedPost | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const docRef = doc(db, 'posts', postId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Inlägget hittades inte.');
          return;
        }

        const data = docSnap.data();

        if (data.status !== 'published' && data.status !== 'Publicerad') {
          setError('Inlägget hittades inte.');
          return;
        }

        setPost({
          id: docSnap.id,
          title: data.title || 'Untitled',
          excerpt: data.excerpt || '',
          description: data.description || '',
          content: data.content || '',
          author: data.author || 'Admin',
          date: data.date || '',
          views: data.views || 0,
          imageUrl: data.imageUrl || '',
          images: Array.isArray(data.images) ? data.images : [],
          documents: Array.isArray(data.documents) ? data.documents : [],
          status: data.status || '',
        });

        // Increment views (once)
        try {
          await updateDoc(docRef, { views: increment(1) });
        } catch {
          // ignore
        }

        // Fetch all other published posts for navigation
        try {
          const postsRef = collection(db, 'posts');
          const q = query(
            postsRef,
            where('status', 'in', ['published', 'Publicerad']),
            orderBy('date', 'desc')
          );
          const snapshot = await getDocs(q);
          const others: RelatedPost[] = [];
          snapshot.forEach((d) => {
            if (d.id === postId) return;
            const doc2 = d.data();
            others.push({
              id: d.id,
              title: doc2.title || 'Untitled',
              date: doc2.date || '',
              imageUrl: doc2.imageUrl || '',
              excerpt: doc2.excerpt || doc2.description || '',
            });
          });

          // Figure out current position in the sorted list
          const allIds: string[] = [];
          snapshot.forEach((d) => allIds.push(d.id));
          const currentIdx = allIds.indexOf(postId);
          const prevId = currentIdx > 0 ? allIds[currentIdx - 1] : null;
          const nextId =
            currentIdx >= 0 && currentIdx < allIds.length - 1
              ? allIds[currentIdx + 1]
              : null;

          const findPost = (id: string | null) =>
            id ? others.find((p) => p.id === id) || null : null;

          setPrevPost(findPost(prevId));
          setNextPost(findPost(nextId));
          setAllPosts(others);
        } catch (err) {
          console.error('Error fetching related posts:', err);
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Kunde inte ladda inlägget.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isPdf = (name: string) => name.toLowerCase().endsWith('.pdf');
  const isImage = (name: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
          <p className="text-xl text-gray-500 mb-6">
            {error ?? 'Inlägget hittades inte.'}
          </p>
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till alla inlägg
          </Link>
        </div>
      </div>
    );
  }

  const gallery = post.images ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till alla inlägg
        </Link>

        <article className="bg-white rounded-2xl shadow-lg border-2 border-blue-400 overflow-hidden">
          {post.imageUrl && (
            <div className="w-full max-h-96 overflow-hidden bg-gray-100">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4 text-blue-600" />
                {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-blue-600" />
                {post.views + 1} {tr('views')}
              </span>
            </div>

            {(post.excerpt || post.description) && (
              <p className="text-lg text-gray-600 italic mb-6 pb-6 border-b border-gray-200">
                {post.excerpt || post.description}
              </p>
            )}

            <div className="prose prose-lg max-w-none text-gray-800 whitespace-pre-wrap mb-8">
              {post.content}
            </div>

            {/* GALLERY */}
            {gallery.length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  📸 Bilder ({gallery.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((img, i) => (
                    <a
                      key={i}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition"
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                      />
                      <p className="text-xs text-gray-500 p-2 truncate bg-gray-50">
                        {img.name}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* DOCUMENTS */}
            {post.documents && post.documents.length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  📄 Dokument ({post.documents.length})
                </h2>
                <ul className="space-y-2">
                  {post.documents.map((doc, i) => (
                    <li
                      key={i}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 transition"
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center gap-3 min-w-0 w-full text-left"
                      >
                        <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-800 hover:underline truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500">{doc.size}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-xs shrink-0">
                          <Eye className="h-3.5 w-3.5" />
                          Visa
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        {/* ====== PREV / NEXT NAVIGATION ====== */}
        {(prevPost || nextPost) && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                href={`/${locale}/news/${prevPost.id}`}
                className="group bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 transition flex items-center gap-3"
              >
                <ArrowLeft className="h-5 w-5 text-blue-600 shrink-0 group-hover:-translate-x-1 transition" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Föregående
                  </p>
                  <p className="text-sm font-semibold text-blue-900 truncate">
                    {prevPost.title}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextPost && (
              <Link
                href={`/${locale}/news/${nextPost.id}`}
                className="group bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl p-4 transition flex items-center gap-3 text-right"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Nästa
                  </p>
                  <p className="text-sm font-semibold text-blue-900 truncate">
                    {nextPost.title}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600 shrink-0 group-hover:translate-x-1 transition" />
              </Link>
            )}
          </div>
        )}

        {/* ====== FLER INLÄGG ====== */}
        {allPosts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              📰 Fler inlägg
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPosts.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/news/${p.id}`}
                  className="group bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-xl overflow-hidden transition"
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-blue-900 text-sm line-clamp-2 mb-1 group-hover:underline">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(p.date)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====== DOCUMENT PREVIEW MODAL ====== */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden border-2 border-blue-400 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b-2 border-blue-400 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                <h3 className="font-bold text-blue-900 truncate">
                  {previewDoc.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-gray-500 hover:text-gray-800 p-1 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100">
              {isPdf(previewDoc.name) ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-[75vh]"
                  title={previewDoc.name}
                />
              ) : isImage(previewDoc.name) ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.name}
                  className="max-w-full max-h-[75vh] mx-auto my-4"
                />
              ) : (
                <div className="text-center py-16 px-6">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    Dokumentet kan inte visas
                  </p>
                  <p className="text-sm text-gray-500">
                    Filen "{previewDoc.name}" kunde inte visas i webbläsaren.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-sm rounded-lg border-2 border-gray-300 hover:bg-gray-50"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}