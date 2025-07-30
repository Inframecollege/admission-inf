"use client"

import { useApplication } from '@/contexts/ApplicationContext'
import PersonalInfoForm from '@/components/forms/PersonalInfoForm'
import AcademicDetailsForm from '@/components/forms/AcademicDetailsForm'
import ProgramSelectionForm from '@/components/forms/ProgramSelectionForm'
import PaymentForm from '@/components/forms/PaymentForm'
import ReviewForm from '@/components/forms/ReviewForm'
import ApplicationSuccessForm from '@/components/forms/ApplicationSuccessForm'

export default function NewApplicant() {
  const { currentStep } = useApplication()

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal-info':
        return <PersonalInfoForm />
      case 'academic-details':
        return <AcademicDetailsForm />
      case 'program-selection':
        return <ProgramSelectionForm />
      case 'payment':
        return <PaymentForm />
      case 'review':
        return <ReviewForm />
      case 'success':
        return <ApplicationSuccessForm />
      default:
        return <PersonalInfoForm />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {renderCurrentStep()}
    </div>
  )
}
