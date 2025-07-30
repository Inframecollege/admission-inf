interface SignupData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface LoginData {
  email: string
  password: string
}

interface PaymentTransaction {
  transactionId: string
  amount: number
  paymentMethod: string
  paymentGateway: string
  status: string
  description: string
  remarks: string
  _id: string
  createdAt: string
  updatedAt: string
}

interface AppliedCoupon {
  couponCode: string
  discountAmount: number
  discountType: string
  originalValue: number
  appliedAt: string
  _id: string
}

interface PaymentInformation {
  _id: string
  userId: string
  admissionId: string
  courseId: string
  programId: string
  totalFee: number
  processingFee: number
  registrationFee: number
  courseFee: number
  paymentStatus: string
  feePaid: number
  totalAmountPaid: number
  totalAmountDue: number
  totalDiscount: number
  nextPaymentDate: string | null
  isActive: boolean
  remarks: string
  appliedCoupons: AppliedCoupon[]
  emiPayments: Array<{
    amount: number
    dueDate: string
    status: string
    [key: string]: unknown
  }>
  paymentTransactions: PaymentTransaction[]
  lastPaymentDate: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface AdmissionFormData {
  documents: {
    randomDocuments: Array<{
      id: string
      name: string
      file: File
      [key: string]: unknown
    }>
  }
  _id: string
  userId: string
  status: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  religion: string
  aadharNumber: string
  aadharCard: string
  permanentAddress: string
  temporaryAddress: string
  city: string
  state: string
  pincode: string
  
  // Guardian Details
  fathersName: string
  fathersPhone: string
  fathersOccupation: string
  fathersQualification: string
  mothersName: string
  mothersPhone: string
  mothersOccupation: string
  mothersQualification: string
  parentsAddress: string
  
  // Local Guardian Details
  localGuardianName: string
  localGuardianPhone: string
  localGuardianOccupation: string
  localGuardianRelation: string
  localGuardianAddress: string
  
  // Academic Details
  tenthBoard: string
  tenthInstitution: string
  tenthPercentage: string
  tenthYear: string
  tenthMarksheet: string
  twelfthBoard: string
  twelfthInstitution: string
  twelfthStream: string
  twelfthPercentage: string
  twelfthYear: string
  twelfthMarksheet: string
  diplomaInstitution: string
  diplomaStream: string
  diplomaPercentage: string
  diplomaYear: string
  diplomaMarksheet: string
  graduationUniversity: string
  graduationPercentage: string
  graduationYear: string
  graduationMarksheet: string
  
  // Program Selection
  programType: string
  programName: string
  programCategory: string
  specialization: string
  campus: string
  
  // Document URLs
  profilePhoto: string
  signature: string
  
  submittedAt: string
  paymentComplete: boolean
  paymentStatus: string
  applicationStatus: string
  createdAt: string
  updatedAt: string
  applicationId: string
  studentName: string
  __v: number
}

interface AuthResponse {
  success: boolean
  message: string
  data?: {
    _id: string
    name: string
    email: string
    phone: string
    applicationId: string
    admissionFormId: AdmissionFormData
    paymentInformation: PaymentInformation[]
    isActive: boolean
    isVerified: boolean
    sessionToken: string
  }
  error?: string
  statusCode?: number
  timestamp?: string
}

class AuthService {
  private baseURL = 'https://backend-rakj.onrender.com/api/v1/admission-auth'

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Signup failed')
      }

      return result
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed')
      }

      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }
}

export const authService = new AuthService()

