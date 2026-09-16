import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const steps: string[] = [];

  try {
    steps.push('1. Parsing body');
    const body = await request.json();
    const { name, phone, email, address, ageGroup, swishReference } = body;

    if (!name || !phone || !email || !ageGroup) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', steps },
        { status: 400 }
      );
    }

    steps.push('2. Importing Firestore');
    const { adminDb } = await import('@/lib/firebase/admin');

    steps.push('3. Checking existing application');
    const emailLower = email.toLowerCase().trim();
    const existing = await adminDb
      .collection('members')
      .where('email', '==', emailLower)
      .where('status', 'in', ['pending_email', 'pending_review', 'approved', 'active'])
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'En ansökan med denna e-post finns redan.',
          steps,
        },
        { status: 409 }
      );
    }

    steps.push('4. Generating token');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    steps.push('5. Saving to Firestore');
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
      createdAt: new Date(),
      emailConfirmedAt: null,
      approvedAt: null,
      rejectedAt: null,
      userAccountId: null,
    });

    steps.push('6. Importing email helper');
    const { sendConfirmationEmail } = await import('@/lib/email');

    steps.push('7. Sending confirmation email');
    await sendConfirmationEmail({
      to: emailLower,
      name: name.trim(),
      token,
    });

    steps.push('8. Success');
    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Ansökan mottagen. Kolla din e-post för att bekräfta.',
      steps,
    });
  } catch (error: any) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
        stack: String(error?.stack || '').slice(0, 1000),
        steps,
      },
      { status: 500 }
    );
  }
}