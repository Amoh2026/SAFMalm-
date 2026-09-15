"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/providers/LanguageProvider';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Images, Calendar, MapPin, Clock, Users, History, ChevronDown, ChevronUp } from 'lucide-react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

import type { Visibility } from '@/components/ui/FileUploadWithVisibility';

// Mock-data for media
const eventMedia = {
  images: [
    { url: '/images/Folketspark-activity.png', name: 'Kulturfestival', type: 'image' as const, visibility: 'PUBLIC' as Visibility },
    { url: '/images/BonBon-Land.png', name: 'Ungdomsresa', type: 'image' as const, visibility: 'MEMBER' as Visibility },
    { url: '/images/Ambassador.png', name: 'Ambassadorbesok', type: 'image' as const, visibility: 'ADMIN' as Visibility },
  ],
  documents: []
};

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxParticipants?: number;
  imageUrl?: string;
  status?: string;
  createdAt?: any;
}

export default function EventsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for expanded images - tracks which image is expanded by index
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // 👇 NEW: State to toggle history view
  const [showHistory, setShowHistory] = useState(false);

  const tr = (key: string) => t(`events.${key}`);
  const trCommon = (key: string) => t(`common.${key}`);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventsCollection = collection(db, 'events');
      const eventsQuery = query(eventsCollection, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(eventsQuery);
      
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          maxParticipants: data.maxParticipants || null,
          imageUrl: data.imageUrl || null,
          status: data.status || 'Publicerad',
          createdAt: data.createdAt,
        });
      });
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Kunde inte ladda evenemang. Försök igen senare.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('sv-SE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Handle click to expand
  const handleImageClick = (index: number) => {
    setExpandedIndex(index);
  };

  // Handle mouse leave to collapse
  const handleImageMouseLeave = () => {
    setExpandedIndex(null);
  };

  // Function to get the correct href with locale
  const getLocalizedHref = (path: string) => {
    const locales = ['sv', 'en', 'ar', 'fr'];
    for (const loc of locales) {
      if (path.startsWith(`/${loc}/`) || path === `/${loc}`) {
        return path;
      }
    }
    return `/sv${path}`;
  };

  // ============================================================
  // 👇 NEW: Filter events by current month vs history
  // ============================================================
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Events happening in the current month (upcoming or recent)
  const currentMonthEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  });

  // All other events (history - past months and past years)
  const historyEvents = events.filter((event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return !(eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear);
  });

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gray-100">
        <div className="relative w-full h-75 md:h-100 lg:h-125">
          <Image
            src="/images/evenemang.png"
            alt={tr('eventsTitle')}
            fill
            className="object-contain object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4">
              {tr('eventsTitle')}
            </h1>
            <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full mb-6"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {tr('eventsDescription')}
            </p>
          </div>

          {/* ==================== CURRENT MONTH EVENTS ==================== */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
                📅 {tr('eventsSubtitle')}
              </h2>
              <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full"></div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-500">{trCommon('loading')}</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-2xl border-2 border-red-400 p-8">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-600 text-lg">{error}</p>
                <button 
                  onClick={fetchEvents}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Försök igen
                </button>
              </div>
            ) : currentMonthEvents.length === 0 ? (
              <div className="text-center bg-gray-50 rounded-2xl p-12 border border-gray-200">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">
                  {tr('noEvents')}
                </h3>
                <p className="text-gray-500">
                  {tr('followFacebook')}
                </p>
                <Link 
                  href="https://facebook.com" 
                  target="_blank"
                  className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  {tr('followFacebook')}
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {currentMonthEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg border-2 border-blue-400 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-blue-900 mb-2">
                            {event.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              {formatDate(event.date)}
                            </span>
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-blue-600" />
                                {event.time}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              {event.location}
                            </span>
                            {event.maxParticipants && (
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-blue-600" />
                                Max {event.maxParticipants} deltagare
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {event.imageUrl && (
                          <div className="shrink-0">
                            <img 
                              src={event.imageUrl} 
                              alt={event.title}
                              className="w-32 h-32 object-cover rounded-lg border-2 border-blue-400 transition-all duration-300 cursor-pointer hover:shadow-lg"
                              onClick={() => {
                                const imgIndex = eventMedia.images.findIndex(img => img.url === event.imageUrl);
                                if (imgIndex !== -1) {
                                  handleImageClick(imgIndex);
                                }
                              }}
                              onMouseLeave={handleImageMouseLeave}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==================== HISTORY BUTTON & EXPANDABLE SECTION ==================== */}
          <div className="mt-12">
            {/* History Toggle Button */}
            <div className="text-center">
             <button
  onClick={() => setShowHistory(!showHistory)}
  className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition transform hover:scale-105 shadow-md"
>
  <History className="h-5 w-5" />
  {showHistory ? tr('hideHistory') : tr('showHistory')}
  {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
</button>
            </div>

            {/* History Events List (Expandable) */}
            {showHistory && (
              <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="text-center mb-6">
  <h3 className="text-2xl font-bold text-gray-700">
    🗂️ {tr('previousEvents')}
  </h3>
  <div className="w-16 h-1 bg-gray-400 mx-auto rounded-full mt-2"></div>
</div>

{historyEvents.length === 0 ? (
  <div className="text-center bg-gray-50 rounded-2xl p-8 border border-gray-200">
    <p className="text-gray-500">{tr('noHistory')}</p>
  </div>
) : (
                  historyEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="bg-gray-50 rounded-2xl shadow-md border-2 border-gray-300 overflow-hidden hover:shadow-lg transition-shadow opacity-90"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-700 mb-2">
                              {event.title}
                            </h3>
                            
                            <p className="text-gray-500 mb-4 line-clamp-2">
                              {event.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(event.date)}
                              </span>
                              {event.time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {event.time}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                          
                          {event.imageUrl && (
                            <div className="shrink-0">
                              <img 
                                src={event.imageUrl} 
                                alt={event.title}
                                className="w-24 h-24 object-cover rounded-lg border border-gray-300 grayscale hover:grayscale-0 transition-all duration-300"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* =================================================================== */}

          {/* Gallery Section */}
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
                 {tr('newInGallery')}
              </h2>
              <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full"></div>
              <p className="text-gray-500 mt-3">
                {user 
                  ? tr('newInGalleryDesc')
                  : tr('loginToSeeMore')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {eventMedia.images.map((img, index) => {
                const isExpanded = expandedIndex === index;
                
                return (
                  <div 
                    key={index} 
                    className={`rounded-lg overflow-hidden border-2 ${
                      isExpanded ? 'border-yellow-500 shadow-2xl' : 'border-blue-400 shadow-md'
                    } transition-all duration-300 cursor-pointer hover:shadow-xl`}
                    onClick={() => handleImageClick(index)}
                    onMouseLeave={handleImageMouseLeave}
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={img.url} 
                        alt={img.name}
                        className={`w-full object-cover transition-all duration-500 ease-out ${
                          isExpanded ? 'h-96 scale-125' : 'h-48 scale-100'
                        }`}
                      />
                      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                        isExpanded ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                      }`}>
                        <p className="text-white font-bold text-lg text-center">{img.name}</p>
                        <p className="text-white/70 text-xs text-center">
                          {isExpanded ? 'Förstorad 125%' : 'Klicka för att förstora'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-400">✦ ✦ ✦</span>
            </div>
          </div>

          {/* Culture Gallery Link */}
          <div className="bg-blue-900 rounded-2xl p-6 md:p-8 shadow-lg border-b-4 border-yellow-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full shadow-md backdrop-blur-sm">
                  <Images className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {tr('newInGallery')}
                  </h3>
                  <p className="text-blue-200">
                    {tr('newInGalleryDesc')}
                  </p>
                </div>
              </div>
              <Link 
                href={getLocalizedHref('/culture')}
                className="bg-white hover:bg-gray-100 text-blue-900 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                {tr('visitCulture')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}