// Utility function to convert API response to application data structure
export const convertApiResponseToApplicationData = (apiData: AuthResponse['data']) => {
  if (!apiData?.admissionFormId) return null

  const admissionForm = apiData.admissionFormId
  const latestPayment = apiData.paymentInformation?.[0] // Get the most recent payment

  return {
    personalInfo: {
      firstName: admissionForm.firstName || '',
      lastName: admissionForm.lastName || '',
      email: admissionForm.email || '',
      phone: admissionForm.phone || '',
      dateOfBirth: admissionForm.dateOfBirth ? new Date(admissionForm.dateOfBirth).toISOString().split('T')[0] : '',
      gender: admissionForm.gender || '',
      religion: admissionForm.religion || '',
      aadharNumber: admissionForm.aadharNumber || '',
      permanentAddress: admissionForm.permanentAddress || '',
      temporaryAddress: admissionForm.temporaryAddress || '',
      city: admissionForm.city || '',
      state: admissionForm.state || '',
      pincode: admissionForm.pincode || '',

      // Guardian Details (Parents)
      fathersName: admissionForm.fathersName || '',
      fathersPhone: admissionForm.fathersPhone || '',
      fathersOccupation: admissionForm.fathersOccupation || '',
      fathersQualification: admissionForm.fathersQualification || '',
      mothersName: admissionForm.mothersName || '',
      mothersPhone: admissionForm.mothersPhone || '',
      mothersOccupation: admissionForm.mothersOccupation || '',
      mothersQualification: admissionForm.mothersQualification || '',
      parentsAddress: admissionForm.parentsAddress || '',

      // Local Guardian Details (Optional)
      localGuardianName: admissionForm.localGuardianName || '',
      localGuardianPhone: admissionForm.localGuardianPhone || '',
      localGuardianOccupation: admissionForm.localGuardianOccupation || '',
      localGuardianRelation: admissionForm.localGuardianRelation || '',
      localGuardianAddress: admissionForm.localGuardianAddress || '',

      // Documents
      profilePhoto: undefined,
      profilePhotoUrl: admissionForm.profilePhoto || '',
      signature: undefined,
      signatureUrl: admissionForm.signature || '',
      aadharCard: undefined,
      aadharCardUrl: admissionForm.aadharCard || '',
      randomDocuments: admissionForm.documents?.randomDocuments || []
    },
    academicDetails: {
      tenthBoard: admissionForm.tenthBoard || '',
      tenthInstitution: admissionForm.tenthInstitution || '',
      tenthPercentage: admissionForm.tenthPercentage || '',
      tenthYear: admissionForm.tenthYear || '',
      tenthMarksheet: undefined,
      twelfthBoard: admissionForm.twelfthBoard || '',
      twelfthInstitution: admissionForm.twelfthInstitution || '',
      twelfthStream: admissionForm.twelfthStream || '',
      twelfthPercentage: admissionForm.twelfthPercentage || '',
      twelfthYear: admissionForm.twelfthYear || '',
      twelfthMarksheet: undefined,
      diplomaInstitution: admissionForm.diplomaInstitution || '',
      diplomaStream: admissionForm.diplomaStream || '',
      diplomaPercentage: admissionForm.diplomaPercentage || '',
      diplomaYear: admissionForm.diplomaYear || '',
      diplomaMarksheet: undefined,
      graduationUniversity: admissionForm.graduationUniversity || '',
      graduationPercentage: admissionForm.graduationPercentage || '',
      graduationYear: admissionForm.graduationYear || '',
      graduationMarksheet: undefined
    },
    documents: {
      tenthMarksheetUrl: admissionForm.tenthMarksheet || '',
      twelfthMarksheetUrl: admissionForm.twelfthMarksheet || '',
      diplomaMarksheetUrl: admissionForm.diplomaMarksheet || '',
      graduationMarksheetUrl: admissionForm.graduationMarksheet || '',
      photoUrl: admissionForm.profilePhoto || '',
      signatureUrl: admissionForm.signature || ''
    },
    programSelection: {
      programType: admissionForm.programType || '',
      programName: admissionForm.programName || '',
      programCategory: admissionForm.programCategory || '',
      specialization: admissionForm.specialization || '',
      campus: admissionForm.campus || ''
    },
    paymentComplete: admissionForm.paymentComplete || false,
    paymentDetails: latestPayment ? {
      orderId: latestPayment._id,
      paymentId: latestPayment.paymentTransactions?.[0]?.transactionId || '',
      amount: latestPayment.totalAmountPaid,
      applicationFee: latestPayment.registrationFee,
      fullCourseAmount: latestPayment.totalFee,
      remainingAmount: latestPayment.totalAmountDue,
      paymentOption: 'partial' as const,
      timestamp: latestPayment.lastPaymentDate
    } : undefined,
    currentStep: 'personal-info',
    isComplete: admissionForm.applicationStatus === 'completed',
    submittedAt: admissionForm.submittedAt,
    applicationId: admissionForm.applicationId
  }
} 