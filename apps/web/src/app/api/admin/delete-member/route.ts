import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, email, adminUid, adminName } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    const results: any = { member: false, auth: 'skipped', users: 'skipped', audit: false };

    // 1. Delete the members doc
    try {
      await adminDb.collection('members').doc(memberId).delete();
      results.member = true;
    } catch (err: any) {
      console.error('Members delete failed:', err);
      results.member = 'error: ' + err.message;
    }

    // 2. Find user by email in Firebase Auth and delete
    if (email) {
      try {
        const userRecord = await getAuth().getUserByEmail(email);
        await getAuth().deleteUser(userRecord.uid);
        results.auth = true;

        try {
          await adminDb.collection('users').doc(userRecord.uid).delete();
          results.users = true;
        } catch (fsErr: any) {
          console.error('Users doc delete failed:', fsErr);
          results.users = 'error: ' + fsErr.message;
        }
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found') {
          results.auth = 'not-found';
        } else {
          console.error('Auth lookup/delete failed:', authErr);
          results.auth = 'error: ' + authErr.message;
        }
      }
    }

    // 3. Audit trail
    try {
      await adminDb.collection('deleted_members').add({
        originalMemberId: memberId,
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
    console.error('Delete member error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}