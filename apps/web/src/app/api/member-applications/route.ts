import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendConfirmationEmail } from '@/lib/email';
import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, address, ageGroup, swishReference } = body;

    // Validate required fields
    if (!name || !phone || !email || !ageGroup) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if there's already an active or pending application for this email
    const existing = await adminDb
      .collection('members')
      .where('email', '==', emailLower)
      .where('status', 'in', ['pending_email', 'pending_review', 'approved', 'active'])
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: 'En ansökan med denna e-post finns redan.' },
        { status: 409 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000); // 48h

    // Save application
    const docRef = await adminDb.collection('members').add({
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      address: (address || '').trim(),
      ageGroup,
      swishReference: (swishReference || '').trim(),
      status: 'pending_email',
      verificationToken: token,
      verificationExpiresAt: expiresAt,
      createdAt: Timestamp.now(),
      emailConfirmedAt: null,
      approvedAt: null,
      rejectedAt: null,
      userAccountId: null,
    });

    // Send confirmation email
    await sendConfirmationEmail({
      to: emailLower,
      name: name.trim(),
      token,
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Ansökan mottagen. Kolla din e-post för att bekräfta.',
    });
  } catch (error) {
    console.error('Error processing application:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}