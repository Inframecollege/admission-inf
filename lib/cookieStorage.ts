import { ApplicationData, LoginData, ApplicationStep, UserType } from '@/types/application'

// Cookie storage utility for persistent data across browser sessions
const COOKIE_KEYS = {
  APPLICATION_DATA: 'admission_app_data',
  LOGIN_DATA: 'admission_login_data',
  USER_TYPE: 'admission_user_type',
  CURRENT_STEP: 'admission_current_step',
  SESSION_ID: 'admission_session_id'
} as const

// Cookie options
const COOKIE_OPTIONS = {
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
}

// Utility functions for cookie operations
const setCookie = (name: string, value: string, options = COOKIE_OPTIONS): void => {
  if (typeof window === 'undefined') return

  let cookieString = `${name}=${encodeURIComponent(value)}`
  
  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`
  }
  
  if (options.path) {
    cookieString += `; path=${options.path}`
  }
  
  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`
  }
  
  if (options.secure) {
    cookieString += `; secure`
  }
  
  document.cookie = cookieString
}

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null

  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
    }
  }
  return null
}

const deleteCookie = (name: string): void => {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// Generate a unique session ID for this application session
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Cookie storage implementation
export const cookieStorage = {
  // Initialize session
  initializeSession: (): string => {
    let sessionId = getCookie(COOKIE_KEYS.SESSION_ID)
    if (!sessionId) {
      sessionId = generateSessionId()
      setCookie(COOKIE_KEYS.SESSION_ID, sessionId)
    }
    return sessionId
  },

  // Application data
  saveApplicationData: (data: ApplicationData): void => {
    try {
      const jsonData = JSON.stringify(data)
      setCookie(COOKIE_KEYS.APPLICATION_DATA, jsonData)
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('admission_application_data', jsonData)
      }
    } catch (error) {
      console.error('Failed to save application data to cookies:', error)
    }
  },

  getApplicationData: (): ApplicationData | null => {
    try {
      // Try to get from cookies first
      let data = getCookie(COOKIE_KEYS.APPLICATION_DATA)
      
      // Fallback to localStorage if cookie not found
      if (!data && typeof window !== 'undefined') {
        data = localStorage.getItem('admission_application_data')
      }
      
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to retrieve application data from cookies:', error)
      return null
    }
  },

  // Login data
  saveLoginData: (data: LoginData): void => {
    try {
      const jsonData = JSON.stringify(data)
      setCookie(COOKIE_KEYS.LOGIN_DATA, jsonData)
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('admission_login_data', jsonData)
      }
    } catch (error) {
      console.error('Failed to save login data to cookies:', error)
    }
  },

  getLoginData: (): LoginData | null => {
    try {
      // Try to get from cookies first
      let data = getCookie(COOKIE_KEYS.LOGIN_DATA)
      
      // Fallback to localStorage if cookie not found
      if (!data && typeof window !== 'undefined') {
        data = localStorage.getItem('admission_login_data')
      }
      
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to retrieve login data from cookies:', error)
      return null
    }
  },

  // Save user ID separately for easy access
  saveUserId: (userId: string): void => {
    setCookie('admission_user_id', userId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admission_user_id', userId)
    }
  },

  getUserId: (): string | null => {
    let userId = getCookie('admission_user_id')
    if (!userId && typeof window !== 'undefined') {
      userId = localStorage.getItem('admission_user_id')
    }
    return userId
  },

  // Save admission form ID separately for easy access
  saveAdmissionFormId: (admissionFormId: string): void => {
    setCookie('admission_form_id', admissionFormId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admission_form_id', admissionFormId)
    }
  },

  getAdmissionFormId: (): string | null => {
    let admissionFormId = getCookie('admission_form_id')
    if (!admissionFormId && typeof window !== 'undefined') {
      admissionFormId = localStorage.getItem('admission_form_id')
    }
    return admissionFormId
  },

  // User type
  saveUserType: (userType: UserType): void => {
    if (userType) {
      setCookie(COOKIE_KEYS.USER_TYPE, userType)
      
      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('admission_user_type', userType)
      }
    }
  },

  getUserType: (): UserType => {
    // Try to get from cookies first
    let userType = getCookie(COOKIE_KEYS.USER_TYPE) as UserType
    
    // Fallback to localStorage if cookie not found
    if (!userType && typeof window !== 'undefined') {
      userType = localStorage.getItem('admission_user_type') as UserType
    }
    
    return userType || null
  },

  // Current step
  saveCurrentStep: (step: ApplicationStep): void => {
    setCookie(COOKIE_KEYS.CURRENT_STEP, step)
    
    // Also save to localStorage as backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('admission_current_step', step)
    }
  },

  getCurrentStep: (): ApplicationStep | null => {
    // Try to get from cookies first
    let step = getCookie(COOKIE_KEYS.CURRENT_STEP) as ApplicationStep
    
    // Fallback to localStorage if cookie not found
    if (!step && typeof window !== 'undefined') {
      step = localStorage.getItem('admission_current_step') as ApplicationStep
    }
    
    return step || null
  },

  // Auto-save functionality for form fields
  saveFormProgress: (stepName: string, formData: Record<string, unknown>): void => {
    try {
      const progressKey = `${COOKIE_KEYS.APPLICATION_DATA}_progress_${stepName}`
      const jsonData = JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString(),
        step: stepName
      })
      setCookie(progressKey, jsonData)
    } catch (error) {
      console.error(`Failed to save form progress for ${stepName}:`, error)
    }
  },

  getFormProgress: (stepName: string): Record<string, unknown> | null => {
    try {
      const progressKey = `${COOKIE_KEYS.APPLICATION_DATA}_progress_${stepName}`
      const data = getCookie(progressKey)
      
      if (data) {
        const parsed = JSON.parse(data)
        // Check if data is not too old (7 days)
        const timestamp = new Date(parsed.timestamp)
        const now = new Date()
        const daysDiff = (now.getTime() - timestamp.getTime()) / (1000 * 3600 * 24)
        
        if (daysDiff <= 7) {
          return parsed.data
        } else {
          // Clean up old data
          deleteCookie(progressKey)
        }
      }
      
      return null
    } catch (error) {
      console.error(`Failed to retrieve form progress for ${stepName}:`, error)
      return null
    }
  },

  // Clear all data
  clearAll: (): void => {
    // Clear all cookies
    Object.values(COOKIE_KEYS).forEach(key => {
      deleteCookie(key)
    })
    
    // Also clear localStorage backup
    if (typeof window !== 'undefined') {
      const keysToRemove = [
        'admission_application_data',
        'admission_login_data',
        'admission_user_type',
        'admission_current_step'
      ]
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
    }
  },

  // Clear only application data (keep login session)
  clearApplicationData: (): void => {
    deleteCookie(COOKIE_KEYS.APPLICATION_DATA)
    deleteCookie(COOKIE_KEYS.CURRENT_STEP)
    
    // Clear form progress cookies
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';')
      cookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        if (name.includes('_progress_')) {
          deleteCookie(name)
        }
      })
      
      // Also clear localStorage backup
      localStorage.removeItem('admission_application_data')
      localStorage.removeItem('admission_current_step')
    }
  },

  // Check if user has saved data
  hasSavedData: (): boolean => {
    const applicationData = cookieStorage.getApplicationData()
    const loginData = cookieStorage.getLoginData()
    
    return !!(applicationData || loginData)
  },

  // Get session info
  getSessionInfo: () => {
    const sessionId = getCookie(COOKIE_KEYS.SESSION_ID)
    const hasData = cookieStorage.hasSavedData()
    const currentStep = cookieStorage.getCurrentStep()
    
    return {
      sessionId,
      hasData,
      currentStep,
      isActive: !!(sessionId && hasData)
    }
  }
}
