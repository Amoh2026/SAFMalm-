import { NextResponse } from 'next/server';

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

    // Here you would send emails via Resend or other service
    // For now, just log the data
    console.log('Member application received:', {
      name,
      phone,
      email,
      address,
      ageGroup,
      swishReference,
    });

    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully' 
    });

  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}