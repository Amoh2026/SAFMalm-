import Link from 'next/link';
import { Post } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface HomePostsProps {
  posts: Post[];
  locale: string;
}

export function HomePosts({ posts, locale }: HomePostsProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              <Link href={`/${locale}/news/${post.id}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{formatDate(post.date, locale)}</p>
            <p className="mt-2 text-gray-700">{post.excerpt}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}