// src/app/admin/members/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/providers/LanguageProvider';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  UserCheck,
  Mail,
  Phone,
  MapPin,
  User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  ageGroup: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export default function MembersPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'members'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Member[];
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Kunde inte hämta medlemmar');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      await updateDoc(doc(db, 'members', memberId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.email || 'admin'
      });
      await fetchMembers();
    } catch (error) {
      console.error('Error approving member:', error);
      alert('Kunde inte godkänna medlemmen');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (memberId: string) => {
    setActionLoading(memberId);
    try {
      await updateDoc(doc(db, 'members', memberId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
      await fetchMembers();
    } catch (error) {
      console.error('Error rejecting member:', error);
      alert('Kunde inte avvisa medlemmen');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredMembers = members.filter(member => {
    if (filter !== 'all' && member.status !== filter) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.phone?.includes(search)
      );
    }
    
    return true;
  });

  const pendingCount = members.filter(m => m.status === 'pending').length;
  const approvedCount = members.filter(m => m.status === 'approved').length;
  const rejectedCount = members.filter(m => m.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar medlemmar...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin')}
            className="border-2 border-blue-400 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <h1 className="text-2xl font-bold text-blue-900">👥 Medlemshantering</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            className="bg-yellow-600 hover:bg-yellow-700 text-white relative"
            onClick={() => setFilter('pending')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Väntande
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-50 border-blue-400' : ''}
          >
            Alla ({members.length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-yellow-50 border-2 border-yellow-400">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Väntande</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-2 border-green-400">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Godkända</p>
              <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-2 border-red-400">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Avvisade</p>
              <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sök medlemmar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Alla
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Väntande ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Godkända ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Avvisade ({rejectedCount})
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Members Table */}
      <Card className="border-2 border-blue-400 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 border-b-2 border-blue-400">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Namn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Kontakt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Åldersgrupp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-900 uppercase tracking-wider">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Inga medlemmar hittades.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {member.ageGroup || 'Ej angivet'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone || 'Ej angivet'}
                          </p>
                          {member.address && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {member.address}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full border-2 border-blue-400 bg-blue-50 text-blue-800">
                          {member.ageGroup || 'Ej angivet'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full border-2 ${
                          member.status === 'approved' 
                            ? 'border-green-400 bg-green-100 text-green-800'
                            : member.status === 'rejected'
                            ? 'border-red-400 bg-red-100 text-red-800'
                            : 'border-yellow-400 bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.status === 'approved' ? '✅ Godkänd' : 
                           member.status === 'rejected' ? '❌ Avvisad' : '⏳ Väntar'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {member.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white border-2 border-green-400 hover:border-green-500"
                                onClick={() => handleApprove(member.id)}
                                disabled={actionLoading === member.id}
                              >
                                {actionLoading === member.id ? '⏳' : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="border-2 border-red-400 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleReject(member.id)}
                                disabled={actionLoading === member.id}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" className="border-2 border-blue-400">
                            <Eye className="h-4 w-4 text-blue-600" />
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

      <div className="mt-4 text-sm text-gray-600">
        Visar {filteredMembers.length} av {members.length} medlemmar
      </div>
    </div>
  );
}