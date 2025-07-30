"use client"

import Link from 'next/link'
import { useApplication } from '@/contexts/ApplicationContext'
import { ApplicationStep } from '@/types/application'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

interface StepConfig {
  id: ApplicationStep
  label: string
  // icon: string
}

const newApplicationSteps: StepConfig[] = [
  { id: 'personal-info', label: 'Personal Info'},
  { id: 'academic-details', label: 'Academic Details'},
  { id: 'program-selection', label: 'Program Selection'},
  { id: 'review', label: 'Review Details'},
  { id: 'payment', label: 'Payment'}
]

const existingApplicationSteps: StepConfig[] = [
  { id: 'login', label: 'Login'},
  { id: 'payment', label: 'Make Payment'}
]

export default function Sidebar() {
  const { userType, currentStep, setCurrentStep, resetApplication, setUserType } = useApplication()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    // Reset application and go to login page
    resetApplication()
    setUserType(null)
    setCurrentStep('login')
    setIsMobileMenuOpen(false) // Close mobile menu
  }

  // Don't show sidebar if user is not authenticated
  if (!userType) {
    return null
  }

  const steps = userType === 'new' ? newApplicationSteps : existingApplicationSteps

  const getStepStatus = (stepId: ApplicationStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    const currentStepIndex = steps.findIndex(step => step.id === currentStep)

    if (stepIndex < currentStepIndex) return 'completed'
    if (stepIndex === currentStepIndex) return 'current'
    return 'upcoming'
  }

  const handleStepClick = (stepId: ApplicationStep) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    const currentStepIndex = steps.findIndex(step => step.id === currentStep)

    // Allow navigation to current step or previous completed steps
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(stepId)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-black text-white p-2 rounded-md"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:fixed top-0 left-0 h-full w-64 bg-black text-white p-4 sm:p-6 overflow-y-auto z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="pt-12 lg:pt-0">
            <Link href="/" className="block">
              <h1 className="text-xl sm:text-2xl font-bold hover:text-gray-300 transition-colors">
                Inframe School
              </h1>
            </Link>
          </div>

          {/* Steps Navigation */}
          {userType && (
            <nav className="space-y-2 sm:space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Steps How to Apply
              </h2>
              {steps.map((step) => {
                const status = getStepStatus(step.id)
                const isClickable = status === 'current' || status === 'completed'

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      handleStepClick(step.id)
                      setIsMobileMenuOpen(false) // Close mobile menu on step click
                    }}
                    disabled={!isClickable}
                    className={`w-full text-left p-2 sm:p-3 rounded-lg transition-all duration-200 flex items-center space-x-2 sm:space-x-3 ${
                      status === 'current'
                        ? 'bg-white text-black font-semibold'
                        : status === 'completed'
                        ? 'bg-gray-800 text-white hover:bg-gray-700'
                        : 'bg-gray-900 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">{step.label}</span>
                        {status === 'completed' && (
                          <span className="text-green-400 text-xs">✓</span>
                        )}
                        {status === 'current' && (
                          <span className="text-blue-600 text-xs">●</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          )}

          {/* Logout Button */}
          {userType && (
            <div className="pb-4">
              <button
                onClick={handleLogout}
                className="w-full text-left p-2 sm:p-3 rounded-lg transition-all duration-200 flex items-center space-x-2 sm:space-x-3 bg-red-900 text-red-200 hover:bg-red-800 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
