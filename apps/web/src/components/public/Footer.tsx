'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/providers/LanguageProvider';
import { Mail, Phone, Home } from 'lucide-react';

export function Footer() {
  const params = useParams();
  const locale = params?.locale as string || 'sv';
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t-4 border-yellow-500">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
         

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('common.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-yellow-400 transition">
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/evenemang`} className="hover:text-yellow-400 transition">
                  {t('navigation.events')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/culture`} className="hover:text-yellow-400 transition">
                  {t('navigation.culture')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-yellow-400 transition">
                  {t('navigation.contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/member/dashboard/boka`} className="hover:text-yellow-400 transition">
                  Boka lokal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('common.contact')}</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Home className="h-4 w-4 mt-1 shrink-0" />
                <span>Scheelegatan 7 <br /> 212 28 Malmö</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:07xxxxxxx" className="hover:text-yellow-400 transition">076-xxx xx xx</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:safmalmoe@gmail.com" className="hover:text-yellow-400 transition">safmalmoe@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Association Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('common.associationInfo')}</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-gray-400">{t('common.orgNumber')}</span>
                <span className="text-white">{t('common.orgNumberValue')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">{t('common.bankGiro')}</span>
                <span className="text-white">{t('common.bankGiroValue')}</span>
              </li>
            </ul>
            <div className="mt-4">
              <a 
                href="https://www.facebook.com/p/Svensk-Algeriska-F%C3%B6reningen-100080588589924/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg hover:bg-[#1877F2] hover:text-white transition group"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm group-hover:text-white">{t('common.facebook')}</span>
              </a>
            </div>
            <p className="text-sm mt-4 text-gray-400">{t('common.hashtags')}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>© 2026 Svensk Algeriska Föreningen i Malmö. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;