// src/app/page.tsx

import { redirect } from 'next/navigation';

export default function RootPage() {
  // Don't redirect if we're already on a member or admin page
  // This is handled by middleware
  redirect('/sv');
}