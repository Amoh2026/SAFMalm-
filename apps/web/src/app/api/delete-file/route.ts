import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
}