// src/app/admin/layout.tsx

'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/providers/LanguageProvider';
import Navbar from '@/components/public/Navbar';
import { AppSidebar } from '@/components/shared/AppSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LanguageProvider locale="sv">
        <Navbar />
        <div className="flex min-h-screen bg-gray-50">
          <AppSidebar />
          <div className="flex-1 md:ml-64">
            <main className="p-6">{children}</main>
          </div>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}