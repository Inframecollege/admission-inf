import { NextResponse } from 'next/server';
// import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json(
        { error: 'Invalid amount provided' },
        { status: 400 }
      );
    }

    // Production code for creating a real Razorpay order
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('Missing Razorpay API keys');
      return NextResponse.json(
        { error: 'Payment gateway configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64')
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100), // amount in paise
        currency: 'INR',
        receipt: 'receipt_' + Date.now(),
        payment_capture: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create order with payment provider' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      orderId: data.id,
      amount: data.amount / 100, // Convert back to rupees for display
      currency: data.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



