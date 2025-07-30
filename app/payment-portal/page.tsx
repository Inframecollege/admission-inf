'use client'

import React from 'react'
import DynamicPaymentPortal from '../../components/DynamicPaymentPortal'

export default function PaymentPortalPage() {
  const handlePaymentSuccess = (data: unknown) => {
    console.log('Payment successful:', data)
    // You can redirect to a success page or show a success message
    alert('Payment completed successfully!')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    // You can show an error message or redirect to an error page
    alert(`Payment failed: ${error}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-amber-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Payment Portal</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your course payment securely with our trusted payment gateway
          </p>
        </div>

        <DynamicPaymentPortal
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      </div>
    </div>
  )
} 