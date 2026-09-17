import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import { sendConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, ageGroup, swishReference } = body;

    if (!name || !phone || !email || !ageGroup) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailLower = String(email).toLowerCase().trim();
    const db = adminDb();

    const existingPending = await db
      .collection('pending_verifications')
      .where('email', '==', emailLower)
      .limit(1)
      .get();

    if (!existingPending.empty) {
      return NextResponse.json(
        { success: false, error: 'En ansökan med denna e-post finns redan.' },
        { status: 409 }
      );
    }

    const existingMember = await db
      .collection('members')
      .where('email', '==', emailLower)
      .where('status', '==', 'approved')
      .limit(1)
      .get();

    if (!existingMember.empty) {
      return NextResponse.json(
        { success: false, error: 'Du är redan medlem.' },
        { status: 409 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    await db.collection('pending_verifications').doc(token).set({
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      address: (address || '').trim(),
      ageGroup,
      swishReference: (swishReference || '').trim(),
      emailConfirmed: false,
      emailConfirmedAt: null,
      createdAt: now,
      expiresAt,
    });

    try {
      await sendConfirmationEmail({
        to: emailLower,
        name: name.trim(),
        token,
      });
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Ansökan mottagen. Kolla din e-post för att bekräfta.',
    });
  } catch (error: any) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}