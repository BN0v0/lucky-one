import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import type { BookingWithDetails } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(*)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const typedBooking = booking as BookingWithDetails;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(typedBooking.service.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: bookingId,
        serviceId: typedBooking.service_id,
        userId: typedBooking.user_id,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent' },
      { status: 500 }
    );
  }
} 