'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Landmark, Umbrella, Globe, Heart, Handshake, Camera, Church, Mail, Calendar, Eye, User, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { db } from '@/lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  views: number;
  imageUrl?: string;
  status?: string;
}

export default function HomePage() {
  const { locale, t } = useLanguage();
  const [zoomedCard, setZoomedCard] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tr = (key: string) => t(`home.${key}`);
  const trNav = (key: string) => t(`navigation.${key}`);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const postsCollection = collection(db, 'posts');
      const querySnapshot = await getDocs(postsCollection);
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          title: data.title || 'Untitled',
          excerpt: data.excerpt || '',
          content: data.content || '',
          author: data.author || 'Admin',
          date: data.date || new Date().toISOString().split('T')[0],
          views: data.views || 0,
          imageUrl: data.imageUrl || null,
          status: data.status || 'draft',
        });
      });
      const publishedPosts = postsData.filter(post => post.status === 'published');
      publishedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPosts(publishedPosts);
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
      const localeMap: Record<string, string> = {
        sv: 'sv-SE', ar: 'ar-EG', fr: 'fr-FR', en: 'en-US'
      };
      return date.toLocaleDateString(localeMap[locale] || 'sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
          <Image
            src="/images/homepage.png"
            alt={tr('heroTitle')}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/25"></div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                {tr('welcomeBadge')}
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4">
                {tr('organizationName')}
              </h2>
              <p className="text-2xl md:text-3xl text-blue-700 font-light">
                {tr('inCity')}
              </p>
              <div className="w-24 h-1 bg-yellow-500 mx-auto rounded-full mt-4"></div>
              <p className="text-xl md:text-2xl text-gray-600 mt-6 max-w-3xl mx-auto">
                {tr('meetingPlace')}
              </p>

              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link
                  href={`/${locale}/medlemsregistrering`}
                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-lg transition transform hover:scale-105 inline-flex items-center gap-2"
                >
                  {tr('becomeMember')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/om-oss`}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition transform hover:scale-105 inline-flex items-center gap-2"
                >
                  {tr('readMore')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[500px] md:min-h-[550px] border-2 border-blue-400">
              <Image
                src="/images/Oresundsbron.png"
                alt="Oresundsbron"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-center min-h-[500px] md:min-h-[550px]">
                <div className="max-w-3xl">
                  <p className="text-lg md:text-xl text-white leading-relaxed mb-4">
                    {tr('associationIntro')}
                  </p>
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                    {tr('associationWork')}
                  </p>
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed mt-4">
                    {tr('associationPartners')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-blue-900 rounded-2xl p-6 md:p-8 text-white border-b-4 border-yellow-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">{tr('visitUs')}</p>
                    <p className="text-blue-200">{tr('address')}</p>
                  </div>
                </div>
                <Link
                  href={`/${locale}/contact`}
                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-lg transition flex items-center gap-2 whitespace-nowrap"
                >
                  {tr('contactLink')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NEWS SECTION (MOVED HERE) ==================== */}
      <section className="py-16 bg-white border-t-2 border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-900">
                  {trNav('news')}
                </h2>
                <div className="w-16 h-1 bg-yellow-500 rounded-full mt-2"></div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-500">{tr('loadingPosts')}</p>
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
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-gray-200 p-8">
                <p className="text-gray-500">{tr('noPostsYet')}</p>
                <p className="text-xs text-gray-400 mt-2">{tr('newsAdminHint')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Display ONLY the last news item */}
                {posts.slice(0, 1).map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/news/${post.id}`}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl shadow-md border-2 border-blue-400 overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {post.imageUrl && (
                            <div className="md:w-56 lg:w-64 flex-shrink-0">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {post.excerpt || post.content.slice(0, 200) + '...'}
                              {/* READ MORE LINK */}
                              <span className="text-blue-600 font-semibold ml-1 group-hover:underline">
                                {locale === 'ar' ? 'اقرأ المزيد' : locale === 'sv' ? 'Läs mer' : 'Read more'}
                              </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(post.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {post.views} {tr('views')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Button to go to the full News page */}
                <div className="text-center mt-10">
                  <Link
                    href={`/${locale}/news`}
                    className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-4 rounded-lg transition transform hover:scale-105"
                  >
                    {tr('seeAllPosts')}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* =================================================================== */}

      {/* Malmö Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            {tr('discoverMalmo')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-400">
              <div
                className={`overflow-hidden bg-blue-100 transition-all duration-700 ease-out ${zoomedCard === 'malmo-turning' ? 'h-96' : 'h-56'}`}
                onMouseLeave={() => setZoomedCard(null)}
              >
                <Image
                  src="/images/Turning-Torso-Malmo.png"
                  alt={tr('turningTorso')}
                  width={400}
                  height={300}
                  onClick={() => setZoomedCard('malmo-turning')}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> {tr('turningTorso')}
                </h3>
                <p className="text-gray-600">{tr('turningTorsoDesc')}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-400">
              <div
                className={`overflow-hidden bg-yellow-100 transition-all duration-700 ease-out ${zoomedCard === 'malmo-stortorget' ? 'h-96' : 'h-56'}`}
                onMouseLeave={() => setZoomedCard(null)}
              >
                <Image
                  src="/images/Stortorget.png"
                  alt={tr('stortorget')}
                  width={400}
                  height={300}
                  onClick={() => setZoomedCard('malmo-stortorget')}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Landmark className="h-5 w-5" /> {tr('stortorget')}
                </h3>
                <p className="text-gray-600">{tr('stortorgetDesc')}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-400">
              <div
                className={`overflow-hidden bg-teal-100 transition-all duration-700 ease-out ${zoomedCard === 'malmo-ribersborg' ? 'h-96' : 'h-56'}`}
                onMouseLeave={() => setZoomedCard(null)}
              >
                <Image
                  src="/images/Beach-Malmo.png"
                  alt={tr('ribersborg')}
                  width={400}
                  height={300}
                  onClick={() => setZoomedCard('malmo-ribersborg')}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Umbrella className="h-5 w-5" /> {tr('ribersborg')}
                </h3>
                <p className="text-gray-600">{tr('ribersborgDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Algiers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            {tr('discoverAlgiers')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-400">
              <div
                className={`overflow-hidden bg-blue-100 transition-all duration-700 ease-out ${zoomedCard === 'alger-capital' ? 'h-96' : 'h-56'}`}
                onMouseLeave={() => setZoomedCard(null)}
              >
                <Image
                  src="/images/Alger.png"
                  alt={tr('algiersCapital')}
                  width={400}
                  height={300}
                  onClick={() => setZoomedCard('alger-capital')}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Camera className="h-5 w-5" /> {tr('algiersCapital')}
                </h3>
                <p className="text-gray-600">{tr('algiersCapitalDesc')}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-400">
              <div
                className={`overflow-hidden bg-yellow-100 transition-all duration-700 ease-out ${zoomedCard === 'alger-notre-dame' ? 'h-96' : 'h-56'}`}
                onMouseLeave={() => setZoomedCard(null)}
              >
                <Image
                  src="/images/Basilika.png"
                  alt={tr('notreDame')}
                  width={400}
                  height={300}
                  onClick={() => setZoomedCard('alger-notre-dame')}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Church className="h-5 w-5" /> {tr('notreDame')}
                </h3>
                <p className="text-gray-600">{tr('notreDameDesc')}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-blue-400">
              <div
                className={`overflow-hidden bg-red-100 transition-all duration-700 ease-out ${zoomedCard === 'alger-poste' ? 'h-96' : 'h-56'}`}
                onMouseLeave={() => setZoomedCard(null)}
              >
                <Image
                  src="/images/Grandepost.png"
                  alt={tr('laGrandePoste')}
                  width={400}
                  height={300}
                  onClick={() => setZoomedCard('alger-poste')}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Mail className="h-5 w-5" /> {tr('laGrandePoste')}
                </h3>
                <p className="text-gray-600">{tr('laGrandePosteDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            {tr('ourActivities')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center border-2 border-blue-400">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{tr('network')}</h3>
              <p className="text-gray-600 text-sm">{tr('networkDesc')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center border-2 border-blue-400">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{tr('youth')}</h3>
              <p className="text-gray-600 text-sm">{tr('youthDesc')}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition text-center border-2 border-blue-400">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{tr('local')}</h3>
              <p className="text-gray-600 text-sm">{tr('localDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden min-h-[700px] md:min-h-[800px] lg:min-h-[900px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/enDelMed.png"
            alt={tr('callToAction')}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {tr('callToAction')}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              {tr('callToActionDesc')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href={`/${locale}/medlemsregistrering`}
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-10 py-5 rounded-lg text-xl transition transform hover:scale-105 shadow-lg inline-block border-2 border-yellow-400"
              >
                {tr('joinNowToday')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white px-10 py-5 rounded-lg text-xl transition transform hover:scale-105 inline-block"
              >
                {tr('contactLink')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}