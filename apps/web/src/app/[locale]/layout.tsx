import { LanguageProvider } from '@/providers/LanguageProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SetDocumentLang from '@/components/SetDocumentLang';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale } = await params;

  return (
    <AuthProvider>
      <LanguageProvider locale={locale}>
        <SetDocumentLang />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </LanguageProvider>
    </AuthProvider>
  );
}