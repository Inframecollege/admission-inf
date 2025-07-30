"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  UserType, 
  ApplicationStep, 
  ApplicationData, 
  LoginData, 
  ApplicationContextType,
  PersonalInfo,
  AcademicDetails,
  DocumentUpload
} from '@/types/application'
import { storage } from '@/lib/storage'
import { cookieStorage } from '@/lib/cookieStorage'

const defaultPersonalInfo: PersonalInfo = {
  // Student Personal Details
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  religion: '',
  aadharNumber: '',
  permanentAddress: '',
  temporaryAddress: '',
  city: '',
  state: '',
  pincode: '',

  // Guardian Details (Parents)
  fathersName: '',
  fathersPhone: '',
  fathersOccupation: '',
  fathersQualification: '',
  mothersName: '',
  mothersPhone: '',
  mothersOccupation: '',
  mothersQualification: '',
  parentsAddress: '',

  // Local Guardian Details (Optional)
  localGuardianName: '',
  localGuardianPhone: '',
  localGuardianOccupation: '',
  localGuardianRelation: '',
  localGuardianAddress: '',

  // Documents
  profilePhoto: undefined,
  signature: undefined,
  aadharCard: undefined,
  randomDocuments: []
}

const defaultAcademicDetails: AcademicDetails = {
  tenthBoard: '',
  tenthInstitution: '',
  tenthPercentage: '',
  tenthYear: '',
  tenthMarksheet: undefined,
  twelfthBoard: '',
  twelfthInstitution: '',
  twelfthStream: '',
  twelfthPercentage: '',
  twelfthYear: '',
  twelfthMarksheet: undefined,
  diplomaInstitution: '',
  diplomaStream: '',
  diplomaPercentage: '',
  diplomaYear: '',
  diplomaMarksheet: undefined,
  graduationUniversity: '',
  graduationPercentage: '',
  graduationYear: '',
  graduationMarksheet: undefined
}

const defaultDocuments: DocumentUpload = {}

const defaultApplicationData: ApplicationData = {
  personalInfo: defaultPersonalInfo,
  academicDetails: defaultAcademicDetails,
  documents: defaultDocuments,
  programSelection: {
    programType: '',
    programName: '',
    programCategory: '',
    specialization: '',
    campus: ''
  },
  paymentComplete: false,
  currentStep: 'personal-info',
  isComplete: false
}

const defaultLoginData: LoginData = {
  email: '',
  password: '',
  userId: '',
  token: '',
  isAuthenticated: false
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined)

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<UserType>(null)
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('personal-info')
  const [applicationData, setApplicationData] = useState<ApplicationData>(defaultApplicationData)
  const [loginData, setLoginData] = useState<LoginData>(defaultLoginData)
  const [isInitialized, setIsInitialized] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')

  // Load data from storage on mount
  useEffect(() => {
    // Initialize session with cookie storage
    const newSessionId = cookieStorage.initializeSession()
    setSessionId(newSessionId)

    // Check if there's valid authentication data from cookies first, then localStorage
    const savedLoginData = cookieStorage.getLoginData() || storage.getLoginData()
    const savedUserType = cookieStorage.getUserType() || storage.getUserType()

    // Only load if user is properly authenticated
    if (savedLoginData?.isAuthenticated && savedUserType) {
      loadFromStorage()
    } else {
      // Check if there's any saved application data without authentication
      const savedApplicationData = cookieStorage.getApplicationData()
      const savedCurrentStep = cookieStorage.getCurrentStep()

      if (savedApplicationData || savedCurrentStep) {
        // Load partial data for form continuation
        if (savedApplicationData) {
          setApplicationData(savedApplicationData)
        }
        if (savedCurrentStep) {
          setCurrentStep(savedCurrentStep)
        }
      } else {
        // Clear invalid or incomplete authentication data
        storage.clearAll()
        cookieStorage.clearAll()
      }
    }

    setIsInitialized(true)
  }, [])

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => ({ ...prev, ...data }))
  }

  const updateLoginData = (data: Partial<LoginData>) => {
    setLoginData(prev => ({ ...prev, ...data }))
  }

  const saveToStorage = useCallback(() => {
    // Save to both cookie storage (primary) and localStorage (backup)
    cookieStorage.saveApplicationData(applicationData)
    cookieStorage.saveLoginData(loginData)
    if (userType) cookieStorage.saveUserType(userType)
    cookieStorage.saveCurrentStep(currentStep)

    // Also save to localStorage as backup
    storage.saveApplicationData(applicationData)
    storage.saveLoginData(loginData)
    if (userType) storage.saveUserType(userType)
    storage.saveCurrentStep(currentStep)
  }, [applicationData, loginData, userType, currentStep])

  const loadFromStorage = () => {
    // Try to load from cookies first, then localStorage as fallback
    const savedApplicationData = cookieStorage.getApplicationData() || storage.getApplicationData()
    const savedLoginData = cookieStorage.getLoginData() || storage.getLoginData()
    const savedUserType = (cookieStorage.getUserType() || storage.getUserType()) as UserType
    const savedCurrentStep = (cookieStorage.getCurrentStep() || storage.getCurrentStep()) as ApplicationStep

    if (savedApplicationData) setApplicationData(savedApplicationData)
    if (savedLoginData) setLoginData(savedLoginData)
    // Only load userType if user is properly authenticated
    if (savedUserType && savedLoginData?.isAuthenticated) {
      setUserType(savedUserType)
    }
    if (savedCurrentStep) setCurrentStep(savedCurrentStep)
  }

  const resetApplication = () => {
    setUserType(null)
    setCurrentStep('personal-info')
    setApplicationData(defaultApplicationData)
    setLoginData(defaultLoginData)
    // Clear both cookie storage and localStorage
    cookieStorage.clearAll()
    storage.clearAll()
  }

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized) {
      saveToStorage()
    }
  }, [applicationData, loginData, userType, currentStep, saveToStorage, isInitialized])

  // Auto-save form progress functions
  const saveFormProgress = useCallback((stepName: string, formData: Record<string, unknown>) => {
    cookieStorage.saveFormProgress(stepName, formData)
  }, [])

  const getFormProgress = useCallback((stepName: string): Record<string, unknown> | null => {
    return cookieStorage.getFormProgress(stepName)
  }, [])

  const hasSavedData = useCallback((): boolean => {
    return cookieStorage.hasSavedData()
  }, [])

  const sessionInfo = {
    sessionId,
    hasData: hasSavedData(),
    currentStep: currentStep,
    isActive: !!(sessionId && hasSavedData())
  }

  const value: ApplicationContextType = {
    userType,
    setUserType,
    currentStep,
    setCurrentStep,
    applicationData,
    updateApplicationData,
    loginData,
    updateLoginData,
    saveToStorage,
    loadFromStorage,
    resetApplication,
    isInitialized,
    saveFormProgress,
    getFormProgress,
    hasSavedData,
    sessionInfo
  }

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplication() {
  const context = useContext(ApplicationContext)
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider')
  }
  return context
}

