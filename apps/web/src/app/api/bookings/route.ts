// src/app/api/bookings/route.ts

import { NextResponse } from 'next/server';
import { getBookings, createMemberBooking } from '@/lib/services/bookings.service';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json({ 
      success: true, 
      bookings 
    });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'email', 'date', 'time'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }
    
    // Create the booking using the member booking service
    const booking = await createMemberBooking(body);
    
    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Booking created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create booking' 
      },
      { status: 500 }
    );
  }
}