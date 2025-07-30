import { ApplicationData, LoginData } from '@/types/application'

const STORAGE_KEYS = {
  APPLICATION_DATA: 'admission_application_data',
  LOGIN_DATA: 'admission_login_data',
  USER_TYPE: 'admission_user_type',
  CURRENT_STEP: 'admission_current_step'
} as const

export const storage = {
  // Application data
  saveApplicationData: (data: ApplicationData): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.APPLICATION_DATA, JSON.stringify(data))
    }
  },

  getApplicationData: (): ApplicationData | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATION_DATA)
      return data ? JSON.parse(data) : null
    }
    return null
  },

  // Login data
  saveLoginData: (data: LoginData): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOGIN_DATA, JSON.stringify(data))
    }
  },

  getLoginData: (): LoginData | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.LOGIN_DATA)
      return data ? JSON.parse(data) : null
    }
    return null
  },

  // User type
  saveUserType: (userType: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, userType)
    }
  },

  getUserType: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.USER_TYPE)
    }
    return null
  },

  // Current step
  saveCurrentStep: (step: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, step)
    }
  },

  getCurrentStep: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_STEP)
    }
    return null
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }
}
