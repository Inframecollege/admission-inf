import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json();

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({
        isOk: false,
        message: 'Missing required payment information'
      }, { status: 400 });
    }

    // Production code for verifying the Razorpay signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      console.error('Missing Razorpay secret key');
      return NextResponse.json({
        isOk: false,
        message: 'Payment verification configuration error'
      }, { status: 500 });
    }
    
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');
    
    const isAuthentic = generated_signature === razorpaySignature;

    if (isAuthentic) {
      // Payment is successful
      // In a production app, you would:
      // 1. Update your database with payment details
      // 2. Fulfill the order or provide access to purchased content
      // 3. Send confirmation email to the customer
      
      // Log successful payment for audit purposes
      console.log('Payment verified successfully', {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        isOk: true,
        message: 'Payment successful',
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId
      });
    } else {
      // Log failed verification for security audit
      console.error('Payment signature verification failed', {
        razorpayOrderId,
        razorpayPaymentId,
        generated_signature,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        isOk: false,
        message: 'Payment verification failed. Please contact support with your order reference.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { isOk: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}



