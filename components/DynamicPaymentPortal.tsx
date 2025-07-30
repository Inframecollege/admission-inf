'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { PaymentPortalApiService } from '../lib/paymentPortalApi'
import { cookieStorage } from '../lib/cookieStorage'
import Button from './ui/Button'
import Input from './ui/Input'
import type { PaymentPortalData } from '../lib/paymentPortalApi'

// StudentData interface for existing students
interface StudentData {
  id: string
  fullName: string
  email: string
  phone: string
  programCategory: string
  selectedProgram: string
  specialization: string
  campus: string
  admissionDate: string
  hasInitialPayment: boolean
  applicationFee: number
  paidAmount: number
  remainingAmount: number
  academicYear: string
}

// PaymentTransaction type based on API
interface PaymentTransaction {
  transactionId: string
  amount: number
  paymentMethod: string
  paymentGateway: string
  status: string
  description: string
  remarks: string
  createdAt: string
}

interface PaymentPortalProps {
  onPaymentSuccess?: (data: unknown) => void
  onPaymentError?: (error: string) => void
}

const DynamicPaymentPortal: React.FC<PaymentPortalProps> = ({
  onPaymentSuccess,
  onPaymentError
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portalData, setPortalData] = useState<PaymentPortalData | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([])
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'partial'>('full')
  const [customAmount, setCustomAmount] = useState<number>(0)
  const [couponCode, setCouponCode] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [existingStudentData, setExistingStudentData] = useState<StudentData | null>(null)

  const paymentPortalApi = new PaymentPortalApiService()

  useEffect(() => {
    // Check for existing student data in sessionStorage
    const storedData = sessionStorage.getItem('existingStudentData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setExistingStudentData(data)
        // Use existing student data instead of API call
        loadExistingStudentData(data)
      } catch (error) {
        console.error('Error parsing stored student data:', error)
        sessionStorage.removeItem('existingStudentData')
        loadPortalData()
      }
    } else {
      loadPortalData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadExistingStudentData = (studentData: StudentData) => {
    // Convert existing student data to portal data format
    const portalData: PaymentPortalData = {
      studentId: studentData.id,
      fullName: studentData.fullName,
      email: studentData.email,
      phone: studentData.phone,
      programCategory: studentData.programCategory,
      selectedProgram: studentData.selectedProgram,
      specialization: studentData.specialization,
      campus: studentData.campus,
      admissionDate: studentData.admissionDate,
      hasInitialPayment: studentData.hasInitialPayment,
      applicationFee: studentData.applicationFee,
      paidAmount: studentData.paidAmount,
      remainingAmount: studentData.remainingAmount,
      academicYear: studentData.academicYear,
      paymentStatus: 'pending',
      totalFee: studentData.applicationFee,
      processingFee: 0,
      registrationFee: studentData.applicationFee,
      courseFee: 0,
      totalAmountPaid: studentData.paidAmount,
      totalAmountDue: studentData.remainingAmount,
      totalDiscount: 0,
      nextPaymentDate: null,
      appliedCoupons: [],
      paymentTransactions: [],
      lastPaymentDate: '',
      applicationStatus: 'approved',
      isActive: true
    }
    
    setPortalData(portalData)
    setCustomAmount(studentData.remainingAmount || 0)
    setLoading(false)
  }

  const loadPortalData = async () => {
    try {
      setLoading(true)
      setError(null)

      const userId = cookieStorage.getUserId()
      if (!userId) {
        throw new Error('User ID not found. Please login again.')
      }

      // Fetch payment portal data
      const portalResponse = await paymentPortalApi.getPaymentPortalData(userId)
      if (portalResponse.success && portalResponse.data) {
        setPortalData(portalResponse.data)
        setCustomAmount(portalResponse.data.remainingAmount || 0)
      } else {
        throw new Error(portalResponse.message || 'Failed to load payment portal data')
      }

      // Fetch payment history
      const historyResponse = await paymentPortalApi.getPaymentHistory(userId)
      if (historyResponse.success && historyResponse.data) {
        setPaymentHistory(historyResponse.data)
      }

    } catch (err: unknown) {
      console.error('Error loading portal data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load payment portal data'
      setError(errorMessage)
      onPaymentError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('existingStudentData')
    router.push('/')
  }

  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setSelectedPaymentType(type)
    if (type === 'full' && portalData) {
      setCustomAmount(portalData.remainingAmount || 0)
    }
  }

  const handleCustomAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    setCustomAmount(amount)
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      setApplyingCoupon(true)
      // TODO: Implement coupon validation API call
      // For now, just show a placeholder
      console.log('Applying coupon:', couponCode)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply coupon'
      setError(errorMessage)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const initiatePayment = async () => {
    if (!portalData) return

    try {
      setProcessingPayment(true)
      setError(null)

      const userId = existingStudentData?.id || cookieStorage.getUserId()
      if (!userId) {
        throw new Error('User ID not found. Please login again.')
      }

      // Calculate payment amount
      const paymentAmount: number = selectedPaymentType === 'full'
        ? portalData.remainingAmount || 0
        : Math.min(customAmount, portalData.remainingAmount || 0)

      if (paymentAmount <= 0) {
        throw new Error('Invalid payment amount')
      }

      // Create Razorpay order
      const orderResponse = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount * 100, // Convert to paise
          currency: 'INR',
          receipt: `payment_${Date.now()}`,
        }),
      })

      const orderData = await orderResponse.json()
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order')
      }

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentAmount * 100,
        currency: 'INR',
        name: 'Inframe Institute',
        description: `${selectedPaymentType === 'full' ? 'Full' : 'Partial'} Payment - ${portalData.selectedProgram}`,
        order_id: orderData.data.id,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
          try {
            // For existing students, we'll just show success and update local data
            if (existingStudentData) {
              // Update the existing student data
              const updatedData = {
                ...existingStudentData,
                paidAmount: existingStudentData.paidAmount + paymentAmount,
                remainingAmount: existingStudentData.remainingAmount - paymentAmount
              }
              sessionStorage.setItem('existingStudentData', JSON.stringify(updatedData))
              
              // Update portal data
              setPortalData(prev => prev ? {
                ...prev,
                totalAmountPaid: prev.totalAmountPaid + paymentAmount,
                totalAmountDue: prev.totalAmountDue - paymentAmount,
                remainingAmount: prev.remainingAmount - paymentAmount
              } : null)
            } else {
              // Submit payment data to external API for new students
              const paymentData = {
                userId,
                              courseId: (portalData as PaymentPortalData & { courseId?: string }).courseId || '',
              programId: (portalData as PaymentPortalData & { programId?: string }).programId || '',
                paymentType: selectedPaymentType,
                couponCode: couponCode || undefined,
                initialPayment: paymentAmount,
                              firstName: (portalData.fullName?.split ? portalData.fullName.split(' ')[0] : '') || '',
              lastName: (portalData.fullName?.split ? portalData.fullName.split(' ').slice(1).join(' ') : '') || '',
              dateOfBirth: (portalData as PaymentPortalData & { dateOfBirth?: string }).dateOfBirth || '',
              gender: (portalData as PaymentPortalData & { gender?: string }).gender || '',
              address: (portalData as PaymentPortalData & { address?: string }).address || '',
              city: (portalData as PaymentPortalData & { city?: string }).city || '',
              state: (portalData as PaymentPortalData & { state?: string }).state || '',
              pincode: (portalData as PaymentPortalData & { pincode?: string }).pincode || '',
              phone: portalData.phone || '',
              email: portalData.email || '',
              education: (portalData as PaymentPortalData & { education?: string }).education || '',
              workExperience: (portalData as PaymentPortalData & { workExperience?: string }).workExperience || '',
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              }

              await paymentPortalApi.submitPaymentData(paymentData)
              
              // Update payment info
              await paymentPortalApi.updatePaymentInfo(userId, {
                amount: paymentAmount,
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                paymentMethod: 'online',
                paymentGateway: 'razorpay',
                status: 'success',
                description: `${selectedPaymentType === 'full' ? 'Full' : 'Partial'} payment`,
                remarks: 'Payment completed successfully',
              })

              // Reload portal data
              await loadPortalData()
            }

            onPaymentSuccess?.({
              ...response,
              paymentAmount,
              paymentType: selectedPaymentType,
            })

          } catch (err: unknown) {
            console.error('Payment submission error:', err)
            const errorMessage = err instanceof Error ? err.message : 'Payment completed but failed to update records'
            setError(errorMessage)
            onPaymentError?.(errorMessage)
          }
        },
        prefill: {
          name: portalData.fullName || '',
          email: portalData.email || '',
          contact: portalData.phone || '',
        },
        theme: {
          color: '#3B82F6',
        },
      }

      const razorpay = new (window as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options)
      razorpay.open()

    } catch (err: unknown) {
      console.error('Payment initiation error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment'
      setError(errorMessage)
      onPaymentError?.(errorMessage)
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment Portal</h3>
          <p className="text-gray-600">Please wait while we fetch your payment information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-gray-200 rounded-2xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900">Error Loading Payment Portal</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <Button 
            onClick={loadPortalData} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!portalData) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Data Available</h3>
        <p className="text-gray-600">Unable to load payment information. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-gray-600">Welcome back, {portalData.fullName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 font-medium">Student ID</div>
              <div className="font-mono text-xl font-bold text-gray-900">{portalData.studentId}</div>
            </div>
            {existingStudentData && (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center px-4 py-2 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                <span className="text-sm font-medium text-gray-600">Full Name</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                <span className="text-sm font-medium text-gray-600">Email Address</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                <span className="text-sm font-medium text-gray-600">Phone Number</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Campus</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.campus}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Academic Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-green-100">
                <span className="text-sm font-medium text-gray-600">Program</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.selectedProgram}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-100">
                <span className="text-sm font-medium text-gray-600">Category</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.programCategory}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-100">
                <span className="text-sm font-medium text-gray-600">Specialization</span>
                <span className="text-sm font-semibold text-gray-900">{portalData.specialization}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  portalData.applicationStatus === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {portalData.applicationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-sm text-yellow-700 font-semibold">Total Course Fee</div>
            </div>
            <div className="text-3xl font-bold text-yellow-900">₹{portalData.totalFee?.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-green-700 font-semibold">Amount Paid</div>
            </div>
            <div className="text-3xl font-bold text-green-900">₹{portalData.totalAmountPaid?.toLocaleString()}</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm text-orange-700 font-semibold">Amount Due</div>
            </div>
            <div className="text-3xl font-bold text-orange-900">₹{portalData.totalAmountDue?.toLocaleString()}</div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Fee Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Registration Fee</span>
              <span className="text-sm font-semibold text-gray-900">₹{portalData.registrationFee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Processing Fee</span>
              <span className="text-sm font-semibold text-gray-900">₹{portalData.processingFee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Course Fee</span>
              <span className="text-sm font-semibold text-gray-900">₹{portalData.courseFee?.toLocaleString()}</span>
            </div>
            {portalData.totalDiscount > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-green-600">Discount Applied</span>
                <span className="text-sm font-semibold text-green-600">-₹{portalData.totalDiscount?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4">
              <span className="text-lg font-bold text-gray-900">Total Amount Due</span>
              <span className="text-lg font-bold text-gray-900">₹{portalData.totalAmountDue?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Make Payment</h2>
        </div>
        
        {/* Payment Type Selection */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-4">Payment Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
              selectedPaymentType === 'full' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="full"
                checked={selectedPaymentType === 'full'}
                onChange={() => handlePaymentTypeChange('full')}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedPaymentType === 'full' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                    }`}>
                      {selectedPaymentType === 'full' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Full Payment</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">Pay the complete remaining amount</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹{portalData.remainingAmount?.toLocaleString()}</div>
                </div>
              </div>
            </label>
            
            <label className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-200 ${
              selectedPaymentType === 'partial' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="paymentType"
                value="partial"
                checked={selectedPaymentType === 'partial'}
                onChange={() => handlePaymentTypeChange('partial')}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedPaymentType === 'partial' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                    }`}>
                      {selectedPaymentType === 'partial' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">Partial Payment</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-9">Pay a custom amount</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Custom Amount</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Custom Amount Input */}
        {selectedPaymentType === 'partial' && (
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Payment Amount
            </label>
            <div className="max-w-md">
              <Input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                min="0"
                max={portalData.remainingAmount}
                step="100"
                className="w-full text-lg py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                placeholder={`Max: ₹${portalData.remainingAmount?.toLocaleString()}`}
              />
              <p className="text-sm text-gray-500 mt-2">Maximum amount: ₹{portalData.remainingAmount?.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Coupon Code */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-4">Coupon Code (Optional)</label>
          <div className="max-w-md">
            <div className="flex space-x-3">
              <Input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 text-lg py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
              />
              <Button
                onClick={applyCoupon}
                disabled={!couponCode.trim() || applyingCoupon}
                variant="outline"
                className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200"
              >
                {applyingCoupon ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="border-t border-gray-200 pt-6">
          <Button
            onClick={initiatePayment}
            disabled={processingPayment || (selectedPaymentType === 'partial' && customAmount <= 0)}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 text-lg font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 transition-all duration-200 transform hover:scale-105"
            size="lg"
          >
            {processingPayment ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay ₹{selectedPaymentType === 'full' ? portalData.remainingAmount?.toLocaleString() : customAmount?.toLocaleString()}
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                        {transaction.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{transaction.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          {transaction.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'success' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'success' && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DynamicPaymentPortal 