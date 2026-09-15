import { getPosts } from '@/lib/services/posts.service';
import { PostsTableClient } from './_components/PostsTableClient';

export default async function AdminPostsPage() {
  const posts = await getPosts();

  const sanitized = posts.map((p: any) => ({
    id: p.id,
    title: p.title ?? '',
    date: p.date ?? '',
    status: p.status ?? '',
    createdAt:
      typeof p.createdAt?.toDate === 'function'
        ? p.createdAt.toDate().toISOString()
        : p.createdAt ?? null,
    updatedAt:
      typeof p.updatedAt?.toDate === 'function'
        ? p.updatedAt.toDate().toISOString()
        : p.updatedAt ?? null,
  }));

  return <PostsTableClient posts={sanitized} />;
}