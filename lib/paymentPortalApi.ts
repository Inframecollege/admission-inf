export interface PaymentPortalData {
  studentId: string
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
  paymentStatus: string
  totalFee: number
  processingFee: number
  registrationFee: number
  courseFee: number
  totalAmountPaid: number
  totalAmountDue: number
  totalDiscount: number
  nextPaymentDate: string | null
  appliedCoupons: Array<{
    couponCode: string
    discountAmount: number
    discountType: string
    originalValue: number
    appliedAt: string
  }>
  paymentTransactions: Array<{
    transactionId: string
    amount: number
    paymentMethod: string
    paymentGateway: string
    status: string
    description: string
    remarks: string
    createdAt: string
  }>
  lastPaymentDate: string
  applicationStatus: string
  isActive: boolean
}

interface PaymentPortalResponse {
  success: boolean
  message: string
  data?: PaymentPortalData
  error?: string
}

interface PaymentHistoryResponse {
  success: boolean
  message: string
  data?: Array<{
    transactionId: string
    amount: number
    paymentMethod: string
    paymentGateway: string
    status: string
    description: string
    remarks: string
    createdAt: string
    updatedAt: string
  }>
  error?: string
}

class PaymentPortalApiService {
  private baseURL = 'https://backend-rakj.onrender.com/api/v1'

  // Get payment portal data for a user
  async getPaymentPortalData(userId: string): Promise<PaymentPortalResponse> {
    try {
      const response = await fetch(`${this.baseURL}/admission-auth/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch payment portal data')
      }

      // Transform the API response to match our PaymentPortalData interface
      if (result.data) {
        const admissionForm = result.data.admissionFormId
        const paymentInfo = result.data.paymentInformation?.[0] // Get the latest payment info
        
        const transformedData: PaymentPortalData = {
          studentId: result.data._id,
          fullName: `${admissionForm?.firstName || ''} ${admissionForm?.lastName || ''}`.trim(),
          email: admissionForm?.email || result.data.email,
          phone: admissionForm?.phone || result.data.phone,
          programCategory: admissionForm?.programCategory || '',
          selectedProgram: admissionForm?.programName || '',
          specialization: admissionForm?.specialization || '',
          campus: admissionForm?.campus || '',
          admissionDate: admissionForm?.createdAt || '',
          hasInitialPayment: paymentInfo?.totalAmountPaid > 0 || false,
          applicationFee: paymentInfo?.registrationFee || 0,
          paidAmount: paymentInfo?.totalAmountPaid || 0,
          remainingAmount: paymentInfo?.totalAmountDue || 0,
          academicYear: new Date().getFullYear().toString(),
          paymentStatus: paymentInfo?.paymentStatus || 'pending',
          totalFee: paymentInfo?.totalFee || 0,
          processingFee: paymentInfo?.processingFee || 0,
          registrationFee: paymentInfo?.registrationFee || 0,
          courseFee: paymentInfo?.courseFee || 0,
          totalAmountPaid: paymentInfo?.totalAmountPaid || 0,
          totalAmountDue: paymentInfo?.totalAmountDue || 0,
          totalDiscount: paymentInfo?.totalDiscount || 0,
          nextPaymentDate: paymentInfo?.nextPaymentDate || null,
          appliedCoupons: paymentInfo?.appliedCoupons || [],
          paymentTransactions: paymentInfo?.paymentTransactions || [],
          lastPaymentDate: paymentInfo?.lastPaymentDate || '',
          applicationStatus: admissionForm?.applicationStatus || 'pending',
          isActive: result.data.isActive || false
        }

        return {
          success: true,
          message: 'Payment portal data fetched successfully',
          data: transformedData
        }
      }

      return result
    } catch (error) {
      console.error('Get payment portal data error:', error)
      throw error
    }
  }

  // Get payment history for a user
  async getPaymentHistory(userId: string): Promise<PaymentHistoryResponse> {
    try {
      const response = await fetch(`${this.baseURL}/admission-auth/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch payment history')
      }

      // Extract payment transactions from the response
      const paymentTransactions = result.data?.paymentInformation?.[0]?.paymentTransactions || []

      return {
        success: true,
        message: 'Payment history fetched successfully',
        data: paymentTransactions
      }
    } catch (error) {
      console.error('Get payment history error:', error)
      throw error
    }
  }

  // Submit payment to external API after successful payment
  async submitPaymentData(paymentData: {
    userId: string
    courseId: string
    programId: string
    paymentType: 'full' | 'partial'
    couponCode?: string
    initialPayment: number
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
    email: string
    education: string
    workExperience: string
    transactionId: string
    orderId: string
  }): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/admission/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit payment data')
      }

      return result
    } catch (error) {
      console.error('Submit payment data error:', error)
      throw error
    }
  }

  // Update payment information after successful payment
  async updatePaymentInfo(userId: string, paymentData: {
    amount: number
    transactionId: string
    orderId: string
    paymentMethod: string
    paymentGateway: string
    status: string
    description: string
    remarks?: string
  }): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${this.baseURL}/admission-auth/user/${userId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update payment information')
      }

      return result
    } catch (error) {
      console.error('Update payment info error:', error)
      throw error
    }
  }
}

export { PaymentPortalApiService }