'use client';

import { useRouter } from 'next/navigation';
import { PostForm } from '@/components/admin/PostForm';
import { createPost } from '@/lib/services/posts.service';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminPostsCreatePage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    await createPost(data);
    router.push('/admin/posts');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Skapa inlägg</h1>
      <Card>
        <CardContent className="p-6">
          <PostForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}