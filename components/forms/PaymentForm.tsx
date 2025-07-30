"use client"

import { useState, useEffect } from 'react'
import { useApplication } from '@/contexts/ApplicationContext'
import Button from '@/components/ui/Button'
import Script from 'next/script'
import { AlertCircle, Loader2, CheckCircle, XCircle, Tag } from 'lucide-react'
import { ApplicationStep } from '@/types/application'
import { paymentApiService } from '@/lib/paymentApi'
import { cookieStorage } from '@/lib/cookieStorage'
import { FeeStructure, CouponCode } from '@/lib/paymentApi'

// Define TypeScript interfaces for better type safety
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
  modal?: {
    ondismiss: () => void;
    escape: boolean;
    animation: boolean;
  };
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, unknown>;
  }
}

// Declare Razorpay as a global type
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
      open: () => void;
    };
  }
}

export default function PaymentForm() {
  const { applicationData, updateApplicationData, setCurrentStep, loginData } = useApplication()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [paymentOption, setPaymentOption] = useState<'application' | 'course' | 'custom'>('application')
  // Removed unused partialAmount and partialAmountError variables
  const [customAmount, setCustomAmount] = useState('')
  const [customAmountError, setCustomAmountError] = useState('')
  
  // State for payment details from API - moved to top before any early returns
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [programId, setProgramId] = useState<string | null>(null)
  const [isLoadingFees, setIsLoadingFees] = useState(true)
  const [feeError, setFeeError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<{
    isValid: boolean
    discountAmount: number
    finalAmount: number
    coupon?: CouponCode
    error?: string
  } | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  // Move useEffect to the top level, before any early returns
  useEffect(() => {
    if (error) setError(null);
  }, [error]);

  // Fallback mechanism to check if Razorpay is available
  useEffect(() => {
    const checkRazorpayAvailability = () => {
      if (typeof window !== 'undefined' && window.Razorpay && !scriptLoaded) {
        console.log('✅ Razorpay already available in window object for new applicant')
        setScriptLoaded(true)
      }
    }

    // Check immediately
    checkRazorpayAvailability()

    // Check periodically for 10 seconds
    const interval = setInterval(checkRazorpayAvailability, 1000)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (!scriptLoaded) {
        console.warn('⚠️ Razorpay script loading timeout for new applicant - trying manual load')
        // Try manual script loading as fallback
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          console.log('✅ Razorpay script loaded manually for new applicant')
          setScriptLoaded(true)
        }
        script.onerror = () => {
          console.error('❌ Manual Razorpay script loading also failed for new applicant')
          setError("Failed to load payment system. Please check your internet connection and refresh the page.")
        }
        document.head.appendChild(script)
      }
    }, 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [scriptLoaded]);

  // Fetch fee structure from API - moved to top before early returns
  useEffect(() => {
    const fetchFeeStructure = async () => {
      if (!applicationData.programSelection?.programType || !applicationData.programSelection?.programName) {
        setIsLoadingFees(false)
        return
      }

      try {
        setIsLoadingFees(true)
        setFeeError(null)
        const result = await paymentApiService.getFeeStructure(
          applicationData.programSelection.programType,
          applicationData.programSelection.programName
        )
        setFeeStructure(result.feeStructure)
        setCourseId(result.courseId)
        setProgramId(result.programId)
      } catch (error: unknown) {
        console.error('Failed to fetch fee structure:', error)
        setFeeError(error instanceof Error ? error.message : 'Failed to load payment details')
      } finally {
        setIsLoadingFees(false)
      }
    }

    fetchFeeStructure()
  }, [applicationData.programSelection?.programType, applicationData.programSelection?.programName])

  const { personalInfo, programSelection } = applicationData

  // Guard: Missing data
  if (!personalInfo || !programSelection) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 text-lg font-medium">Required application details are missing</p>
        <p className="text-red-500 mt-1">Please go back and complete all previous steps.</p>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => setCurrentStep('personal-info')}
        >
          Return to Personal Information
        </Button>
      </div>
    )
  }

  // Calculate fees based on API data and payment option
  const getFees = () => {
    if (!feeStructure) {
      // Fallback to default fees if API data not available
      const defaultApplicationFee = 1000
      const defaultTotalFee = 50000 // Default total course fee
      
      let baseAmount = defaultApplicationFee
      if (paymentOption === 'custom' && customAmount) {
        baseAmount = parseFloat(customAmount)
      } else if (paymentOption === 'course') {
        baseAmount = defaultTotalFee + defaultApplicationFee
      }

      const amountAfterCoupon = couponResult?.finalAmount || baseAmount

      return {
        applicationFee: defaultApplicationFee,
        totalCourseFee: defaultTotalFee,
        totalFee: baseAmount,
        actualPaymentAmount: baseAmount,
              remainingAmount: paymentOption === 'custom' && customAmount ? (defaultTotalFee + defaultApplicationFee) - parseFloat(customAmount) :
                      paymentOption === 'course' ? 0 : 0,
        courseName: programSelection.programType?.replace('-', ' ') || 'Unknown Course',
        courseDuration: 'Unknown Duration',
        paymentOption: paymentOption,
        discountAmount: couponResult?.discountAmount || 0,
        finalAmount: amountAfterCoupon
      }
    }

    // Use API fee structure
    let baseAmount = feeStructure.registrationFee
    if (paymentOption === 'custom' && customAmount) {
      baseAmount = parseFloat(customAmount)
    } else if (paymentOption === 'course') {
      baseAmount = feeStructure.totalFee + feeStructure.registrationFee
    }

    const amountAfterCoupon = couponResult?.finalAmount || baseAmount

    return {
      applicationFee: feeStructure.registrationFee,
      totalCourseFee: feeStructure.totalFee,
      totalFee: baseAmount,
      actualPaymentAmount: baseAmount,
      remainingAmount: paymentOption === 'custom' && customAmount ? (feeStructure.totalFee + feeStructure.registrationFee) - parseFloat(customAmount) :
                      paymentOption === 'course' ? 0 : 0,
      courseName: programSelection.programType?.replace('-', ' ') || 'Unknown Course',
      courseDuration: programSelection.programName || 'Unknown Duration',
      paymentOption: paymentOption,
      discountAmount: couponResult?.discountAmount || 0,
      finalAmount: amountAfterCoupon,
      feeStructure: feeStructure
    }
  }

  const fees = getFees()



  // Validate custom payment amount
  const validateCustomPayment = (): boolean => {
    if (paymentOption !== 'custom') return true

    setCustomAmountError('')

    if (!customAmount.trim()) {
      setCustomAmountError('Please enter a payment amount')
      return false
    }

    const amount = parseFloat(customAmount)
    if (isNaN(amount) || amount <= 0) {
      setCustomAmountError('Please enter a valid amount')
      return false
    }

    const totalAmount = (fees.totalCourseFee || 0) + (fees.applicationFee || 0)
    if (amount > totalAmount) {
      setCustomAmountError(`Amount cannot exceed total amount of ₹${totalAmount.toLocaleString('en-IN')}`)
      return false
    }

    const minAmount = 100 // Minimum ₹100 for any payment
    if (amount < minAmount) {
      setCustomAmountError(`Minimum payment amount is ₹${minAmount.toLocaleString('en-IN')}`)
      return false
    }

    return true
  }

  // Handle payment option change
  const handlePaymentOptionChange = (option: 'application' | 'course' | 'custom') => {
    setPaymentOption(option)
    if (option !== 'custom') {
      setCustomAmount('')
      setCustomAmountError('')
    }
  }

  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponResult({
        isValid: false,
        discountAmount: 0,
        finalAmount: fees.actualPaymentAmount,
        error: 'Please enter a coupon code'
      })
      return
    }

    if (!programSelection.programType || !programSelection.programName) {
      setCouponResult({
        isValid: false,
        discountAmount: 0,
        finalAmount: fees.actualPaymentAmount,
        error: 'Program details not found'
      })
      return
    }

    setIsValidatingCoupon(true)
    try {
      const result = await paymentApiService.validateCoupon(
        programSelection.programType,
        programSelection.programName,
        couponCode.trim(),
        fees.actualPaymentAmount
      )
      setCouponResult(result)
    } catch (error: unknown) {
      setCouponResult({
        isValid: false,
        discountAmount: 0,
        finalAmount: fees.actualPaymentAmount,
        error: error instanceof Error ? error.message : 'Failed to validate coupon'
      })
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponResult(null)
  }

  // Submit admission data to API after successful payment
  const submitAdmissionData = async () => {
    try {
      // Get user ID with priority: cookies > login data > application ID > generated
      // This ensures we use the most reliable user ID available
      const userId = cookieStorage.getUserId()
      
      console.log('🔍 User ID Lookup:')
      console.log('  🍪 From Cookies:', userId || 'Not found')
      console.log('  📋 From Application:', applicationData.applicationId || 'Not found')
      console.log('  🔑 From Login Data:', loginData?.userId || 'Not found')
      
      if (!userId) {
        console.warn('⚠️ No user ID found in cookies, using fallback ID')
      }

      // Determine payment type based on payment option
      const paymentType = paymentOption === 'course' ? 'full' : 'other'
      
      // Get education details from academic details
      const education = applicationData.academicDetails?.graduationUniversity 
        ? 'Graduation' 
        : applicationData.academicDetails?.diplomaInstitution 
        ? 'Diploma' 
        : '12th Standard'

      // Get work experience (placeholder - you may need to add this field to your forms)
      const workExperience = 'Not specified' // This should come from your form data

      const admissionData = {
        userId: userId || loginData?.userId || applicationData.applicationId || `user_${Date.now()}`, // Priority: cookies > login data > application ID > generated
        courseId: courseId || '64f1c2e5b2a1c2d3e4f5a6b8', // Use actual course ID or fallback
        programId: programId || '64f1c2e5b2a1c2d3e4f5a6b9', // Use actual program ID or fallback
        paymentType: paymentType,
        couponCode: couponResult?.isValid ? couponCode : undefined,
        initialPayment: fees.actualPaymentAmount,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        address: personalInfo.permanentAddress,
        city: personalInfo.city,
        state: personalInfo.state,
        pincode: personalInfo.pincode,
        phone: personalInfo.phone,
        email: personalInfo.email,
        education: education,
        workExperience: workExperience
      }

      console.log('📤 Submitting admission data to API:')
      console.log('  👤 User ID Source:', userId ? 'Cookies' : loginData?.userId ? 'Login Data' : applicationData.applicationId ? 'Application ID' : 'Generated')
      console.log('  🆔 Final User ID:', admissionData.userId)
      console.log('  📋 Full Data:', admissionData)

      const response = await fetch('https://backend-rakj.onrender.com/api/v1/admission/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(admissionData),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Admission submission failed:', result)
        throw new Error(result.message || 'Failed to submit admission data')
      }

      console.log('✅ Admission data submitted successfully:', result)
      return result
    } catch (error) {
      console.error('❌ Error submitting admission data:', error)
      throw error
    }
  }



  const createOrderId = async () => {
    try {
      setError(null);
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: fees.totalFee,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    }
  };

  const handleProceedToPayment = async () => {
    if (isProcessing) return;



    if (!scriptLoaded) {
      setError("Payment system is still loading. Please try again in a moment.");
      return;
    }

    // Validate custom payment if enabled
    if (!validateCustomPayment()) {
      return;
    }

    // Console log COMPLETE payment details for new applicant
    console.log('💳 NEW APPLICANT - PROCEED TO PAYMENT CLICKED')
    console.log('=' .repeat(80))
    console.log('⏰ TIMESTAMP:', new Date().toISOString())
    console.log('🌐 USER AGENT:', navigator.userAgent)
    console.log('📍 CURRENT URL:', window.location.href)

    // Application Details
    console.log('\n📋 APPLICATION DETAILS:')
    console.log('  Application ID:', applicationData.applicationId || 'Not Generated')
    console.log('  Current Step:', applicationData.currentStep)
    console.log('  Is Complete:', applicationData.isComplete)
    console.log('  Payment Complete:', applicationData.paymentComplete)
    console.log('  Submitted At:', applicationData.submittedAt || 'Not Submitted')

    // Personal Information
    console.log('\n👤 PERSONAL INFORMATION:')
    console.log('  Full Name:', `${personalInfo.firstName} ${personalInfo.lastName}`)
    console.log('  Email:', personalInfo.email)
    console.log('  Phone:', personalInfo.phone)
    console.log('  Date of Birth:', personalInfo.dateOfBirth)
    console.log('  Gender:', personalInfo.gender)
    console.log('  Religion:', personalInfo.religion || 'Not Specified')
    console.log('  Aadhar Number:', personalInfo.aadharNumber || 'Not Provided')
    console.log('  City:', personalInfo.city)
    console.log('  State:', personalInfo.state)
    console.log('  Pincode:', personalInfo.pincode)
    console.log('  Permanent Address:', personalInfo.permanentAddress)
    console.log('  Temporary Address:', personalInfo.temporaryAddress || 'Same as Permanent')

    // Guardian Information
    console.log('\n👨‍👩‍👧‍👦 GUARDIAN INFORMATION:')
    console.log('  Father Name:', personalInfo.fathersName || 'Not Provided')
    console.log('  Father Phone:', personalInfo.fathersPhone || 'Not Provided')
    console.log('  Father Occupation:', personalInfo.fathersOccupation || 'Not Provided')
    console.log('  Father Qualification:', personalInfo.fathersQualification || 'Not Provided')
    console.log('  Mother Name:', personalInfo.mothersName || 'Not Provided')
    console.log('  Mother Phone:', personalInfo.mothersPhone || 'Not Provided')
    console.log('  Mother Occupation:', personalInfo.mothersOccupation || 'Not Provided')
    console.log('  Mother Qualification:', personalInfo.mothersQualification || 'Not Provided')
    console.log('  Parents Address:', personalInfo.parentsAddress || 'Not Provided')

    // Local Guardian (if provided)
    if (personalInfo.localGuardianName) {
      console.log('\n🏠 LOCAL GUARDIAN INFORMATION:')
      console.log('  Name:', personalInfo.localGuardianName)
      console.log('  Phone:', personalInfo.localGuardianPhone || 'Not Provided')
      console.log('  Occupation:', personalInfo.localGuardianOccupation || 'Not Provided')
      console.log('  Relation:', personalInfo.localGuardianRelation || 'Not Provided')
      console.log('  Address:', personalInfo.localGuardianAddress || 'Not Provided')
    }

    // Academic Details
    if (applicationData.academicDetails) {
      const academic = applicationData.academicDetails
      console.log('\n🎓 ACADEMIC DETAILS:')
      console.log('  10th Board:', academic.tenthBoard || 'Not Provided')
      console.log('  10th Institution:', academic.tenthInstitution || 'Not Provided')
      console.log('  10th Percentage:', academic.tenthPercentage ? `${academic.tenthPercentage}%` : 'Not Provided')
      console.log('  10th Year:', academic.tenthYear || 'Not Provided')
      console.log('  12th Board:', academic.twelfthBoard || 'Not Provided')
      console.log('  12th Institution:', academic.twelfthInstitution || 'Not Provided')
      console.log('  12th Stream:', academic.twelfthStream || 'Not Provided')
      console.log('  12th Percentage:', academic.twelfthPercentage ? `${academic.twelfthPercentage}%` : 'Not Provided')
      console.log('  12th Year:', academic.twelfthYear || 'Not Provided')

      if (academic.diplomaInstitution) {
        console.log('  Diploma Institution:', academic.diplomaInstitution)
        console.log('  Diploma Stream:', academic.diplomaStream || 'Not Provided')
        console.log('  Diploma Percentage:', academic.diplomaPercentage ? `${academic.diplomaPercentage}%` : 'Not Provided')
        console.log('  Diploma Year:', academic.diplomaYear || 'Not Provided')
      }

      if (academic.graduationUniversity) {
        console.log('  Graduation University:', academic.graduationUniversity)
        console.log('  Graduation Percentage:', academic.graduationPercentage ? `${academic.graduationPercentage}%` : 'Not Provided')
        console.log('  Graduation Year:', academic.graduationYear || 'Not Provided')
      }
    }

    // Program Selection
    console.log('\n🎯 PROGRAM SELECTION:')
    console.log('  Program Category:', programSelection.programCategory || 'Not Selected')
    console.log('  Program Name:', programSelection.programName || 'Not Selected')
    console.log('  Program Type:', programSelection.programType || 'Not Selected')
    console.log('  Specialization:', programSelection.specialization || 'Not Selected')
    console.log('  Campus:', programSelection.campus || 'Not Selected')

    // Document Status
    console.log('\n📄 DOCUMENT STATUS:')
    console.log('  Profile Photo:', personalInfo.profilePhoto ? `✅ ${personalInfo.profilePhoto.name} (${(personalInfo.profilePhoto.size / 1024).toFixed(2)} KB)` : '❌ Not Uploaded')
    console.log('  Signature:', personalInfo.signature ? `✅ ${personalInfo.signature.name} (${(personalInfo.signature.size / 1024).toFixed(2)} KB)` : '❌ Not Uploaded')
    console.log('  Aadhar Card:', personalInfo.aadharCard ? `✅ ${personalInfo.aadharCard.name} (${(personalInfo.aadharCard.size / 1024).toFixed(2)} KB)` : '❌ Not Uploaded')

    if (applicationData.academicDetails) {
      const academic = applicationData.academicDetails
      console.log('  10th Marksheet:', academic.tenthMarksheet ? `✅ ${academic.tenthMarksheet.name} (${(academic.tenthMarksheet.size / 1024).toFixed(2)} KB)` : '❌ Not Uploaded')
      console.log('  12th Marksheet:', academic.twelfthMarksheet ? `✅ ${academic.twelfthMarksheet.name} (${(academic.twelfthMarksheet.size / 1024).toFixed(2)} KB)` : '❌ Not Uploaded')

      if (academic.diplomaMarksheet) {
        console.log('  Diploma Marksheet:', `✅ ${academic.diplomaMarksheet.name} (${(academic.diplomaMarksheet.size / 1024).toFixed(2)} KB)`)
      }
      if (academic.graduationMarksheet) {
        console.log('  Graduation Marksheet:', `✅ ${academic.graduationMarksheet.name} (${(academic.graduationMarksheet.size / 1024).toFixed(2)} KB)`)
      }
    }

    // Additional Documents
    if (personalInfo.randomDocuments && personalInfo.randomDocuments.length > 0) {
      console.log('\n📎 ADDITIONAL DOCUMENTS:')
      personalInfo.randomDocuments.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.name}: ✅ ${doc.file.name} (${(doc.file.size / 1024).toFixed(2)} KB)`)
      })
    }

    // Payment Configuration
    console.log('\n💳 PAYMENT CONFIGURATION:')
    // console.log('  Payment Type:', paymentOption === 'partial' ? 'Partial Payment' : paymentOption === 'college' ? 'Pay at College' : 'Full Payment')
    console.log('  Course Name:', fees.courseName)
    console.log('  Course Duration:', fees.courseDuration || 'Not Specified')
    console.log('  Application Fee:', `₹${(fees.applicationFee || 0).toLocaleString('en-IN')}`)
    console.log('  Payment Amount:', `₹${fees.actualPaymentAmount.toLocaleString('en-IN')}`)
    
    // System Status
    console.log('\n🔧 SYSTEM STATUS:')
    console.log('  Script Loaded:', scriptLoaded ? '✅ Yes' : '❌ No')
    console.log('  Processing:', isProcessing ? '⏳ Yes' : '✅ Ready')
    console.log('  Payment Option:', paymentOption)
    console.log('  Error State:', error || 'None')

    // Environment Details
    console.log('\n🌍 ENVIRONMENT:')
    console.log('  Razorpay Key ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'Not Set')
    console.log('  Window Razorpay Available:', typeof window !== 'undefined' && window.Razorpay ? '✅ Yes' : '❌ No')
    console.log('  Local Storage Available:', typeof localStorage !== 'undefined' ? '✅ Yes' : '❌ No')

    console.log('\n🔄 INITIATING RAZORPAY PAYMENT GATEWAY...')
    console.log('=' .repeat(80))

    setIsProcessing(true);
    setError(null);

    try {
      console.log('\n🔄 CREATING RAZORPAY ORDER...')
      console.log('  Order Amount:', `₹${fees.totalFee.toLocaleString('en-IN')}`)
      console.log('  Order Amount (Paise):', fees.totalFee * 100)

      const orderId = await createOrderId();
      if (!orderId) {
        console.error('❌ ORDER CREATION FAILED')
        setIsProcessing(false);
        return; // Error is already set by createOrderId
      }

      console.log('✅ ORDER CREATED SUCCESSFULLY')
      console.log('  Order ID:', orderId)

      console.log('\n⚙️ CONFIGURING RAZORPAY OPTIONS...')
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: fees.finalAmount * 100, // Amount in paise (with coupon discount applied)
        currency: "INR",
        name: "Admission Portal",
        description: `Application fee for ${programSelection.specialization}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const data = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const result = await fetch('/api/verify', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json' },
            });
            
            const res = await result.json();
            
            if (res.isOk) {
              // Console log successful payment for new applicant
              console.log('✅ NEW APPLICANT - PAYMENT SUCCESSFUL!')
              console.log('=' .repeat(60))
              console.log('📋 Application ID:', applicationData.applicationId)
              console.log('👤 Student Name:', `${personalInfo.firstName} ${personalInfo.lastName}`)
              console.log('💳 Payment ID:', response.razorpay_payment_id)
              console.log('🆔 Order ID:', response.razorpay_order_id)
              console.log('💰 Amount Paid:', `₹${fees.actualPaymentAmount.toLocaleString('en-IN')}`)
              console.log('💵 Application Fee:', `₹${(fees.applicationFee || 0).toLocaleString('en-IN')}`)
              console.log('📊 Payment Type: Full Payment')
              console.log('⏰ Payment Completion Time:', new Date().toISOString())
              console.log('🎓 Program:', fees.courseName)
              console.log('🏛️ Specialization:', programSelection.specialization)
              console.log('🏫 Campus:', programSelection.campus)
              console.log('✅ APPLICATION COMPLETED SUCCESSFULLY!')
              console.log('=' .repeat(60))

              try {
                // Submit admission data to API
                console.log('📤 Submitting admission data to external API...')
                await submitAdmissionData()
                console.log('✅ Admission data submitted successfully to external API')
              } catch (error) {
                console.error('⚠️ Warning: Failed to submit admission data to external API:', error)
                // Don't block the success flow if external API fails
              }

              // Payment successful - Complete the application
              updateApplicationData({
                paymentComplete: true,
                isComplete: true,
                submittedAt: new Date().toISOString(),
                paymentDetails: {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  amount: fees.actualPaymentAmount,
                  applicationFee: fees.applicationFee || 0,
                  fullCourseAmount: fees.applicationFee || 0,
                  remainingAmount: fees.remainingAmount,
                  paymentOption: paymentOption,
                  timestamp: new Date().toISOString()
                }
              });

              // Go to success page
              setCurrentStep('success');
            } else {
              setError(res.message || "Payment verification failed");
            }
          } catch (error) {
            setError("Failed to verify payment. Please contact support.");
            console.error("Payment verification error:", error);
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`,
          email: personalInfo.email,
          contact: personalInfo.phone
        },
        notes: {
          program: programSelection.specialization || 'Not selected',
          programType: programSelection.programType || 'Not selected',
          campus: programSelection.campus || 'Not selected',
          applicationId: `app_${Date.now()}`
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          },
          escape: true,
          animation: true
        }
      };

      console.log('📋 RAZORPAY OPTIONS CONFIGURED:')
      console.log('  Key:', options.key)
      console.log('  Amount:', options.amount, '(paise)')
      console.log('  Currency:', options.currency)
      console.log('  Name:', options.name)
      console.log('  Description:', options.description)
      console.log('  Order ID:', options.order_id)
      console.log('  Prefill Name:', options.prefill.name)
      console.log('  Prefill Email:', options.prefill.email)
      console.log('  Prefill Contact:', options.prefill.contact)
      console.log('  Theme Color:', options.theme.color)

      console.log('\n🚀 CREATING RAZORPAY INSTANCE...')
      // Create Razorpay instance and handle payment
      const paymentObject = new window.Razorpay(options);
      console.log('✅ RAZORPAY INSTANCE CREATED SUCCESSFULLY')

      paymentObject.on('payment.failed', function (response: RazorpayErrorResponse) {
        console.error('💥 PAYMENT FAILED:', response.error)
        setError(response.error.description || "Payment failed. Please try again.");
        setIsProcessing(false);
      });

      console.log('\n🎯 OPENING RAZORPAY PAYMENT MODAL...')
      paymentObject.open();
      console.log('✅ PAYMENT MODAL OPENED SUCCESSFULLY')
    } catch (error) {
      console.error("Payment initialization error:", error);
      setError("Payment initialization failed. Please try again later.");
      setIsProcessing(false);
    }
  }

  const handleBack = () => {
    setCurrentStep('review' as ApplicationStep)
  }

  const paymentInstructions = [
    paymentOption === 'custom'
      ? "This is a custom payment amount. The remaining course fee must be paid before course commencement."
      : paymentOption === 'course'
      ? "This payment covers the complete course fee including application fee."
      : "This payment covers the application fee only. Course fees will be collected separately.",
    paymentOption === 'custom'
      ? "Custom payments must be at least ₹100."
      : "Payment must be at least ₹100.",
    paymentOption === 'course' 
      ? "Course fee payment is non-refundable after course commencement."
      : "Application fee is one-time and non-refundable.",
    "Ensure all details are correct before proceeding with payment.",
    "You will receive a confirmation email after successful payment.",
    "Do not refresh or close the browser during payment processing."
  ];



  return (
    <div className="max-w-4xl mx-auto">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Razorpay script loaded successfully for new applicant')
          setScriptLoaded(true)
        }}
        onError={(e) => {
          console.error('❌ Failed to load Razorpay script for new applicant:', e)
          setError("Failed to load payment system. Please refresh the page.")
        }}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
        <p className="text-gray-600">Review your application details and proceed to payment.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Loading State */}
        {isLoadingFees && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {feeError && !isLoadingFees && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600 font-medium">Failed to load payment details</p>
            </div>
            <p className="text-red-500 mt-1 text-sm">{feeError}</p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Application Summary */}
        {!isLoadingFees && !feeError && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Summary</h2>
          
          {/* Personal Details Summary */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>{' '}
                <span className="font-medium">{personalInfo.firstName} {personalInfo.lastName}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-medium">{personalInfo.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium">{personalInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Program Details Summary */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-2">Selected Program</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Program:</span>{' '}
                <span className="font-medium">{fees.courseName}</span>
              </div>
              {fees.courseDuration && (
                <div>
                  <span className="text-gray-500">Duration:</span>{' '}
                  <span className="font-medium">{fees.courseDuration}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Specialization:</span>{' '}
                <span className="font-medium">
                  {programSelection.specialization ?
                    programSelection.specialization.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                    'Not selected'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-500">Campus:</span>{' '}
                <span className="font-medium">
                  {programSelection.campus ?
                    programSelection.campus.split('-').map(word =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ') :
                    'Not selected'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Payment Options</h3>

            <div className="space-y-4">
              {/* Application Fee Only Option */}
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentOption === 'application'}
                  onChange={() => handlePaymentOptionChange('application')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium text-gray-800">Pay Application Fee Only</span>
                  <p className="text-sm text-gray-600">
                    Pay the application fee of ₹{(fees.applicationFee || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </label>

              {/* Pay Total Course Fee Option */}
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentOption === 'course'}
                  onChange={() => handlePaymentOptionChange('course')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium text-gray-800">Pay Total Course Fee</span>
                  <p className="text-sm text-gray-600">
                    Pay the complete course fee of ₹{(fees.totalCourseFee || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 This includes application fee + course fee
                  </p>
                </div>
              </label>

              {/* Custom Payment Option */}
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  checked={paymentOption === 'custom'}
                  onChange={() => handlePaymentOptionChange('custom')}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">Pay Custom Amount</span>
                  <p className="text-sm text-gray-600 mb-2">
                    Enter any amount between ₹100 and ₹{(fees.totalCourseFee || 0).toLocaleString('en-IN')}
                  </p>

                  {/* Custom Amount Input */}
                  {paymentOption === 'custom' && (
                    <div className="mt-3">
                      <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter Payment Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          id="customAmount"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter amount"
                          min="100"
                          max={fees.totalCourseFee || 0}
                          className={`pl-8 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            customAmountError ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {customAmountError && (
                        <p className="mt-1 text-sm text-red-600">{customAmountError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum: ₹100 | Maximum: ₹{(fees.totalCourseFee || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                </div>
              </label>


            </div>
          </div>

          {/* Coupon Section */}
          {feeStructure && feeStructure.couponCodes && feeStructure.couponCodes.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
              <h3 className="text-md font-medium text-green-800 mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Apply Coupon Code
              </h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={isValidatingCoupon}
                  />
                  <Button
                    onClick={handleCouponValidation}
                    disabled={!couponCode.trim() || isValidatingCoupon}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isValidatingCoupon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>

                {/* Coupon Result */}
                {couponResult && (
                  <div className={`p-3 rounded-md ${
                    couponResult.isValid 
                      ? 'bg-green-100 border border-green-200' 
                      : 'bg-red-100 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {couponResult.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          couponResult.isValid ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {couponResult.isValid ? 'Coupon Applied Successfully!' : 'Invalid Coupon'}
                        </span>
            </div>
                      {couponResult.isValid && (
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Remove
                        </button>
                      )}
          </div>
                    
                    {couponResult.isValid ? (
                      <div className="mt-2 text-sm text-green-700">
                        <p>Discount: ₹{couponResult.discountAmount.toLocaleString('en-IN')}</p>
                        <p>Final Amount: ₹{couponResult.finalAmount.toLocaleString('en-IN')}</p>
                        {couponResult.coupon && (
                          <p className="text-xs mt-1">{couponResult.coupon.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-red-700">{couponResult.error}</p>
                    )}
                  </div>
                )}

                {/* Available Coupons Info */}
                <div className="text-xs text-green-600">
                  <p className="font-medium">Available Coupons:</p>
                  <div className="mt-1 space-y-1">
                                      {feeStructure.couponCodes
                    .filter((coupon: CouponCode) => coupon.isActive)
                    .slice(0, 3) // Show only first 3 coupons
                    .map((coupon: CouponCode) => (
                        <div key={coupon._id} className="flex items-center justify-between">
                          <span className="font-mono bg-white px-2 py-1 rounded border">
                            {coupon.code}
                          </span>
                          <span className="text-xs">
                            {coupon.discountType === 'percentage' 
                              ? `${coupon.discountValue}% off` 
                              : `₹${coupon.discountValue} off`
                            }
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fee Details */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="text-md font-medium text-blue-800 mb-3">Payment Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                {/* <span className="text-gray-600">Application Fee:</span>
                <span className="font-medium">₹{(fees.applicationFee || 0).toLocaleString('en-IN')}</span> */}
              </div>

              {/* <div className="flex justify-between">
                <span className="text-gray-600">Total Course Fee:</span>
                <span className="font-medium">₹{(fees.totalCourseFee || 0).toLocaleString('en-IN')}</span>
              </div> */}

              {/* Show coupon discount if applied */}
              {couponResult?.isValid && couponResult.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Coupon Discount:</span>
                  <span className="font-medium">-₹{couponResult.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}



              {paymentOption === 'application' && (
                <>
                  <div className="flex justify-between text-green-700">
                    <span>Application Fee:</span>
                    <span className="font-medium">₹{(fees.applicationFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-orange-700">
                    <span>Course Fee (Pay Later):</span>
                    <span className="font-medium">₹{(fees.totalCourseFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              {paymentOption === 'course' && (
                <>
                  <div className="flex justify-between text-green-700">
                    <span>Course Fee:</span>
                    <span className="font-medium">₹{(fees.totalCourseFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Application Fee:</span>
                  <span className="font-medium">₹{(fees.applicationFee || 0).toLocaleString('en-IN')}</span>
                </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Total Amount:</span>
                    <span className="font-medium">₹{fees.actualPaymentAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              {paymentOption === 'custom' && customAmount && (
                <>
                  <div className="flex justify-between text-green-700">
                    <span>Custom Payment Amount:</span>
                    <span className="font-medium">₹{fees.actualPaymentAmount.toLocaleString('en-IN')}</span>
                </div>
                  <div className="flex justify-between text-orange-700">
                    <span>Remaining Course Fee:</span>
                    <span className="font-medium">₹{fees.remainingAmount.toLocaleString('en-IN')}</span>
              </div>
                </>
              )}



              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold text-blue-800">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{fees.finalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
        )}

        {/* Payment Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Payment Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-2 list-disc list-inside">
            {paymentInstructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ul>
        </div>



        {/* Payment Gateway Status */}
        {!scriptLoaded && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-800 text-sm">Loading secure payment gateway...</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            ← Back
          </Button>
          <Button
            onClick={handleProceedToPayment}
            size="lg"
            disabled={isProcessing || !scriptLoaded}
          >
            {!scriptLoaded
                ? 'Loading Payment System...'
                : isProcessing
                  ? 'Processing...'
                : paymentOption === 'course'
                  ? `Pay ₹${fees.finalAmount.toLocaleString('en-IN')} (Full Course) →`
                  : paymentOption === 'custom'
                    ? `Pay ₹${fees.finalAmount.toLocaleString('en-IN')} (Custom) →`
                    : `Pay ₹${fees.finalAmount.toLocaleString('en-IN')} (Application Fee) →`
            }
          </Button>
        </div>

        {/* Payment Security Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-3">🔒 Secure Payment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <p className="font-medium mb-1">Payment Gateway:</p>
              <p>Powered by Razorpay - India&apos;s most trusted payment gateway</p>
            </div>
            <div>
              <p className="font-medium mb-1">Security:</p>
              <p>256-bit SSL encryption ensures your payment data is secure</p>
            </div>
            <div>
              <p className="font-medium mb-1">Accepted Methods:</p>
              <p>Credit/Debit Cards, Net Banking, UPI, Wallets</p>
            </div>
            <div>
              <p className="font-medium mb-1">Support:</p>
              <p>24/7 payment support available for any issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}