'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { AdminButton } from '@/components/ui/AdminButton';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { db } from '@/lib/firebase/client';
import { doc, deleteDoc } from 'firebase/firestore';

type PostRow = {
  id: string;
  title: string;
  date: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const columns: Column<PostRow>[] = [
  { key: 'title', label: 'Titel' },
  { key: 'date', label: 'Datum' },
  { key: 'status', label: 'Status' },
];

export function PostsTableClient({ posts }: { posts: PostRow[] }) {
  const [rows, setRows] = useState<PostRow[]>(posts);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (post: PostRow) => {
    const confirmed = confirm(
      `Är du säker på att du vill ta bort "${post.title}"?\n\nDetta kan inte ångras.`
    );
    if (!confirmed) return;

    setDeletingIds((s) => new Set(s).add(post.id));
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      setRows((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Kunde inte ta bort inlägget. Försök igen.');
    } finally {
      setDeletingIds((s) => {
        const copy = new Set(s);
        copy.delete(post.id);
        return copy;
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inlägg</h1>
        <Link href="/admin/posts/create">
          <AdminButton variant="primary">+ Skapa inlägg</AdminButton>
        </Link>
      </div>
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={rows}
            actions={(post) => {
              const isDeleting = deletingIds.has(post.id);
              return (
                <div className="flex gap-2">
                  <Link href={`/admin/posts/edit/${post.id}`}>
                    <AdminButton variant="secondary" size="sm" disabled={isDeleting}>
                      Redigera
                    </AdminButton>
                  </Link>
                  <AdminButton
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post)}
                    loading={isDeleting}
                  >
                    Ta bort
                  </AdminButton>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}