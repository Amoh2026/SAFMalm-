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
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  approved: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // 1. Fetch APPROVED users
        const approvedQuery = query(
          collection(db, 'users'),
          where('approved', '==', true)
        );
        const approvedSnap = await getDocs(approvedQuery);

        const approvedList: Member[] = [];
        approvedSnap.forEach((docSnap) => {
          const data = docSnap.data();
          approvedList.push({
            id: docSnap.id,
            name: data.name || 'Okänd',
            email: data.email || '',
            role: data.role || 'MEMBER',
            approved: true,
            createdAt: data.createdAt || '',
            approvedAt: data.approvedAt,
            approvedBy: data.approvedBy,
          });
        });

        approvedList.sort((a, b) => {
          const aDate = a.approvedAt || a.createdAt;
          const bDate = b.approvedAt || b.createdAt;
          return aDate > bDate ? -1 : 1;
        });

        setMembers(approvedList);

        // 2. Count pending users
        const pendingQuery = query(
          collection(db, 'users'),
          where('approved', '==', false)
        );
        const pendingSnap = await getDocs(pendingQuery);
        setPendingCount(pendingSnap.size);

        setError('');
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Kunde inte hämta medlemmar');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const filteredMembers = members.filter((member) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      member.name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Laddar medlemmar...</p>
      </div>
    );
  }

  if (!user) return null;
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

        <Button
          className="bg-yellow-600 hover:bg-yellow-700 text-white relative border-2 border-yellow-400 hover:border-yellow-500"
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-green-50 border-2 border-green-400 shadow-md">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Godkända medlemmar</p>
              <p className="text-2xl font-bold text-green-900">{members.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card
          className="bg-yellow-50 border-2 border-yellow-400 shadow-md cursor-pointer hover:bg-yellow-100 transition"
          onClick={() => router.push('/admin/members/applications')}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Väntande ansökningar</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <FileText className="h-8 w-8 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Sök medlemmar (skriv namn eller e-post)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Visar {filteredMembers.length} av {members.length} medlemmar som matchar "{searchTerm}"
          </p>
        )}
      </div>

      {/* Members Table */}
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
                    Godkänd
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm
                        ? `Inga medlemmar matchar "${searchTerm}"`
                        : 'Inga godkända medlemmar ännu.'}
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-sm text-gray-600">{member.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full border-2 ${
                            member.role === 'ADMIN'
                              ? 'border-purple-400 bg-purple-100 text-purple-800'
                              : 'border-blue-400 bg-blue-100 text-blue-800'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <div className="flex items-center gap-1">
    <Calendar className="h-3 w-3 text-green-600" />
    {formatDate(member.approvedAt || member.createdAt)}
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
          Visar {filteredMembers.length} av {members.length} medlemmar
        </p>
      </div>
    </div>
  );
}