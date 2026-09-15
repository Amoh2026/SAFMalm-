"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/providers/LanguageProvider';

export default function AboutPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Translation function for about namespace
  const tr = (key: string) => {
    if (!mounted) return key;
    const parts = key.split('.');
    if (parts.length === 2) {
      const [namespace, actualKey] = parts;
      return t(`${namespace}.${actualKey}`);
    }
    return t(`about.${key}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image - Full image shown with object-contain */}
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-100">
        <Image
          src="/images/OmOss.png"
          alt={tr('aboutTitle')}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Title Section - After the image */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 text-center">
          {tr('aboutTitle')}
        </h1>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* History */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">{tr('historyTitle')}</h2>
          <p className="text-gray-700 leading-relaxed">{tr('historyText')}</p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">{tr('missionTitle')}</h2>
          <p className="text-gray-700 mb-4">{tr('missionIntro')}</p>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li>{tr('communityGoal')}</li>
            <li>{tr('culturalExchange')}</li>
            <li>{tr('traditions')}</li>
            <li>{tr('integration')}</li>
            <li>{tr('eventsGoal')}</li>
          </ul>
        </div>

        {/* Values */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">{tr('valuesTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-bold text-blue-900 mb-2">{tr('community')}</h3>
              <p className="text-sm text-gray-600">{tr('communityText')}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="font-bold text-blue-900 mb-2">{tr('culture')}</h3>
              <p className="text-sm text-gray-600">{tr('cultureText')}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="font-bold text-blue-900 mb-2">{tr('engagement')}</h3>
              <p className="text-sm text-gray-600">{tr('engagementText')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}