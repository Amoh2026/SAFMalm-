"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/providers/LanguageProvider';
import { ArrowRight, Users, Heart, Handshake, Globe, Target } from 'lucide-react';

export default function OmOssPage() {
  const { locale, t } = useLanguage();

  const tr = (key: string) => t(`about.${key}`);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
            {/* Hero Section */}
      <section className="relative w-full">
        {/* Image Container */}
        <div className="relative w-full h-[250px] md:h-[350px] lg:h-[400px]">
          <Image
            src="/images/Oresundsbron.png"
            alt={tr('aboutTitle')}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Keep the dark overlay if you want the image slightly darker */}
          <div className="absolute inset-0 bg-black/2"></div>
        </div>

        {/* Text Container - Moved OUTSIDE the image and placed below */}
        <div className="bg-white py-12 border-b border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4">
              {tr('aboutTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              {tr('heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Introduction */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8 border-2 border-blue-400">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {tr('associationIntro')}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {tr('associationWork')}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                {tr('associationPartners')}
              </p>
            </div>

            {/* Our Philosophy */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 mb-8 border-2 border-yellow-500/40 shadow-xl text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-6 leading-tight">
                {tr('philosophyQuote')}
              </h3>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-6 w-6 text-yellow-400" />
                    <h4 className="text-lg font-semibold text-yellow-300">
                      {tr('communityStrength')}
                    </h4>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    {tr('communityStrengthText')}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-6 w-6 text-yellow-400" />
                    <h4 className="text-lg font-semibold text-yellow-300">
                      {tr('individualInterest')}
                    </h4>
                  </div>
                  <p className="text-blue-100 leading-relaxed">
                    {tr('individualInterestText')}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
                <p className="text-blue-50 text-lg leading-relaxed">
                  {tr('philosophyDescription')}
                </p>
              </div>
            </div>

            {/* What We Offer */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8 border-2 border-blue-400">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">
                {tr('whatWeOffer')}
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    {tr('internationalNetwork')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {tr('internationalNetworkDesc')}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    {tr('youthGroup')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {tr('youthGroupDesc')}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Handshake className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">
                    {tr('localCollaboration')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {tr('localCollaborationDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 text-center border-2 border-yellow-500/40">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {tr('becomePartOfSAF')}
              </h2>
              <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
                {tr('becomePartOfSAFDesc')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href={`/${locale}/medlemsregistrering`}
                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-lg transition transform hover:scale-105 inline-flex items-center gap-2"
                >
                  {tr('becomeMember')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${locale}/kontakt`}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-3 rounded-lg transition transform hover:scale-105 inline-flex items-center gap-2"
                >
                  {tr('contactUs')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}