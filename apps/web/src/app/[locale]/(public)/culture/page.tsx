"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Images, History, ChevronDown, ChevronUp } from 'lucide-react';

// Full gallery with dates - each item has a date to filter by month
const allCultureMedia = [
  {
    src: '/images/Folketspark-activity.png',
    name: 'Kulturfestival 2026',
    date: '2026-09-15', // Current month (September 2026)
  },
  {
    src: '/images/BonBon-Land.png',
    name: 'Ungdomsresa',
    date: '2026-09-10', // Current month (September 2026)
  },
  {
    src: '/images/Ambassador.png',
    name: 'Ambassadörsbesök',
    date: '2026-08-20', // Previous month
  },
  {
    src: '/images/Politic.png',
    name: 'Politikmöte',
    date: '2026-07-15', // Older
  },
  {
    src: '/images/BassUngdomar.png',
    name: 'Bussresa Ungdomar',
    date: '2026-06-10', // Older
  },
  {
    src: '/images/SverigesNationaldag.png',
    name: 'Sveriges Nationaldag',
    date: '2026-06-06', // Older
  },
];

// Hardkodad galleri för aktiviteter - ORIGINAL IMAGES
const cultureGallery = [
  {
    src: '/images/Folketspark-activity.png',
    alt: 'Kulturfestival i Folkets Park',
    key: 'festival'
  },
  {
    src: '/images/BonBon-Land.png',
    alt: 'Ungdomsresa till BonBon-Land',
    key: 'youthTrip'
  },
  {
    src: '/images/Ambassador.png',
    alt: 'Möte med ambassadören och ungdomar',
    key: 'embassy'
  },
  {
    src: '/images/Politic.png',
    alt: 'Engagemang i samhällsfrågor',
    key: 'community'
  },
  {
    src: '/images/BassUngdomar.png',
    alt: 'Bussresa över Öresundsbron',
    key: 'busTrip'
  },
  {
    src: '/images/SverigesNationaldag.png',
    alt: 'Firande av Sveriges Nationaldag',
    key: 'nationalDay'
  }
];

