'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, CheckCircle, XCircle, Calendar, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, updateDoc, doc, query, where, Timestamp } from 'firebase/firestore';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ageGroup: string;
  swishReference: string;
  createdAt: string;
  status: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'members'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);

      const apps: Application[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        apps.push({
          id: docSnap.id,
          name: data.name || 'Okänd',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          ageGroup: data.ageGroup || '',
          swishReference: data.swishReference || '',
          createdAt: data.createdAt || '',
          status: data.status || 'pending',
        });
      });

      apps.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      setApplications(apps);
      setError('');
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Kunde inte hämta ansökningar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Laddar...</p>
      </div>
    );
  }

  const filtered = applications.filter(app =>
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (app: Application) => {
    if (!confirm(`Godkänn medlemsansökan från ${app.name}?`)) return;

    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, 'members', app.id), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy: user?.id || null,
        approvedByName: user?.name || 'Admin',
      });

      setApplications(prev => prev.filter(a => a.id !== app.id));
      alert(`${app.name} har godkänts!`);
    } catch (err) {
      console.error('Error approving:', err);
      alert('Kunde inte godkänna ansökan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: Application) => {
    if (!confirm(`Avvisa ansökan från ${app.name}?`)) return;

    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, 'members', app.id), {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectedBy: user?.id || null,
      });

      setApplications(prev => prev.filter(a => a.id !== app.id));
      alert('Ansökan avvisad.');
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('Kunde inte avvisa ansökan');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Laddar ansökningar...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/members')}
            className="border-2 border-blue-400 hover:bg-blue-50 hover:border-blue-600 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till medlemmar
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">📝 Medlemsansökningar</h1>
        </div>
        <div className="text-sm bg-yellow-50 border-2 border-yellow-400 px-4 py-2 rounded-lg font-medium text-yellow-800 text-center sm:text-left">
          {applications.length} väntande ansökningar
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sök ansökningar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
      </div>

      {/* Mobile card view — visible below md */}
      <div className="md:hidden space-y-4">
        {filtered.length === 0 ? (
          <Card className="border-2 border-blue-400">
            <CardContent className="p-8 text-center text-gray-500">
              {searchTerm ? 'Inga ansökningar matchar din sökning.' : 'Inga väntande ansökningar hittades.'}
            </CardContent>
          </Card>
        ) : (
          filtered.map((app) => (
            <Card key={app.id} className="border-2 border-blue-400 shadow-md overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Header: name + status badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-sm font-semibold text-gray-900 truncate">{app.name}</span>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full border-2 border-yellow-400 bg-yellow-100 text-yellow-800 font-semibold shrink-0">
                    Väntar
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 break-all">{app.email || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{app.phone || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">Åldersgrupp: {app.ageGroup || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-gray-500">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('sv-SE') : '-'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-blue-200">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white border-2 border-green-400"
                    onClick={() => handleApprove(app)}
                    disabled={actionLoading === app.id}
                  >
                    {actionLoading === app.id ? (
                      '⏳'
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Godkänn
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 border-2 border-red-400"
                    onClick={() => handleReject(app)}
                    disabled={actionLoading === app.id}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Avvisa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table view — visible from md and up */}
      <Card className="hidden md:block border-2 border-blue-400 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b-2 border-blue-400">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Namn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">E-post</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Åldersgrupp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Ansökningsdatum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Inga ansökningar matchar din sökning.' : 'Inga väntande ansökningar hittades.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{app.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{app.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{app.phone || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.ageGroup || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('sv-SE') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full border-2 border-yellow-400 bg-yellow-100 text-yellow-800 font-semibold">
                          Väntar
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-400 hover:border-green-500"
                            onClick={() => handleApprove(app)}
                            disabled={actionLoading === app.id}
                            title="Godkänn"
                          >
                            {actionLoading === app.id ? '⏳' : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="border-2 border-red-400 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(app)}
                            disabled={actionLoading === app.id}
                            title="Avvisa"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Visar {filtered.length} av {applications.length} ansökningar
        </p>
      </div>
    </div>
  );
}