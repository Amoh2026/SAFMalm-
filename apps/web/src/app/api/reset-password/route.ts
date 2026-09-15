import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token och lösenord krävs' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Lösenordet måste vara minst 8 tecken' },
        { status: 400 }
      );
    }

    // TODO: look up the token, e.g.:
    // const resetToken = await prisma.passwordResetToken.findUnique({
    //   where: { token },
    // });
    //
    // if (!resetToken || resetToken.expires < new Date()) {
    //   return NextResponse.json(
    //     { message: 'Länken har gått ut' },
    //     { status: 410 }
    //   );
    // }
    //
    // const hashed = await hash(password, 12);
    // await prisma.user.update({
    //   where: { email: resetToken.email },
    //   data: { password: hashed },
    // });
    // await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Ett serverfel uppstod' },
      { status: 500 }
    );
  }
}