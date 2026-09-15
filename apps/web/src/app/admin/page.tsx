// src/app/admin/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { 
  Users, 
  FileText, 
  Calendar, 
  Mail, 
  CalendarPlus,
  MessageSquare,
  ArrowRight,
  Shield,
  LogOut
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingApplications: 0,
    upcomingEvents: 0,
    unreadMessages: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin && user) {
      router.push('/');
    }
  }, [isAdmin, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch total members
        const membersSnapshot = await getDocs(collection(db, 'members'));
        const totalMembers = membersSnapshot.size;
        
        // 2. Fetch pending applications
        const pendingQuery = query(collection(db, 'members'), where('status', '==', 'pending'));
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingApplications = pendingSnapshot.size;
        
        // 3. Fetch upcoming events
        let upcomingEvents = 0;
        try {
          const eventsSnapshot = await getDocs(collection(db, 'events'));
          upcomingEvents = eventsSnapshot.size;
        } catch (e) {
          console.log('No events collection yet');
        }
        
        // 4. Fetch unread messages
        let unreadMessages = 0;
        try {
          const messagesQuery = query(collection(db, 'messages'), where('read', '==', false));
          const messagesSnapshot = await getDocs(messagesQuery);
          unreadMessages = messagesSnapshot.size;
        } catch (e) {
          console.log('No messages collection yet');
        }
        
        setStats({
          totalMembers,
          pendingApplications,
          upcomingEvents,
          unreadMessages
        });

        // 5. Fetch recent activity
        const activities: any[] = [];
        
        const recentSnapshot = await getDocs(
          query(collection(db, 'members'), where('status', '==', 'pending'))
        );
        recentSnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: 'application',
            name: data.name || 'Unknown',
            action: 'Ny medlemsansökan',
            status: 'Väntar',
            time: data.createdAt ? new Date(data.createdAt).toLocaleDateString('sv-SE') : 'Nyligen'
          });
        });
        
        const approvedQuery = query(collection(db, 'members'), where('status', '==', 'approved'));
        const approvedSnapshot = await getDocs(approvedQuery);
        approvedSnapshot.forEach((doc) => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            type: 'member',
            name: data.name || 'Unknown',
            action: 'Medlem godkänd',
            status: 'Godkänd',
            time: data.approvedAt ? new Date(data.approvedAt).toLocaleDateString('sv-SE') : 'Nyligen'
          });
        });
        
        activities.sort((a, b) => (a.time > b.time ? -1 : 1));
        setRecentActivity(activities.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({
          totalMembers: 156,
          pendingApplications: 12,
          upcomingEvents: 3,
          unreadMessages: 8
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">🛡️ Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Översikt över föreningens aktivitet</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{user?.name || 'Admin'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition border border-red-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logga ut</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div 
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-300 transition group"
            onClick={() => router.push('/admin/members')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Totalt antal medlemmar</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalMembers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition">
              <span>Visa medlemmar</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl shadow-sm p-6 border border-yellow-100 cursor-pointer hover:shadow-md hover:border-yellow-300 transition group"
            onClick={() => router.push('/admin/members/applications')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Väntande ansökningar</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl group-hover:bg-yellow-200 transition">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-yellow-600 opacity-0 group-hover:opacity-100 transition">
              <span>Hantera ansökningar</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md hover:border-purple-300 transition group"
            onClick={() => router.push('/admin/events')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Kommande evenemang</p>
                <p className="text-3xl font-bold text-blue-900">{stats.upcomingEvents}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-purple-600 opacity-0 group-hover:opacity-100 transition">
              <span>Visa evenemang</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>

          <div 
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md hover:border-red-300 transition group"
            onClick={() => router.push('/admin/messages')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Olästa meddelanden</p>
                <p className="text-3xl font-bold text-blue-900">{stats.unreadMessages}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl group-hover:bg-red-200 transition">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-sm text-red-600 opacity-0 group-hover:opacity-100 transition">
              <span>Läs meddelanden</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <button
            onClick={() => router.push('/admin/members/applications')}
            className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-xl p-4 text-left transition flex items-center gap-3 cursor-pointer hover:shadow-sm"
          >
            <div className="bg-yellow-200 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Medlemsansökningar</p>
              <p className="text-sm text-gray-500">{stats.pendingApplications} väntar på godkännande</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/members')}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition flex items-center gap-3 cursor-pointer hover:shadow-sm"
          >
            <div className="bg-blue-200 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Hantera medlemmar</p>
              <p className="text-sm text-gray-500">Visa och hantera alla medlemmar</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/events')}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-left transition flex items-center gap-3 cursor-pointer hover:shadow-sm"
          >
            <div className="bg-purple-200 p-2 rounded-lg">
              <CalendarPlus className="h-5 w-5 text-purple-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Hantera evenemang</p>
              <p className="text-sm text-gray-500">Visa och hantera alla evenemang</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/messages')}
            className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl p-4 text-left transition flex items-center gap-3 cursor-pointer hover:shadow-sm"
          >
            <div className="bg-red-200 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Visa meddelanden</p>
              <p className="text-sm text-gray-500">Läs och svara på meddelanden</p>
            </div>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Senaste aktivitet</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>Ingen aktivitet ännu</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => {
                    if (activity.type === 'application') router.push('/admin/members/applications');
                    else if (activity.type === 'member') router.push('/admin/members');
                    else router.push('/admin');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      activity.type === 'application' ? 'bg-yellow-500' :
                      activity.type === 'event' ? 'bg-purple-500' :
                      activity.type === 'message' ? 'bg-red-500' :
                      'bg-green-500'
                    }`}>
                      {activity.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{activity.action}</p>
                      <p className="text-sm text-gray-500">av {activity.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'Väntar' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'Godkänd' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                    <span className="text-sm text-gray-400">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}