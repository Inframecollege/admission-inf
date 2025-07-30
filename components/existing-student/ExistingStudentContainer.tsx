"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ExistingStudentAuth from './ExistingStudentAuth'

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

export default function ExistingStudentContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const router = useRouter()

  const handleAuthSuccess = (data: StudentData) => {
    setStudentData(data)
    setIsAuthenticated(true)
    
    // Store student data in sessionStorage for the dynamic portal
    sessionStorage.setItem('existingStudentData', JSON.stringify(data))
    
    // Redirect directly to the dynamic portal
    router.push('/payment-portal')
  }

  // Check if user is already authenticated and redirect to dynamic portal
  useEffect(() => {
    const storedData = sessionStorage.getItem('existingStudentData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setStudentData(data)
        setIsAuthenticated(true)
        router.push('/payment-portal')
      } catch (error) {
        console.error('Error parsing stored student data:', error)
        sessionStorage.removeItem('existingStudentData')
      }
    }
  }, [router])

  if (!isAuthenticated || !studentData) {
    return <ExistingStudentAuth onAuthSuccess={handleAuthSuccess} />
  }

  // This should not be reached since we redirect to dynamic portal
  return null
}
