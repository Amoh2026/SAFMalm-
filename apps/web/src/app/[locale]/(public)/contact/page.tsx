"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, Send, Home, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    ageGroup: '',
    swishRef: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const tr = (key: string) => t(`contact.${key}`);
  const trMembership = (key: string) => t(`membership.${key}`);
  const trCommon = (key: string) => t(`common.${key}`);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('Form submitted:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        ageGroup: '',
        swishRef: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative w-full h-75 md:h-100 lg:h-125 overflow-hidden bg-gray-100">
        <Image
          src="/images/Kontakt.png"
          alt={tr('contactTitle')}
          fill
          className="object-contain object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue-900">
            {tr('contactTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 text-center">
            {tr('contactSubtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-blue-900 mb-4">{tr('contactInfo')}</h2>
                
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-blue-900 font-medium flex items-center gap-2">
                    <span>📢</span>
                    <span>{tr('membershipInfo')}</span>
                    <ArrowRight className="h-5 w-5 text-yellow-600 animate-pulse" />
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <Home className="h-6 w-6 text-blue-900 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{tr('addressLabel')}:</p>
                      <p className="text-gray-800 font-medium">
                        Scheelegatan 7 <br />
                       212 28 Malmö
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <div className="h-6 w-6 shrink-0 mt-1 text-blue-900">🏢</div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{tr('orgNumber')}:</p>
                      <p className="text-gray-800 font-medium">{tr('orgNumberValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <div className="h-6 w-6 shrink-0 mt-1 text-blue-900">🏦</div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{tr('bankGiro')}:</p>
                      <p className="text-gray-800 font-medium">{tr('bankGiroValue')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <Phone className="h-6 w-6 text-blue-900 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{tr('phoneLabel')}:</p>
                      <p className="text-gray-800 font-medium">{tr('phoneValue')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                    <Mail className="h-6 w-6 text-blue-900 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{tr('emailLabel')}:</p>
                      <p className="text-gray-800 font-medium break-all">{tr('emailValue')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-blue-900 mb-4">
                  {tr('socialTitle')}
                </h3>
                
                <div className="flex flex-wrap gap-4 items-center">
                  <a 
                    href="https://www.facebook.com/p/Svensk-Algeriska-F%C3%B6reningen-100080588589924/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition text-lg font-medium"
                  >
                    {tr('facebook')}
                  </a>
                  
                  <span className="text-gray-400 text-2xl">|</span>
                  
                  <a 
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition text-lg font-medium"
                  >
                    {tr('instagram')}
                  </a>
                </div>
                
                <p className="text-gray-600 font-medium mt-4">
                  {tr('socialFollow')}
                </p>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">
                  {trMembership('title')}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {trMembership('subtitle')}
                </p>
              </div>

              {submitStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-xl font-bold text-green-800">{trMembership('successTitle')}</h3>
                  <p className="text-green-700">{trMembership('successMessage')}</p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {trCommon('back')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      {trMembership('nameLabel')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder={trMembership('namePlaceholder')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      {trMembership('phoneLabel')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder={trMembership('phonePlaceholder')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      {trMembership('emailLabel')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={trMembership('emailPlaceholder')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      {trMembership('addressLabel')}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={trMembership('addressPlaceholder')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      {trMembership('ageGroupLabel')}
                    </label>
                    <select
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 text-gray-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="">{trMembership('ageGroupPlaceholder')}</option>
                      <option value="25-64">{trMembership('ageGroup1')}</option>
                      <option value="65+">{trMembership('ageGroup2')}</option>
                      <option value="17-24">{trMembership('ageGroup3')}</option>
                    </select>
                  </div>

                  <div className="rounded-xl p-4 border-2 border-blue-400 bg-blue-50/30">
                    <h4 className="text-blue-900 font-bold text-sm mb-2">{trMembership('paymentTitle')}</h4>
                    <p className="text-gray-600 text-sm">{trMembership('paymentText')}</p>
                    <p className="text-blue-900 font-mono text-lg font-bold">{trMembership('paymentSwish')}</p>
                    <p className="text-gray-500 text-xs">{trMembership('paymentMessage')}</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium text-sm mb-1">
                      {trMembership('swishLabel')}
                    </label>
                    <input
                      type="text"
                      name="swishRef"
                      value={formData.swishRef}
                      onChange={handleChange}
                      placeholder={trMembership('swishPlaceholder')}
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border-2 border-blue-400 bg-blue-50/30">
                    <input
                      type="checkbox"
                      id="gdpr"
                      required
                      className="mt-1 w-4 h-4 accent-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="gdpr" className="text-gray-600 text-xs leading-relaxed">
                      {trMembership('gdprText')}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {trMembership('submittingButton')}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {trMembership('submitButton')}
                      </>
                    )}
                  </button>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700">
                      {trMembership('errorMessage')}
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Want to join section */}
          <div className="mt-12 text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-3xl mx-auto">
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
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
            >
              {tr('followFacebook')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}