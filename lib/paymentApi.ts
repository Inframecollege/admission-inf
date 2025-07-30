export interface CouponCode {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minimumAmount: number
  maximumDiscount: number
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  description: string
  order: number
  _id: string
}

interface EmiOption {
  months: number
  monthlyAmount: number
  totalAmount: number
  processingFee: number
  interestRate: number
  isActive: boolean
  order: number
  _id: string
}

export interface FeeStructure {
  totalFee: number
  monthlyFee: number
  yearlyFee: number
  processingFee: number
  registrationFee: number
  emiOptions: EmiOption[]
  discountPercentage: number
  couponCodes: CouponCode[]
  paymentTerms: string
  refundPolicy: string
  isActive: boolean
  order: number
  _id: string
}

export interface Program {
  _id: string
  slug: string
  title: string
  parentCourseSlug: string
  parentCourseTitle: string
  duration: string
  description: string
  shortDescription: string
  feeStructure: FeeStructure
  isActive: boolean
}

export interface Course {
  _id: string
  slug: string
  title: string
  description: string
  isActive: boolean
  programs: Program[]
}

interface PaymentDetailsResponse {
  success: boolean
  data: Course[]
}

class PaymentApiService {
  private baseURL = 'https://backend-rakj.onrender.com/api/v1'

  async getPaymentDetails(): Promise<PaymentDetailsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch payment details')
      }

      return result
    } catch (error) {
      console.error('Fetch payment details error:', error)
      throw error
    }
  }

  // Get fee structure for a specific program
  async getFeeStructure(courseSlug: string, programSlug: string): Promise<{
    feeStructure: FeeStructure | null
    courseId: string | null
    programId: string | null
  }> {
    try {
      const response = await this.getPaymentDetails()
      const course = response.data.find(c => c.slug === courseSlug && c.isActive)
      
      if (!course) {
        console.log('Course not found:', courseSlug)
        return { feeStructure: null, courseId: null, programId: null }
      }

      const program = course.programs.find(p => p.slug === programSlug && p.isActive)
      
      if (!program) {
        console.log('Program not found:', programSlug)
        return { feeStructure: null, courseId: null, programId: null }
      }

      return {
        feeStructure: program.feeStructure || null,
        courseId: course._id,
        programId: program._id
      }
    } catch (error) {
      console.error('Get fee structure error:', error)
      return { feeStructure: null, courseId: null, programId: null }
    }
  }

  // Validate and apply coupon code
  async validateCoupon(courseSlug: string, programSlug: string, couponCode: string, amount: number): Promise<{
    isValid: boolean
    discountAmount: number
    finalAmount: number
    coupon?: CouponCode
    error?: string
  }> {
    try {
      const result = await this.getFeeStructure(courseSlug, programSlug)
      
      if (!result.feeStructure) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: amount,
          error: 'Fee structure not found'
        }
      }

      const feeStructure = result.feeStructure

      const coupon = feeStructure.couponCodes.find(c => 
        c.code.toUpperCase() === couponCode.toUpperCase() && 
        c.isActive &&
        new Date(c.validFrom) <= new Date() &&
        new Date(c.validUntil) >= new Date() &&
        c.usedCount < c.usageLimit
      )

      if (!coupon) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: amount,
          error: 'Invalid or expired coupon code'
        }
      }

      if (amount < coupon.minimumAmount) {
        return {
          isValid: false,
          discountAmount: 0,
          finalAmount: amount,
          error: `Minimum amount required: ₹${coupon.minimumAmount.toLocaleString('en-IN')}`
        }
      }

      let discountAmount = 0
      if (coupon.discountType === 'percentage') {
        discountAmount = (amount * coupon.discountValue) / 100
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount)
      } else {
        discountAmount = coupon.discountValue
      }

      const finalAmount = Math.max(0, amount - discountAmount)

      return {
        isValid: true,
        discountAmount,
        finalAmount,
        coupon
      }
    } catch (error) {
      console.error('Validate coupon error:', error)
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: amount,
        error: 'Failed to validate coupon'
      }
    }
  }

  // Get EMI options for a program
  async getEmiOptions(courseSlug: string, programSlug: string): Promise<EmiOption[]> {
    try {
      const result = await this.getFeeStructure(courseSlug, programSlug)
      return result.feeStructure?.emiOptions.filter(emi => emi.isActive) || []
    } catch (error) {
      console.error('Get EMI options error:', error)
      return []
    }
  }
}

export const paymentApiService = new PaymentApiService() 