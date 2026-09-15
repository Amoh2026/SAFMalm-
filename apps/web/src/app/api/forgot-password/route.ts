import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Adjust these imports to your project:
// import { prisma } from '@/lib/prisma';
// import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'E-post krävs' },
        { status: 400 }
      );
    }

    // IMPORTANT: Always return success, even if the email doesn't exist,
    // so attackers can't probe which emails are registered.
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // TODO: save token in your database, e.g.:
    // await prisma.passwordResetToken.create({
    //   data: { email: email.toLowerCase(), token, expires },
    // });

    // TODO: send email, e.g.:
    // const locale = 'sv';
    // const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/aterstall-losenord?token=${token}`;
    // await sendEmail(email, 'Återställ ditt lösenord - SAF Malmö',
    //   `Klicka på länken för att välja ett nytt lösenord: ${resetLink}`);

    // Dev-only logging — hidden in production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Reset link: /aterstall-losenord?token=${token}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Ett serverfel uppstod' },
      { status: 500 }
    );
  }
}