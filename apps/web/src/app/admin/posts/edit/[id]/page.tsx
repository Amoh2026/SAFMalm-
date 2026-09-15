'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PostForm } from '@/components/admin/PostForm';
import { getPost, updatePost } from '@/lib/services/posts.service';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AdminPostsEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      try {
        setLoading(true);
        const post = await getPost(postId);
        if (!post) {
          setError('Inlägget hittades inte.');
          return;
        }
        setInitialData(post);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Kunde inte ladda inlägget.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleSubmit = async (data: any) => {
    if (!postId) return;
    await updatePost(postId, data);
    router.push('/admin/posts');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Laddar inlägg...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin/posts')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tillbaka till inlägg
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Redigera inlägg</h1>
      <Card>
        <CardContent className="p-6">
          <PostForm initialData={initialData} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}