"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Search, ExternalLink, CheckCircle, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';

export default function NewInSwedenPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const tr = (key: string) => t(`newInSweden.${key}`);

  const categories = [
    { id: 'all', label: tr('allResources'), icon: '📚' },
    { id: 'migration', label: tr('migration'), icon: '🛂' },
    { id: 'education', label: tr('education'), icon: '🎓' },
    { id: 'transport', label: tr('transport'), icon: '🚌' },
    { id: 'housing', label: tr('housing'), icon: '🏠' },
    { id: 'healthcare', label: tr('healthcare'), icon: '🏥' },
    { id: 'banking', label: tr('banking'), icon: '🏦' },
    { id: 'services', label: tr('other'), icon: '🔧' },
  ];

  const resources = [
    {
      id: 'algerian-embassy',
      category: 'services',
      title: tr('embassyTitle'),
      description: tr('embassyDesc'),
      url: 'https://www.embalgeria.se/',
      icon: '🇩🇿',
      tags: tr('embassyTags').split(' '),
      phone: tr('embassyPhone'),
      email: tr('embassyEmail'),
      address: tr('embassyAddress'),
    },
    {
      id: 'migrationsverket',
      category: 'migration',
      title: tr('migrationTitle'),
      description: tr('migrationDesc'),
      url: 'https://www.migrationsverket.se/English.html',
      icon: '🛂',
      tags: tr('migrationTags').split(' '),
      phone: tr('migrationPhone'),
      email: tr('migrationEmail'),
      address: tr('migrationAddress'),
    },
    {
      id: 'antagning',
      category: 'education',
      title: tr('antagningTitle'),
      description: tr('antagningDesc'),
      url: 'https://www.antagning.se/',
      icon: '🎓',
      tags: tr('antagningTags').split(' '),
    },
    {
      id: 'mau-new-student',
      category: 'education',
      title: tr('malmoUniTitle'),
      description: tr('malmoUniDesc'),
      url: 'https://student.mau.se/en/my-studies/new-student/',
      icon: '🏛️',
      tags: tr('malmoUniTags').split(' '),
      address: tr('malmoUniAddress'),
    },
    {
      id: 'skanetrafiken',
      category: 'transport',
      title: tr('skanetrafikenTitle'),
      description: tr('skanetrafikenDesc'),
      url: 'https://www.skanetrafiken.se/',
      icon: '🚌',
      tags: tr('skanetrafikenTags').split(' '),
      phone: tr('skanetrafikenPhone'),
      address: tr('skanetrafikenAddress'),
    },
    {
      id: 'boplatssyd',
      category: 'housing',
      title: tr('boplatsTitle'),
      description: tr('boplatsDesc'),
      url: 'https://www.boplatssyd.se/',
      icon: '🏠',
      tags: tr('boplatsTags').split(' '),
      phone: tr('boplatsPhone'),
      address: tr('boplatsAddress'),
    },
    {
      id: '1177',
      category: 'healthcare',
      title: tr('vardguidenTitle'),
      description: tr('vardguidenDesc'),
      url: 'https://www.1177.se/',
      icon: '🏥',
      tags: tr('vardguidenTags').split(' '),
      phone: tr('vardguidenPhone'),
    },
    {
      id: 'bankid',
      category: 'banking',
      title: tr('bankIdTitle'),
      description: tr('bankIdDesc'),
      url: 'https://www.bankid.com/',
      icon: '🏦',
      tags: tr('bankIdTags').split(' '),
    },
    {
      id: 'malmo-stad',
      category: 'services',
      title: tr('malmoStadTitle'),
      description: tr('malmoStadDesc'),
      url: 'https://malmo.se/',
      icon: '🏙️',
      tags: tr('malmoStadTags').split(' '),
      phone: tr('malmoStadPhone'),
      email: tr('malmoStadEmail'),
      address: tr('malmoStadAddress'),
    },
    {
      id: 'skatteverket',
      category: 'migration',
      title: tr('skatteverketTitle'),
      description: tr('skatteverketDesc'),
      url: 'https://www.skatteverket.se/',
      icon: '📋',
      tags: tr('skatteverketTags').split(' '),
      phone: tr('skatteverketPhone'),
    },
    {
      id: 'arbetsformedlingen',
      category: 'services',
      title: tr('arbetsformedlingenTitle'),
      description: tr('arbetsformedlingenDesc'),
      url: 'https://www.arbetsformedlingen.se/',
      icon: '💼',
      tags: tr('arbetsformedlingenTags').split(' '),
      phone: tr('arbetsformedlingenPhone'),
    },
    {
      id: 'sfi',
      category: 'education',
      title: tr('sfiTitle'),
      description: tr('sfiDesc'),
      url: 'https://www.sfi.se/',
      icon: '📖',
      tags: tr('sfiTags').split(' '),
    },
    {
      id: 'skolstart-malmo',
      category: 'education',
      title: tr('skolstartTitle'),
      description: tr('skolstartDesc'),
      url: 'https://malmo.se/Skolstart',
      icon: '🏫',
      tags: tr('skolstartTags').split(' '),
      phone: tr('skolstartPhone'),
      email: tr('skolstartEmail'),
      address: tr('skolstartAddress'),
    },
    {
      id: 'skanegy',
      category: 'education',
      title: tr('skaneGyTitle'),
      description: tr('skaneGyDesc'),
      url: 'https://skanegy.se',
      icon: '📚',
      tags: tr('skaneGyTags').split(' '),
      phone: tr('skaneGyPhone'),
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      migration: '#60A5FA',
      education: '#34D399',
      transport: '#A78BFA',
      housing: '#FBBF24',
      healthcare: '#F87171',
      banking: '#818CF8',
      services: '#FB923C',
    };
    return colors[category] || '#60A5FA';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      migration: '🛂',
      education: '🎓',
      transport: '🚌',
      housing: '🏠',
      healthcare: '🏥',
      banking: '🏦',
      services: '🔧',
    };
    return emojis[category] || '📌';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      migration: tr('migration'),
      education: tr('education'),
      transport: tr('transport'),
      housing: tr('housing'),
      healthcare: tr('healthcare'),
      banking: tr('banking'),
      services: tr('other'),
    };
    return labels[category] || category;
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'all' || resource.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const stripHash = (tag: string) => tag.replace(/^#+/, '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-75 md:h-100 lg:h-125">
          <Image
            src="/images/liaison.png"
            alt={tr('title')}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </section>

      {/* Title and Introduction */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6 drop-shadow-lg">
            {tr('title')}
          </h1>
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-gray-700 text-base md:text-lg leading-relaxed space-y-4 text-left md:text-center">
            <p>{tr('subtitle')}</p>
            <p>{tr('description')}</p>
            <p>{tr('description2')}</p>
            <p className="text-blue-700 font-semibold">{tr('description3')}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Search & Categories */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={tr('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-600 outline-none transition"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {filteredResources.length}
            </span>
            {tr('resourcesFound')}
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResources.map((resource) => {
            const categoryColor = getCategoryColor(resource.category);

            return (
              <div
                key={resource.id}
                className="bg-blue-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-800 flex flex-col"
                style={{ minHeight: '320px', aspectRatio: '1 / 1' }}
              >
                <div className="flex flex-col h-full p-4 bg-white m-2 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getCategoryEmoji(resource.category)}</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: categoryColor + '33',
                        color: categoryColor,
                      }}
                    >
                      {getCategoryLabel(resource.category)}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: categoryColor + '22' }}
                    >
                      {resource.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
                        {resource.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-3 flex-1">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: categoryColor + '22',
                          color: categoryColor,
                        }}
                      >
                        #{stripHash(tag)}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{resource.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {(resource.phone || resource.email || resource.address) && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs space-y-1">
                      {resource.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="h-3 w-3 shrink-0" />
                          <a
                            href={`tel:${resource.phone}`}
                            className="hover:text-blue-600 truncate"
                          >
                            {resource.phone}
                          </a>
                        </div>
                      )}
                      {resource.email && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="h-3 w-3 shrink-0" />
                          <a
                            href={`mailto:${resource.email}`}
                            className="hover:text-blue-600 truncate"
                          >
                            {resource.email}
                          </a>
                        </div>
                      )}
                      {resource.address && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate text-xs">{resource.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded-lg transition text-xs w-full mt-auto"
                  >
                    {tr('visitWebsite')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{tr('noResults')}</p>
          </div>
        )}

        {/* CHECKLIST */}
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              ✅ {tr('checklistTitle')}
            </h2>
            <p className="text-white/80 mt-1">{tr('checklistDesc')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="lg:col-span-1 p-6 divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((step) => {
                const stepKey = `step${step}`;
                const stepColors = ['green', 'blue', 'indigo', 'purple', 'orange'];
                return (
                  <div
                    key={step}
                    className="flex items-start gap-3 p-3 hover:bg-green-50 rounded-lg transition"
                  >
                    <div className="shrink-0">
                      <div className={`w-8 h-8 bg-${stepColors[step - 1]}-500 text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                        {step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-lg">
                          {tr(stepKey)}
                        </span>
                        {step === 1 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            {tr('step1Important')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {tr(`${stepKey}Desc`)}
                      </p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                        {step === 1 && (
                          <>
                            <a
                              href="https://www.skatteverket.se/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              {tr('step1Action')}
                            </a>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{tr('step1Phone')}</span>
                          </>
                        )}
                        {step === 2 && (
                          <span className="text-gray-600">{tr('step2Banks')}</span>
                        )}
                        {step === 3 && (
                          <>
                            <a
                              href="https://www.bankid.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              {tr('step3Action')}
                            </a>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{tr('step3App')}</span>
                          </>
                        )}
                        {step === 4 && (
                          <>
                            <a
                              href="https://www.sfi.se/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              {tr('step4Action')}
                            </a>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{tr('step4Contact')}</span>
                          </>
                        )}
                        {step === 5 && (
                          <>
                            <a
                              href="https://www.skanetrafiken.se/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              {tr('step5Action')}
                            </a>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500">{tr('step5App')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1 bg-blue-900 p-8 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-blue-800">
              <div className="text-center text-white w-full">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-yellow-400">
                  🇸🇪 {tr('checklistTitle')}
                </h3>
                <div className="w-24 h-1 bg-yellow-400 mx-auto mb-4 rounded-full"></div>
                <p className="text-blue-100 text-sm mb-6">{tr('checklistDesc')}</p>

                <div className="space-y-3 text-left max-w-xs mx-auto">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 bg-blue-800/50 p-3 rounded-lg border border-blue-700"
                    >
                      <span className="text-yellow-400 font-bold text-lg">{step}</span>
                      <div>
                        <p className="text-white font-medium text-sm">
                          {tr(`step${step}`)}
                        </p>
                        <p className="text-blue-300 text-xs">
                          {tr(`step${step}Desc`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-blue-700">
                  <p className="text-blue-200 text-xs">{tr('tip')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Children & School */}
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {tr('childrenTitle')}
            </h2>
            <p className="text-white/80 mt-1">{tr('childrenDesc')}</p>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
              <p className="text-blue-800 text-sm">{tr('childrenImportant')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://malmo.se/Skolstart"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200"
              >
                <div className="text-3xl">🏫</div>
                <div>
                  <div className="font-semibold text-blue-800">{tr('schoolStart')}</div>
                  <div className="text-sm text-gray-600">{tr('schoolStartDesc')}</div>
                  <div className="text-xs text-blue-600 mt-1">{tr('schoolStartPhone')}</div>
                </div>
              </a>

              <a
                href="https://skanegy.se"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition border border-green-200"
              >
                <div className="text-3xl">📚</div>
                <div>
                  <div className="font-semibold text-green-800">{tr('skaneGy')}</div>
                  <div className="text-sm text-gray-600">{tr('skaneGyDesc')}</div>
                  <div className="text-xs text-green-600 mt-1">{tr('skaneGyLink')}</div>
                </div>
              </a>

              <a
                href="https://malmo.se/Forskola"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200"
              >
                <div className="text-3xl">🧸</div>
                <div>
                  <div className="font-semibold text-purple-800">{tr('preschool')}</div>
                  <div className="text-sm text-gray-600">{tr('preschoolDesc')}</div>
                  <div className="text-xs text-purple-600 mt-1">{tr('preschoolPhone')}</div>
                </div>
              </a>

              <a
                href="https://www.skanetrafiken.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200"
              >
                <div className="text-3xl">🚌</div>
                <div>
                  <div className="font-semibold text-orange-800">{tr('schoolCard')}</div>
                  <div className="text-sm text-gray-600">{tr('schoolCardDesc')}</div>
                  <div className="text-xs text-orange-600 mt-1">{tr('schoolCardPhone')}</div>
                </div>
              </a>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-600" />
                {tr('contactSkane')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">{tr('malmo').split(':')[0]}:</span>
                  <a href="tel:040-34-10-00" className="text-blue-600 hover:underline">
                    {tr('malmo').split(':')[1]}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">{tr('lund').split(':')[0]}:</span>
                  <a href="tel:046-359-50-00" className="text-blue-600 hover:underline">
                    {tr('lund').split(':')[1]}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">{tr('helsingborg').split(':')[0]}:</span>
                  <a href="tel:042-10-50-00" className="text-blue-600 hover:underline">
                    {tr('helsingborg').split(':')[1]}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Local Services */}
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {tr('localServices')}
            </h2>
            <p className="text-white/80 mt-1">{tr('localServicesDesc')}</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🏙️', key: 'malmoCity', href: 'https://malmo.se/' },
              { icon: '📚', key: 'library', href: 'https://malmo.se/bibliotek' },
              { icon: '🤝', key: 'integrationUnit', href: 'https://malmo.se/Integration' },
              { icon: '💼', key: 'jobMatch', href: 'https://malmo.se/Jobb' },
            ].map((service, index) => {
              const label = tr(service.key);
              const [title, desc] = label.split(' - ');
              return (
                <a
                  key={index}
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition hover:shadow-md"
                >
                  <div className="text-3xl">{service.icon}</div>
                  <div>
                    <div className="font-medium text-gray-800">{title}</div>
                    <div className="text-sm text-gray-500">{desc}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
            {tr('quickLinks')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center p-3 bg-white rounded-lg hover:shadow-md transition hover:scale-105 border border-yellow-100"
              >
                <div className="text-2xl mb-1">{resource.icon}</div>
                <div className="text-xs text-gray-600 truncate">{resource.title}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Emergency Alert */}
        <div className="mt-12 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
          <div className="text-red-800 font-bold text-lg mb-2">
            🚨 {tr('emergency')}
          </div>
          <div className="border-t border-red-200 pt-2">
            <div className="text-sm text-red-700 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">🇩🇿</span>
              <span>{tr('emergencyArabic')}</span>
              <span className="text-red-300 mx-1">|</span>
              <span className="font-medium">🇬🇧</span>
              <span>{tr('emergencyEnglish')}</span>
              <span className="text-red-300 mx-1">|</span>
              <span className="font-medium">🇫🇷</span>
              <span>{tr('emergencyFrench')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}