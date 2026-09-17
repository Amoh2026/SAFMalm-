'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Calendar, Mail, User, Phone, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  ageGroup: string;
  createdAt: any;
  approvedAt: any;
  approvedByName?: string;
}

export default function ApprovedMembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'members'),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const list: Member[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          name: data.name || 'Okand',
          email: data.email || '',
          phone: data.phone || '',
          ageGroup: data.ageGroup || '',
          createdAt: data.createdAt || '',
          approvedAt: data.approvedAt || '',
          approvedByName: data.approvedByName || '',
        });
      });
      list.sort((a, b) => {
        const ta = a.approvedAt?.toMillis?.() ?? 0;
        const tb = b.approvedAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setMembers(list);
      setError('');
    } catch (err) {
      console.error('Error fetching approved members:', err);
      setError('Kunde inte hamta medlemmar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
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

  const handleDeleteMember = async (m: Member) => {
    if (
      !confirm(
        `Radera ${m.name} permanent?\n\nDetta tar bort:\n- Medlemsansökan\n- Inloggning (Firebase Auth)\n- Användarprofil\n\nDetta kan inte ångras.`
      )
    )
      return;

    setActionLoading(m.id);
    try {
      const res = await fetch('/api/admin/delete-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: m.id,
          email: m.email,
          adminUid: user?.id || null,
          adminName: user?.name || 'Admin',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Server error');
      }
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
      alert(`${m.name} har raderats helt.`);
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Kunde inte radera medlemmen');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Laddar medlemmar...</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-blue-900">Godkanda medlemmar</h1>
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
            placeholder="Sok medlemmar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600"
          />
        </div>
      </div>

      <Card className="border-2 border-blue-400 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b-2 border-blue-400">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Namn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">E-post</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Alder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Godkand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Atgarder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Inga medlemmar matchar din sokning.' : 'Inga godkanda medlemmar annu.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{m.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{m.phone || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.ageGroup || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-blue-600" />
                          {m.approvedAt?.toDate
                            ? m.approvedAt.toDate().toLocaleDateString('sv-SE')
                            : m.approvedAt
                            ? new Date(m.approvedAt).toLocaleDateString('sv-SE')
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="border-2 border-red-400 bg-red-700 hover:bg-red-800"
                          onClick={() => handleDeleteMember(m)}
                          disabled={actionLoading === m.id}
                          title="Radera permanent"
                        >
                          {actionLoading === m.id ? '...' : <Trash2 className="h-4 w-4" />}
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
    </div>
  );
}