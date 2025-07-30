"use client"

import { useState } from 'react'
import { Mail, Lock, Shield, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { authService } from '@/lib/auth'
import Link from 'next/link'

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

interface ExistingStudentAuthProps {
  onAuthSuccess: (studentData: StudentData) => void
}

export default function ExistingStudentAuth({ onAuthSuccess }: ExistingStudentAuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await authService.login({
        email,
        password
      })

      if (response.success && response.data) {
                // Mock student data - in real app, this would come from backend
        const mockStudentData: StudentData = {
          id: response.data._id || 'STU2024001',
          fullName: response.data.name || 'Rahul Kumar',
          email: response.data.email || email,
          phone: response.data.phone || '9876543210',
          programCategory: 'bachelors',
          selectedProgram: 'Bachelor of Design (B.Des)',
          specialization: 'Interior Design',
          campus: 'main-campus',
          admissionDate: '2024-01-15',
          hasInitialPayment: false,
          applicationFee: 2500,
          paidAmount: 0,
          remainingAmount: 2500,
          academicYear: '2024-25'
        }

        console.log('=' .repeat(60))
        console.log('🎓 EXISTING STUDENT LOGIN SUCCESSFUL')
        console.log('=' .repeat(60))
        console.log('👤 Student Name:', mockStudentData.fullName)
        console.log('📧 Email:', mockStudentData.email)
        console.log('📱 Phone:', mockStudentData.phone)
        console.log('🎨 Program:', mockStudentData.selectedProgram)
        console.log('🏫 Specialization:', mockStudentData.specialization)
        console.log('📅 Admission Date:', mockStudentData.admissionDate)
        console.log('💰 Application Fee:', `₹${mockStudentData.applicationFee.toLocaleString('en-IN')}`)
        console.log('💸 Amount Paid:', `₹${mockStudentData.paidAmount.toLocaleString('en-IN')}`)
        console.log('💳 Remaining Amount:', `₹${mockStudentData.remainingAmount.toLocaleString('en-IN')}`)
        console.log('🎯 Academic Year:', mockStudentData.academicYear)
        console.log('✅ Access Granted to Application Fee Payment Portal')
        console.log('=' .repeat(60))

        // Success - pass student data to parent component
        onAuthSuccess(mockStudentData)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Existing Applicant Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your email and password to access your fee portal
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
              <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                    className="pl-10"
                  required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                Enter the email address you used during admission
                </p>
              </div>

              <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
                </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              </div>

                <Button
              type="submit"
              disabled={isLoading || !email || !password}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                    </div>
                  ) : (
                <div className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/" className="font-medium text-green-600 hover:text-green-500">
                Apply for admission
              </Link>
        </p>
          </div>
      </div>
      </div>
    </div>
  )
}