export default function KulturPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [showOldMedia, setShowOldMedia] = useState(false);

  const tr = (key: string) => t(`culture.${key}`);
  const trCommon = (key: string) => t(`common.${key}`);

  // ============================================================
  // Filter media by current month vs older
  // ============================================================
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Current month media
  const currentMonthMedia = allCultureMedia.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  // Older media (history)
  const oldMedia = allCultureMedia.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return !(itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear);
  });

  const getGalleryTitle = (key: string) => {
    switch (key) {
      case 'festival': return tr('festivalTitle');
      case 'youthTrip': return tr('youthTripTitle');
      case 'embassy': return tr('embassyMeetingTitle');
      case 'community': return tr('communityTitle');
      case 'busTrip': return tr('busTripTitle');
      case 'nationalDay': return tr('nationalDayTitle');
      default: return '';
    }
  };

  const getGalleryDesc = (key: string) => {
    switch (key) {
      case 'festival': return tr('festivalDesc');
      case 'youthTrip': return tr('youthTripDesc');
      case 'embassy': return tr('embassyMeetingDesc');
      case 'community': return tr('communityDesc');
      case 'busTrip': return tr('busTripDesc');
      case 'nationalDay': return tr('nationalDayDesc');
      default: return '';
    }
  };

  return (
    <div className="min-h-screen">

      {/* HERO SECTION - Image Only */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-75 md:h-100 lg:h-125">
          <Image
            src="/images/AlgerCombine.png"
            alt="Fritids- och föreningsaktiviteter"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      </section>

      {/* TEXT CONTENT - Below the image */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 mb-4">
              Fritids- och föreningsaktiviteter
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {tr('cultureDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* WHITE SECTION */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">

        {/* ==================== MEDIA SECTION (CURRENT MONTH ONLY) ==================== */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
              {tr('imagesAndDocs')}
            </h3>
            <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locale === 'ar' 
                ? 'صور من أنشطة هذا الشهر. هل تريد رؤية الصور القديمة؟ اضغط على زر عرض الأرشيف بالأسفل.'
                : locale === 'sv'
                ? 'Bilder från denna månads aktiviteter. Vill du se äldre bilder? Klicka på knappen Visa arkiv nedan.'
                : locale === 'fr'
                ? 'Images des activités de ce mois. Vous voulez voir les anciennes images ? Cliquez sur le bouton Afficher les archives ci-dessous.'
                : 'Images from this month\'s activities. Want to see older images? Click the Show Archive button below.'}
            </p>
          </div>
          
          {/* Current month images */}
          {currentMonthMedia.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentMonthMedia.map((img, index) => (
                <div key={index} className="rounded-lg overflow-hidden border-2 border-blue-400 shadow-md hover:shadow-xl transition-shadow">
                  <img 
                    src={img.src} 
                    alt={img.name}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-3 bg-blue-50">
                    <p className="text-sm font-semibold text-blue-900 text-center">{img.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <p className="text-gray-500">
                {locale === 'ar' ? 'لا توجد صور لهذا الشهر.' : 
                 locale === 'sv' ? 'Inga bilder för denna månad.' :
                 locale === 'fr' ? 'Aucune image pour ce mois.' :
                 'No images for this month.'}
              </p>
            </div>
          )}

          {/* ==================== SHOW ARCHIVE BUTTON ==================== */}
          <div className="text-center mt-8">
            <button
              onClick={() => setShowOldMedia(!showOldMedia)}
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition transform hover:scale-105 shadow-md"
            >
              <History className="h-5 w-5" />
              {showOldMedia 
                ? (locale === 'ar' ? 'إخفاء الأرشيف' : locale === 'sv' ? 'Dölj Arkiv' : locale === 'fr' ? 'Masquer les archives' : 'Hide Archive')
                : (locale === 'ar' ? 'عرض الأرشيف' : locale === 'sv' ? 'Visa Arkiv' : locale === 'fr' ? 'Afficher les archives' : 'Show Archive')
              }
              {showOldMedia ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* ==================== OLD MEDIA (HISTORY) ==================== */}
          {showOldMedia && (
            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-700">
                  🗂️ {locale === 'ar' ? 'أرشيف الصور' : locale === 'sv' ? 'Bildarkiv' : locale === 'fr' ? 'Archives' : 'Image Archive'}
                </h4>
                <div className="w-16 h-1 bg-gray-400 mx-auto rounded-full mt-2"></div>
              </div>

              {oldMedia.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {oldMedia.map((img, index) => (
                    <div key={index} className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm hover:shadow-lg transition-shadow opacity-90">
                      <img 
                        src={img.src} 
                        alt={img.name}
                        className="w-full h-48 object-cover grayscale hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="p-3 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-700 text-center">{img.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <p className="text-gray-500">
                    {locale === 'ar' ? 'لا توجد صور قديمة.' : 
                     locale === 'sv' ? 'Inga äldre bilder hittades.' :
                     locale === 'fr' ? 'Aucune ancienne image trouvée.' :
                     'No older images found.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* =================================================================== */}

        {/* GALLERY SECTION */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
              {tr('ourActivities')}
            </h3>
            <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {tr('ourActivitiesDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cultureGallery.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden border-2 border-blue-400"
              >
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6 flex flex-col grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-blue-900 leading-tight">
                      {getGalleryTitle(item.key)}
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed grow">
                    {getGalleryDesc(item.key)}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <span className="text-xs font-medium text-blue-800 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                      {trCommon('readMore')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LÄNK TILLBAKA TILL EVENEMANG */}
        <div className="mb-16">
          <Link 
            href="/evenemang"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {tr('backToEvents')}
          </Link>
        </div>

        {/* CONTACT SECTION */}
        <div className="relative rounded-3xl overflow-hidden mb-16 min-h-96 border-2 border-blue-400">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/Kontakt.png"
              alt={tr('contactTitle')}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/55"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800/30 via-yellow-700/20 to-amber-600/30"></div>
          </div>

          <div className="relative z-10 flex items-center justify-center min-h-96 px-6 py-16">
            <div className="text-center max-w-2xl">
              <div className="text-5xl mb-6 drop-shadow-lg"></div>
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
                {tr('contactTitle')}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 mx-auto rounded-full mb-6"></div>
              <p className="text-white text-lg md:text-xl mb-8" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.9)' }}>
                {tr('contactDesc')}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-blue-900 bg-yellow-500 hover:bg-yellow-400 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>{tr('contactButton')}</span>
                <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-400 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-blue-900 mb-2">
            {tr('wantToJoin')}
          </h3>
          <p className="text-gray-600 mb-4">
            {tr('wantToJoinDesc')}
          </p>
          <a
            href="https://www.facebook.com/p/Svensk-Algeriska-F%C3%B6reningen-100080588589924/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg inline-block"
          >
            {tr('followFacebook')}
          </a>
        </div>

      </div>
    </div>
  );
}