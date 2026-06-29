import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email format
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Get Supabase client (handles SSL automatically)
    const supabase = await createClient();

    // Insert into database
    // The unique constraint on email will prevent duplicates
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({ email: normalizedEmail });

    if (insertError) {
      // Handle duplicate email error (PostgreSQL unique constraint violation)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }

      // Log other errors for debugging
      console.error('Waitlist submission error:', insertError);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully joined waitlist!' },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Log unexpected errors
    console.error('Unexpected waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist. Please try again later.' },
      { status: 500 }
    );
  }
}
