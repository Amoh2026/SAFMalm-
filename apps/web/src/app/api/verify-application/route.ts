import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { sendAdminNotification } from '@/lib/email';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.safmalmo.se';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=invalid`);
  }

  try {
    const ref = adminDb.collection('pending_verifications').doc(token);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=invalid`);
    }

    const data = snap.data()!;

    // Expiry check
    if (data.expiresAt) {
      const expiresMs =
        typeof data.expiresAt.toMillis === 'function'
          ? data.expiresAt.toMillis()
          : new Date(data.expiresAt).getTime();
      if (expiresMs < Date.now()) {
        return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=expired`);
      }
    }

    if (data.emailConfirmed === true) {
      return NextResponse.redirect(`${siteUrl}/sv/verify-success?status=already`);
    }

    // Mark confirmed — members is STILL untouched
    await ref.update({
      emailConfirmed: true,
      emailConfirmedAt: FieldValue.serverTimestamp(),
    });

    try {
      await sendAdminNotification({
        applicantName: data.name,
        applicantEmail: data.email,
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