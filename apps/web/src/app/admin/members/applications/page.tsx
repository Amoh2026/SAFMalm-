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
  ageGroup: string;
  createdAt: string;
  status: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<'members' | 'users'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberApps, setMemberApps] = useState<Application[]>([]);
  const [userApps, setUserApps] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const memberQ = query(collection(db, 'members'), where('status', '==', 'pending'));
      const memberSnap = await getDocs(memberQ);
      const mApps: Application[] = [];
      memberSnap.forEach((d) => {
        const data = d.data();
        mApps.push({
          id: d.id,
          name: data.name || 'Okand',
          email: data.email || '',
          phone: data.phone || '',
          ageGroup: data.ageGroup || '',
          createdAt: data.createdAt || '',
          status: data.status || 'pending',
        });
      });
      mApps.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      setMemberApps(mApps);

      const userQ = query(collection(db, 'users'), where('approved', '==', false));
      const userSnap = await getDocs(userQ);
      const uApps: UserAccount[] = [];
      userSnap.forEach((d) => {
        const data = d.data();
        uApps.push({
          id: d.id,
          name: data.name || 'Okand',
          email: data.email || '',
          role: data.role || 'MEMBER',
          createdAt: data.createdAt || '',
        });
      });
      uApps.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      setUserApps(uApps);
      setError('');
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Kunde inte hamta ansokningar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Laddar...</p>
      </div>
    );
  }

  const handleApproveMember = async (app: Application) => {
    if (!confirm(`Godkann medlemsansokan fran ${app.name}?`)) return;
    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, 'members', app.id), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy: user?.id || null,
        approvedByName: user?.name || 'Admin',
      });
      setMemberApps((prev) => prev.filter((a) => a.id !== app.id));
      alert(`${app.name} har godkants!`);
    } catch (err) {
      console.error('Error approving:', err);
      alert('Kunde inte godkanna ansokan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectMember = async (app: Application) => {
    if (!confirm(`Avvisa ansokan fran ${app.name}?`)) return;
    setActionLoading(app.id);
    try {
      await updateDoc(doc(db, 'members', app.id), {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectedBy: user?.id || null,
      });
      setMemberApps((prev) => prev.filter((a) => a.id !== app.id));
      alert('Ansokan avvisad.');
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('Kunde inte avvisa ansokan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveUser = async (u: UserAccount) => {
    if (!confirm(`Godkann konto for ${u.name}?`)) return;
    setActionLoading(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), {
        approved: true,
        approvedAt: Timestamp.now(),
        approvedBy: user?.id || null,
        approvedByName: user?.name || 'Admin',
      });
      setUserApps((prev) => prev.filter((a) => a.id !== u.id));
      alert(`${u.name} kan nu logga in!`);
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Kunde inte godkanna kontot');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (u: UserAccount) => {
    if (!confirm(`Avvisa konto for ${u.name}?`)) return;
    setActionLoading(u.id);
    try {
      await updateDoc(doc(db, 'users', u.id), {
        approved: false,
        rejectedAt: Timestamp.now(),
        rejectedBy: user?.id || null,
        rejected: true,
      });
      setUserApps((prev) => prev.filter((a) => a.id !== u.id));
      alert('Konto avvisat.');
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Kunde inte avvisa kontot');
    } finally {
      setActionLoading(null);
    }
  };

  const filterMembers = (list: Application[]) =>
    list.filter(
      (app) =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filterUsers = (list: UserAccount[]) =>
    list.filter(
      (app) =>
        app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Laddar ansokningar...</p>
      </div>
    );
  }

  const filteredMembers = filterMembers(memberApps);
  const filteredUsers = filterUsers(userApps);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/members')}
            className="border-2 border-blue-400 hover:bg-blue-50 hover:border-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka till medlemmar
          </Button>
          <h1 className="text-3xl font-bold text-blue-900">Ansokningar</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setTab('members')}
          className={`px-6 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            tab === 'members'
              ? 'border-yellow-500 text-blue-900'
              : 'border-transparent text-gray-500 hover:text-blue-900'
          }`}
        >
          Medlemsansokningar ({memberApps.length})
        </button>
        <button
          onClick={() => setTab('users')}
          className={`px-6 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            tab === 'users'
              ? 'border-yellow-500 text-blue-900'
              : 'border-transparent text-gray-500 hover:text-blue-900'
          }`}
        >
          Kontoansokningar ({userApps.length})
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sok ansokningar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
      </div>

      {tab === 'members' && (
        <Card className="border-2 border-blue-400 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b-2 border-blue-400">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Namn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">E-post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Aldersgrupp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Atgarder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'Inga ansokningar matchar din sokning.' : 'Inga vantande medlemsansokningar.'}
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((app) => (
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
                            <span className="text-sm text-gray-600">{app.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{app.ageGroup || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString('sv-SE') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-400 hover:border-green-500"
                              onClick={() => handleApproveMember(app)}
                              disabled={actionLoading === app.id}
                            >
                              {actionLoading === app.id ? '...' : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="border-2 border-red-400"
                              onClick={() => handleRejectMember(app)}
                              disabled={actionLoading === app.id}
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
      )}

      {tab === 'users' && (
        <Card className="border-2 border-blue-400 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b-2 border-blue-400">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Namn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">E-post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Roll</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Registrerad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Atgarder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'Inga konton matchar din sokning.' : 'Inga vantande kontoansokningar.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-blue-50/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-600">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full border-2 border-blue-400 bg-blue-100 text-blue-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-blue-600" />
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('sv-SE') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-400 hover:border-green-500"
                              onClick={() => handleApproveUser(u)}
                              disabled={actionLoading === u.id}
                            >
                              {actionLoading === u.id ? '...' : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="border-2 border-red-400"
                              onClick={() => handleRejectUser(u)}
                              disabled={actionLoading === u.id}
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
      )}
    </div>
  );
}