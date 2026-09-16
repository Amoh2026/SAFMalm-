import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendAdminNotification } from '@/lib/email';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safmalmo.se';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=invalid`);
  }

  try {
    // Find application by token
    const snapshot = await adminDb
      .collection('members')
      .where('verificationToken', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=invalid`);
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check expiry
    if (data.verificationExpiresAt && data.verificationExpiresAt.toMillis() < Date.now()) {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=expired`);
    }

    // Check if already verified
    if (data.status !== 'pending_email') {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=already`);
    }

    // Update status
    await doc.ref.update({
      status: 'pending_review',
      emailConfirmedAt: Timestamp.now(),
      verificationToken: null,
    });

    // Send admin notification
    try {
      await sendAdminNotification({
        applicantName: data.name,
        applicationId: doc.id,
      });
    } catch (emailErr) {
      console.error('Admin notification failed:', emailErr);
    }

    return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=ok`);
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=error`);
  }
}