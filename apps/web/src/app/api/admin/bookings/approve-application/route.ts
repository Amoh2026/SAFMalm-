import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, action, adminUid, adminName } = body;

    if (!token || !action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const pendingRef = adminDb.collection('pending_verifications').doc(token);
    const snap = await pendingRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const data = snap.data()!;

    if (action === 'approve') {
      // NOW write to members — first time data enters the real DB
      const memberRef = await adminDb.collection('members').add({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        ageGroup: data.ageGroup,
        swishReference: data.swishReference || '',
        status: 'approved',
        createdAt: data.createdAt,
        emailConfirmedAt: data.emailConfirmedAt,
        approvedAt: FieldValue.serverTimestamp(),
        approvedBy: adminUid || null,
        approvedByName: adminName || null,
        rejectedAt: null,
        userAccountId: null,
      });

      // Delete the temp doc
      await pendingRef.delete();

      // Send approval email
      try {
        await sendApprovalEmail({ to: data.email, name: data.name });
      } catch (emailErr) {
        console.error('Approval email failed:', emailErr);
      }

      return NextResponse.json({ success: true, memberId: memberRef.id });
    }

    // action === 'reject'
    await pendingRef.delete();

    try {
      await sendRejectionEmail({ to: data.email, name: data.name });
    } catch (emailErr) {
      console.error('Rejection email failed:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin approve error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}