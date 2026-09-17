import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, adminUid, adminName } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const results: any = {
      auth: false,
      firestore: false,
      audit: false,
    };

    try {
      await adminAuth().deleteUser(uid);
      results.auth = true;
    } catch (authErr: any) {
      if (authErr?.code === 'auth/user-not-found') {
        results.auth = 'not-found';
      } else {
        console.error('Auth delete failed:', authErr);
        results.auth = 'error: ' + (authErr?.message || String(authErr));
      }
    }

    try {
      await adminDb.collection('users').doc(uid).delete();
      results.firestore = true;
    } catch (fsErr: any) {
      console.error('Firestore delete failed:', fsErr);
      results.firestore = 'error: ' + (fsErr?.message || String(fsErr));
    }

    try {
      await adminDb.collection('deleted_users').add({
        originalUid: uid,
        email: email || null,
        deletedAt: new Date(),
        deletedBy: adminUid || null,
        deletedByName: adminName || null,
      });
      results.audit = true;
    } catch (auditErr) {
      console.warn('Audit log failed:', auditErr);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}