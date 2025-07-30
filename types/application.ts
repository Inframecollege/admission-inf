export type UserType = 'new' | 'existing' | null

export type ApplicationStep =
  | 'personal-info'
  | 'academic-details'
  | 'program-selection'
  | 'payment'
  | 'review'
  | 'success'
  | 'login'
  | 'view-application'
  | 'edit-continue'

export interface PersonalInfo {
  // Student Personal Details
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  religion: string
  aadharNumber: string
  permanentAddress: string
  temporaryAddress: string
  city: string
  state: string
  pincode: string

  // Guardian Details (Parents)
  fathersName: string
  fathersPhone: string
  fathersOccupation: string
  fathersQualification: string
  mothersName: string
  mothersPhone: string
  mothersOccupation: string
  mothersQualification: string
  parentsAddress: string

  // Local Guardian Details (Optional)
  localGuardianName?: string
  localGuardianPhone?: string
  localGuardianOccupation?: string
  localGuardianRelation?: string
  localGuardianAddress?: string

  // Documents
  profilePhoto?: File
  profilePhotoUrl?: string
  signature?: File
  signatureUrl?: string
  aadharCard?: File
  aadharCardUrl?: string

  // Random Documents
  randomDocuments?: Array<{
    id: string
    name: string
    file: File
  }>
}

export interface AcademicDetails {
  tenthBoard: string
  tenthInstitution: string
  tenthPercentage: string
  tenthYear: string
  tenthMarksheet?: File
  twelfthBoard: string
  twelfthInstitution: string
  twelfthStream: string
  twelfthPercentage: string
  twelfthYear: string
  twelfthMarksheet?: File
  diplomaInstitution?: string
  diplomaStream?: string
  diplomaPercentage?: string
  diplomaYear?: string
  diplomaMarksheet?: File
  graduationUniversity?: string
  graduationPercentage?: string
  graduationYear?: string
  graduationMarksheet?: File
}

export interface DocumentUpload {
  tenthMarksheet?: File
  tenthMarksheetUrl?: string
  twelfthMarksheet?: File
  twelfthMarksheetUrl?: string
  diplomaMarksheet?: File
  diplomaMarksheetUrl?: string
  graduationMarksheet?: File
  graduationMarksheetUrl?: string
  photo?: File
  photoUrl?: string
  signature?: File
  signatureUrl?: string
}

// Add program selection types
export interface ProgramSelection {
  programType: string        // Course slug (e.g., 'interior-design')
  programName: string        // Program slug (e.g., 'b-int')
  programCategory: string    // Legacy field for compatibility
  specialization?: string    // Selected specialization (optional)
  campus: string            // Selected campus
  // Additional fields from API
  programId?: string         // Program ID from API
  programSlug?: string       // Program slug from API
  courseSlug?: string        // Course slug from API
  duration?: string          // Program duration
  description?: string       // Program description
}

export interface PaymentDetails {
  orderId: string;
  paymentId: string;
  amount: number;
  applicationFee?: number;
  fullCourseAmount?: number;
  remainingAmount?: number;
  paymentOption?: 'application' | 'course' | 'custom';
  timestamp: string;
}

export interface ApplicationData {
  personalInfo: PersonalInfo
  academicDetails: AcademicDetails
  documents: DocumentUpload
  programSelection: ProgramSelection
  paymentComplete: boolean
  paymentDetails?: PaymentDetails
  currentStep: ApplicationStep
  isComplete: boolean
  submittedAt?: string
  applicationId?: string
}

export interface LoginData {
  email: string
  password: string
  userId?: string
  token?: string
  isAuthenticated: boolean
}

export interface ApplicationContextType {
  userType: UserType
  setUserType: (type: UserType) => void
  currentStep: ApplicationStep
  setCurrentStep: (step: ApplicationStep) => void
  applicationData: ApplicationData
  updateApplicationData: (data: Partial<ApplicationData>) => void
  loginData: LoginData
  updateLoginData: (data: Partial<LoginData>) => void
  saveToStorage: () => void
  loadFromStorage: () => void
  resetApplication: () => void
  isInitialized: boolean
  // Auto-save functionality
  saveFormProgress: (stepName: string, formData: Record<string, unknown>) => void
  getFormProgress: (stepName: string) => Record<string, unknown> | null
  hasSavedData: () => boolean
  sessionInfo: {
    sessionId: string
    hasData: boolean
    currentStep: ApplicationStep | null
    isActive: boolean
  }
}




