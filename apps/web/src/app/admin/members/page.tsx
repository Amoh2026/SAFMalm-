'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Search,
  UserCheck,
  FileText,
  ArrowLeft,
  Mail,
  Calendar,
  User as UserIcon,
  Shield,
  Clock,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: any;
  approvedAt?: any;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'all' | 'admins' | 'members' | 'pending'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);

        const usersSnap = await getDocs(collection(db, 'users'));
        const list: UserDoc[] = [];
        usersSnap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            name: data.name || 'Okand',
            email: data.email || '',
            role: data.role || 'MEMBER',
            approved: data.approved === true,
            createdAt: data.createdAt || '',
            approvedAt: data.approvedAt,
          });
        });
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        setUsers(list);

        const pendingQ = query(
          collection(db, 'pending_verifications'),
          where('emailConfirmed', '==', true)
        );
        const pendingSnap = await getDocs(pendingQ);
        setPendingCount(pendingSnap.size);

        setError('');
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Kunde inte hämta medlemmar');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const formatDate = (value: any) => {
    if (!value) return '-';
    let date: Date;
    if (typeof value?.toDate === 'function') {
      date = value.toDate();
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (typeof value === 'object' && 'seconds' in value) {
      date = new Date(value.seconds * 1000);
    } else {
      return '-';
    }
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('sv-SE');
  };

  const handleDeleteUser = async (u: UserDoc) => {
    if (
      !confirm(
        `Radera ${u.name} permanent?\n\nDetta tar bort:\n- Inloggning (Firebase Auth)\n- Användarprofil (Firestore)\n\nDetta kan inte ångras.`
      )
    )
      return;

    setActionLoading(u.id);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: u.id,
          email: u.email,
          adminUid: user?.id || null,
          adminName: user?.name || 'Admin',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Server error');
      }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      alert(`${u.name} har raderats.`);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Kunde inte radera användaren');
    } finally {
      setActionLoading(null);
    }
  };

  const admins = users.filter((u) => u.role === 'ADMIN');
  const members = users.filter((u) => u.role === 'MEMBER' && u.approved);
  const pendingUsers = users.filter((u) => !u.approved);

  const currentList =
    tab === 'admins'
      ? admins
      : tab === 'members'
      ? members
      : tab === 'pending'
      ? pendingUsers
      : users;

  const filtered = currentList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Laddar medlemmar...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/dashboard')}
            className="border-2 border-blue-400 hover:bg-blue-50 hover:border-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            👥 Medlemshantering
          </h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-400"
            onClick={() => router.push('/admin/members/approved')}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Godkända ansökningar
          </Button>
          <Button
            className="bg-yellow-600 hover:bg-yellow-700 text-white relative border-2 border-yellow-400"
            onClick={() => router.push('/admin/members/applications')}
          >
            <FileText className="h-4 w-4 mr-2" />
            <span className="mr-6">Medlemsansökningar</span>
            {pendingCount > 0 && (
              <span className="absolute top-1/2 -translate-y-1/2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card
          className={`bg-blue-50 border-2 border-blue-400 shadow-md cursor-pointer transition ${
            tab === 'all' ? 'ring-4 ring-blue-300' : 'hover:bg-blue-100'
          }`}
          onClick={() => setTab('all')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Alla</p>
              <p className="text-2xl font-bold text-blue-900">{users.length}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card
          className={`bg-purple-50 border-2 border-purple-400 shadow-md cursor-pointer transition ${
            tab === 'admins' ? 'ring-4 ring-purple-300' : 'hover:bg-purple-100'
          }`}
          onClick={() => setTab('admins')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-purple-900">{admins.length}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </CardContent>
        </Card>

        <Card
          className={`bg-green-50 border-2 border-green-400 shadow-md cursor-pointer transition ${
            tab === 'members' ? 'ring-4 ring-green-300' : 'hover:bg-green-100'
          }`}
          onClick={() => setTab('members')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Medlemmar</p>
              <p className="text-2xl font-bold text-green-900">{members.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card
          className={`bg-yellow-50 border-2 border-yellow-400 shadow-md cursor-pointer transition ${
            tab === 'pending' ? 'ring-4 ring-yellow-300' : 'hover:bg-yellow-100'
          }`}
          onClick={() => setTab('pending')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Väntande</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingUsers.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200 overflow-x-auto">
        <button
          onClick={() => setTab('all')}
          className={`px-6 py-3 font-semibold transition border-b-4 -mb-0.5 whitespace-nowrap ${
            tab === 'all'
              ? 'border-blue-500 text-blue-900'
              : 'border-transparent text-gray-500 hover:text-blue-900'
          }`}
        >
          Alla ({users.length})
        </button>
        <button
          onClick={() => setTab('admins')}
          className={`px-6 py-3 font-semibold transition border-b-4 -mb-0.5 whitespace-nowrap ${
            tab === 'admins'
              ? 'border-purple-500 text-purple-900'
              : 'border-transparent text-gray-500 hover:text-purple-900'
          }`}
        >
          Admins ({admins.length})
        </button>
        <button
          onClick={() => setTab('members')}
          className={`px-6 py-3 font-semibold transition border-b-4 -mb-0.5 whitespace-nowrap ${
            tab === 'members'
              ? 'border-green-500 text-green-900'
              : 'border-transparent text-gray-500 hover:text-green-900'
          }`}
        >
          Medlemmar ({members.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-6 py-3 font-semibold transition border-b-4 -mb-0.5 whitespace-nowrap ${
            tab === 'pending'
              ? 'border-yellow-500 text-yellow-900'
              : 'border-transparent text-gray-500 hover:text-yellow-900'
          }`}
        >
          Väntande ({pendingUsers.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sök (namn eller e-post)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600"
          />
        </div>
      </div>

      {/* List */}
      <Card className="border-2 border-blue-400 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b-2 border-blue-400">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Namn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    E-post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Roll
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Registrerad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm
                        ? `Inga matchningar för "${searchTerm}"`
                        : 'Inga användare i denna kategori.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {u.role === 'ADMIN' ? (
                            <Shield className="h-4 w-4 text-purple-600" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full border-2 ${
                            u.role === 'ADMIN'
                              ? 'border-purple-400 bg-purple-100 text-purple-800'
                              : 'border-blue-400 bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            u.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {u.approved ? 'Godkänd' : 'Väntar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          {formatDate(u.approvedAt || u.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="border-2 border-red-400 bg-red-700 hover:bg-red-800"
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading === u.id}
                          title="Radera permanent"
                        >
                          {actionLoading === u.id ? (
                            '...'
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
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
          Visar {filtered.length} av {currentList.length} användare
        </p>
      </div>
    </div>
  );
}