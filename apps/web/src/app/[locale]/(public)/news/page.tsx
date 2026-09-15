"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Eye, User, Search } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  views: number;
  imageUrl?: string;
}

export default function NewsPage() {
  const { t, locale } = useLanguage();
  const tr = (key: string) => t(`news.${key}`);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

            const postsCollection = collection(db, 'posts');
      const postsQuery = query(
        postsCollection,
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(postsQuery);

      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status !== 'published') return;

        postsData.push({
          id: doc.id,
          title: data.title || 'Untitled',
          excerpt: data.excerpt || '',
          content: data.content || '',
          author: data.author || 'Admin',
          date: data.date || new Date().toISOString().split('T')[0],
          views: data.views || 0,
          imageUrl: data.imageUrl || null,
        });
      });

      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(tr('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">{tr('title')}</h1>
          <p className="text-blue-200 mt-2">{tr('subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={tr('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">{tr('loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-2xl border-2 border-red-400 p-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {tr('tryAgain')}
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200 p-8">
            <p className="text-gray-500">
              {searchTerm
                ? tr('noResultsFor').replace('{query}', searchTerm)
                : tr('noPosts')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/news/${post.id}`}
                className="block bg-white rounded-2xl shadow-lg border-2 border-blue-400 overflow-hidden hover:shadow-xl transition group"
              >
                <div className="flex flex-col md:flex-row">
                  {post.imageUrl && (
                    <div className="md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1">
                    <h2 className="text-2xl font-bold text-blue-900 group-hover:text-blue-600 transition mb-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || post.content.slice(0, 200) + '...'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                        {post.views} {tr('views')}
                      </span>
                      <span className="text-blue-600 font-medium ml-auto group-hover:underline">
                        {tr('readMore')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}