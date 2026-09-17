import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { sendAdminNotification } from '@/lib/email';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://safmalmo.se';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=invalid`);
  }

  try {
    const snapshot = await adminDb
      .collection('members')
      .where('verificationToken', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=invalid`);
    }

    const doc = snapshot.docs[0];
    const data: any = doc.data();

    if (data.verificationExpiresAt) {
      const expiresAtMs =
        typeof data.verificationExpiresAt.toMillis === 'function'
          ? data.verificationExpiresAt.toMillis()
          : new Date(data.verificationExpiresAt).getTime();
      if (expiresAtMs < Date.now()) {
        return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=expired`);
      }
    }

    if (data.status !== 'pending_email') {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=already`);
    }

    await adminDb.collection('members').doc(doc.id).update({
      status: 'pending_review',
      emailConfirmedAt: FieldValue.serverTimestamp(),
      verificationToken: FieldValue.delete(),
    });

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