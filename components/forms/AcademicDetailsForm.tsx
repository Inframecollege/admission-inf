"use client"

import { useState } from 'react'
import { useApplication } from '@/contexts/ApplicationContext'
import { AcademicDetails } from '@/types/application'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'
import { Phone } from 'lucide-react'
import { admissionApiService } from '@/lib/admissionApi'
import { cookieStorage } from '@/lib/cookieStorage'

const boardOptions = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'icse', label: 'ICSE' },
  { value: 'state-board', label: 'State Board' },
  { value: 'ib', label: 'International Baccalaureate (IB)' },
  { value: 'other', label: 'Other' }
]

const streamOptions = [
  { value: 'science', label: 'Science' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'arts', label: 'Arts/Humanities' },
  { value: 'vocational', label: 'Vocational' },
  { value: 'other', label: 'Other' }
]

const yearOptions = Array.from({ length: 20 }, (_, i) => {
  const year = new Date().getFullYear() - i
  return { value: year.toString(), label: year.toString() }
})

interface AcademicDetailsErrors {
  tenthBoard?: string
  tenthInstitution?: string
  tenthStream?: string
  tenthPercentage?: string
  tenthYear?: string
  tenthMarksheet?: string
  twelfthBoard?: string
  twelfthInstitution?: string
  twelfthStream?: string
  twelfthPercentage?: string
  twelfthYear?: string
  twelfthMarksheet?: string
  diplomaInstitution?: string
  diplomaStream?: string
  diplomaPercentage?: string
  diplomaYear?: string
  diplomaMarksheet?: string
  graduationUniversity?: string
  graduationPercentage?: string
  graduationYear?: string
  graduationMarksheet?: string
}

export default function AcademicDetailsForm() {
  const { applicationData, updateApplicationData, setCurrentStep } = useApplication()
  const [errors, setErrors] = useState<AcademicDetailsErrors>({})
  const [newDocumentName, setNewDocumentName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: AcademicDetailsErrors = {}
    const { academicDetails } = applicationData

    // 10th grade validation
    if (!academicDetails.tenthBoard) newErrors.tenthBoard = '10th board is required'
    if (!academicDetails.tenthInstitution.trim()) newErrors.tenthInstitution = '10th institution name is required'
    if (!academicDetails.tenthPercentage) newErrors.tenthPercentage = '10th percentage is required'
    else if (isNaN(Number(academicDetails.tenthPercentage)) || Number(academicDetails.tenthPercentage) < 0 || Number(academicDetails.tenthPercentage) > 100) {
      newErrors.tenthPercentage = 'Please enter a valid percentage (0-100)'
    }
    if (!academicDetails.tenthYear) newErrors.tenthYear = '10th passing year is required'

    // 12th grade validation
    if (!academicDetails.twelfthBoard) newErrors.twelfthBoard = '12th board is required'
    if (!academicDetails.twelfthInstitution.trim()) newErrors.twelfthInstitution = '12th institution name is required'
    if (!academicDetails.twelfthStream) newErrors.twelfthStream = '12th stream is required'
    if (!academicDetails.twelfthPercentage) newErrors.twelfthPercentage = '12th percentage is required'
    else if (isNaN(Number(academicDetails.twelfthPercentage)) || Number(academicDetails.twelfthPercentage) < 0 || Number(academicDetails.twelfthPercentage) > 100) {
      newErrors.twelfthPercentage = 'Please enter a valid percentage (0-100)'
    }
    if (!academicDetails.twelfthYear) newErrors.twelfthYear = '12th passing year is required'

    // Diploma validation (optional but if filled, must be complete)
    if (academicDetails.diplomaInstitution || academicDetails.diplomaStream || academicDetails.diplomaPercentage || academicDetails.diplomaYear) {
      if (!academicDetails.diplomaInstitution?.trim()) newErrors.diplomaInstitution = 'Diploma institution name is required'
      if (!academicDetails.diplomaStream) newErrors.diplomaStream = 'Diploma stream is required'
      if (!academicDetails.diplomaPercentage) newErrors.diplomaPercentage = 'Diploma percentage is required'
      else if (isNaN(Number(academicDetails.diplomaPercentage)) || Number(academicDetails.diplomaPercentage) < 0 || Number(academicDetails.diplomaPercentage) > 100) {
        newErrors.diplomaPercentage = 'Please enter a valid percentage (0-100)'
      }
      if (!academicDetails.diplomaYear) newErrors.diplomaYear = 'Diploma year is required'
    }

    // Graduation validation (optional but if filled, must be complete)
    if (academicDetails.graduationUniversity || academicDetails.graduationPercentage || academicDetails.graduationYear) {
      if (!academicDetails.graduationUniversity?.trim()) newErrors.graduationUniversity = 'University name is required'
      if (!academicDetails.graduationPercentage) newErrors.graduationPercentage = 'Graduation percentage is required'
      else if (isNaN(Number(academicDetails.graduationPercentage)) || Number(academicDetails.graduationPercentage) < 0 || Number(academicDetails.graduationPercentage) > 100) {
        newErrors.graduationPercentage = 'Please enter a valid percentage (0-100)'
      }
      if (!academicDetails.graduationYear) newErrors.graduationYear = 'Graduation year is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    setSaveError(null)

    try {
      // Get admission form ID from cookies
      const admissionFormId = cookieStorage.getAdmissionFormId()
      
      if (!admissionFormId) {
        throw new Error('Admission form ID not found')
      }

      // Save progress to API
      await admissionApiService.saveProgress(admissionFormId, applicationData)
      
      // Move to next step
      setCurrentStep('program-selection')
    } catch (error: unknown) {
      console.error('Failed to save progress:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof AcademicDetails, value: string) => {
    updateApplicationData({
      academicDetails: {
        ...applicationData.academicDetails,
        [field]: value
      }
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageChange = (field: 'tenthMarksheet' | 'twelfthMarksheet' | 'diplomaMarksheet' | 'graduationMarksheet', file: File | undefined, imageUrl?: string) => {
    updateApplicationData({
      academicDetails: {
        ...applicationData.academicDetails,
        [field]: file
      },
      documents: {
        ...applicationData.documents,
        [`${field}Url`]: imageUrl
      }
    })
    // Clear error when user uploads a file
    if (file && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleUrlGenerated = (url: string, field: 'tenthMarksheet' | 'twelfthMarksheet' | 'diplomaMarksheet' | 'graduationMarksheet') => {
    // Update the documents with the generated URL
    updateApplicationData({
      documents: {
        ...applicationData.documents,
        [`${field}Url`]: url
      }
    })
    console.log(`URL generated for ${field}:`, url)
  }

  const handlePersonalImageChange = (field: 'profilePhoto' | 'signature', file: File | undefined, imageUrl?: string) => {
    updateApplicationData({
      personalInfo: {
        ...applicationData.personalInfo,
        [field]: file,
        [`${field}Url`]: imageUrl
      }
    })
  }

  const handleRandomDocumentAdd = (file: File | undefined) => {
    if (!file || !newDocumentName.trim()) return

    const newDocument = {
      id: Date.now().toString(),
      name: newDocumentName.trim(),
      file: file
    }

    const currentRandomDocs = applicationData.personalInfo?.randomDocuments || []

    updateApplicationData({
      personalInfo: {
        ...applicationData.personalInfo,
        randomDocuments: [...currentRandomDocs, newDocument]
      }
    })

    setNewDocumentName('')
  }

  const handleRandomDocumentRemove = (documentId: string) => {
    const currentRandomDocs = applicationData.personalInfo?.randomDocuments || []
    const updatedDocs = currentRandomDocs.filter(doc => doc.id !== documentId)

    updateApplicationData({
      personalInfo: {
        ...applicationData.personalInfo,
        randomDocuments: updatedDocs
      }
    })
  }

  const handleBack = () => {
    setCurrentStep('personal-info')
  }

  const { academicDetails } = applicationData

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Academic Details</h1>
        <p className="text-sm sm:text-base text-gray-600">Please provide your educational background information.</p>
        
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Inline Helpline */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-900 font-medium">Need help with academic details?</span>
            </div>
            <a
              href="tel:+919876543210"
              className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors duration-200"
            >
              Call +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* 10th Grade */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">10th Grade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Select
              label="Board"
              value={academicDetails.tenthBoard}
              onChange={(e) => handleInputChange('tenthBoard', e.target.value)}
              options={boardOptions}
              error={errors.tenthBoard}
              placeholder="Select board"
              required
            />
            <Input
              label="Institution Name"
              value={academicDetails.tenthInstitution}
              onChange={(e) => handleInputChange('tenthInstitution', e.target.value)}
              error={errors.tenthInstitution}
              placeholder="School/Institution name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Input
              label="Percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={academicDetails.tenthPercentage}
              onChange={(e) => handleInputChange('tenthPercentage', e.target.value)}
              error={errors.tenthPercentage}
              placeholder="e.g., 85.5"
              required
            />
            <Select
              label="Passing Year"
              value={academicDetails.tenthYear}
              onChange={(e) => handleInputChange('tenthYear', e.target.value)}
              options={yearOptions}
              error={errors.tenthYear}
              placeholder="Select year"
              required
            />
          </div>

          {/* 10th Marksheet Upload */}
          <div className="mt-4 sm:mt-6">
            <ImageUpload
              label="10th Marksheet"
              accept=".jpg,.jpeg,.png"
              file={academicDetails.tenthMarksheet}
              imageUrl={applicationData.documents.tenthMarksheetUrl}
              onChange={(file, imageUrl) => handleImageChange('tenthMarksheet', file, imageUrl)}
              onUrlGenerated={(url) => handleUrlGenerated(url, 'tenthMarksheet')}
              error={errors.tenthMarksheet}
              required
              folder="admission-portal/marksheets"
            />
          </div>
        </div>

        {/* 12th Grade */}
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">12th Grade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Select
              label="Board"
              value={academicDetails.twelfthBoard}
              onChange={(e) => handleInputChange('twelfthBoard', e.target.value)}
              options={boardOptions}
              error={errors.twelfthBoard}
              placeholder="Select board"
              required
            />
            <Input
              label="Institution Name"
              value={academicDetails.twelfthInstitution}
              onChange={(e) => handleInputChange('twelfthInstitution', e.target.value)}
              error={errors.twelfthInstitution}
              placeholder="School/College name"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Select
              label="Stream"
              value={academicDetails.twelfthStream}
              onChange={(e) => handleInputChange('twelfthStream', e.target.value)}
              options={streamOptions}
              error={errors.twelfthStream}
              placeholder="Select stream"
              required
            />
            <Input
              label="Percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={academicDetails.twelfthPercentage}
              onChange={(e) => handleInputChange('twelfthPercentage', e.target.value)}
              error={errors.twelfthPercentage}
              placeholder="e.g., 85.5"
              required
            />
            <Select
              label="Passing Year"
              value={academicDetails.twelfthYear}
              onChange={(e) => handleInputChange('twelfthYear', e.target.value)}
              options={yearOptions}
              error={errors.twelfthYear}
              placeholder="Select year"
              required
            />
          </div>

          {/* 12th Marksheet Upload */}
          <div className="mt-4 sm:mt-6">
            <ImageUpload
              label="12th Marksheet"
              accept=".jpg,.jpeg,.png"
              file={academicDetails.twelfthMarksheet}
              imageUrl={applicationData.documents.twelfthMarksheetUrl}
              onChange={(file, imageUrl) => handleImageChange('twelfthMarksheet', file, imageUrl)}
              error={errors.twelfthMarksheet}
              required
              folder="admission-portal/marksheets"
            />
          </div>
        </div>

        {/* Document Uploads Section */}
        <div className="bg-purple-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Document Uploads</h2>

          {/* Profile Photo and Signature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <ImageUpload
              label="Profile Photo"
              accept=".jpg,.jpeg,.png"
              file={applicationData.personalInfo?.profilePhoto}
              imageUrl={applicationData.personalInfo?.profilePhotoUrl}
              onChange={(file, imageUrl) => handlePersonalImageChange('profilePhoto', file, imageUrl)}
              required
              folder="admission-portal/profile-photos"
            />
            <ImageUpload
              label="Signature"
              accept=".jpg,.jpeg,.png"
              file={applicationData.personalInfo?.signature}
              imageUrl={applicationData.personalInfo?.signatureUrl}
              onChange={(file, imageUrl) => handlePersonalImageChange('signature', file, imageUrl)}
              required
              folder="admission-portal/signatures"
            />
          </div>

          {/* Additional Documents */}
          <div className="border-t border-purple-200 pt-6">
            <h3 className="text-md font-medium text-gray-800 mb-4">Additional Documents (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">Upload any additional documents you want to include with your application</p>

            {/* Add New Document */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
              <div className="sm:col-span-2">
                <Input
                  label="Document Name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  placeholder="e.g., Birth Certificate, Caste Certificate, etc."
                />
              </div>
              <div>
                <ImageUpload
                  label="Upload Document"
                  accept=".jpg,.jpeg,.png"
                  file={undefined}
                  onChange={(file) => handleRandomDocumentAdd(file)}
                  folder="admission-portal/additional-documents"
                />
              </div>
            </div>

            {/* Display Uploaded Random Documents */}
            {applicationData.personalInfo?.randomDocuments && applicationData.personalInfo.randomDocuments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Uploaded Documents</h4>
                <div className="space-y-2">
                  {applicationData.personalInfo.randomDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.file.name} ({(doc.file.size / 1024 / 1024).toFixed(2)} MB)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRandomDocumentRemove(doc.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Diploma (Optional) */}
        <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Diploma (Optional)</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">Fill this section if you have completed a diploma</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Institution Name"
              value={academicDetails.diplomaInstitution || ''}
              onChange={(e) => handleInputChange('diplomaInstitution', e.target.value)}
              error={errors.diplomaInstitution}
              placeholder="Institution name"
            />
            <Select
              label="Stream"
              value={academicDetails.diplomaStream || ''}
              onChange={(e) => handleInputChange('diplomaStream', e.target.value)}
              options={streamOptions}
              error={errors.diplomaStream}
              placeholder="Select stream"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Input
              label="Percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={academicDetails.diplomaPercentage || ''}
              onChange={(e) => handleInputChange('diplomaPercentage', e.target.value)}
              error={errors.diplomaPercentage}
              placeholder="e.g., 85.5"
            />
            <Select
              label="Passing Year"
              value={academicDetails.diplomaYear || ''}
              onChange={(e) => handleInputChange('diplomaYear', e.target.value)}
              options={yearOptions}
              error={errors.diplomaYear}
              placeholder="Select year"
            />
          </div>

          {/* Diploma Marksheet Upload */}
          <div className="mt-4 sm:mt-6">
            <ImageUpload
              label="Diploma Marksheet"
              accept=".jpg,.jpeg,.png"
              file={academicDetails.diplomaMarksheet}
              imageUrl={applicationData.documents.diplomaMarksheetUrl}
              onChange={(file, imageUrl) => handleImageChange('diplomaMarksheet', file, imageUrl)}
              error={errors.diplomaMarksheet}
              folder="admission-portal/marksheets"
            />
          </div>
        </div>

        {/* Graduation (Optional) */}
        <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Graduation (Optional)</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">Fill this section if you have completed graduation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Input
              label="University/College"
              value={academicDetails.graduationUniversity || ''}
              onChange={(e) => handleInputChange('graduationUniversity', e.target.value)}
              error={errors.graduationUniversity}
              placeholder="University name"
            />
            <Input
              label="Percentage/CGPA"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={academicDetails.graduationPercentage || ''}
              onChange={(e) => handleInputChange('graduationPercentage', e.target.value)}
              error={errors.graduationPercentage}
              placeholder="e.g., 85.5"
            />
            <Select
              label="Passing Year"
              value={academicDetails.graduationYear || ''}
              onChange={(e) => handleInputChange('graduationYear', e.target.value)}
              options={yearOptions}
              error={errors.graduationYear}
              placeholder="Select year"
            />
          </div>

          {/* Graduation Marksheet Upload */}
          <div className="mt-4 sm:mt-6">
            <ImageUpload
              label="Graduation Marksheet"
              accept=".jpg,.jpeg,.png"
              file={academicDetails.graduationMarksheet}
              imageUrl={applicationData.documents.graduationMarksheetUrl}
              onChange={(file, imageUrl) => handleImageChange('graduationMarksheet', file, imageUrl)}
              error={errors.graduationMarksheet}
              folder="admission-portal/marksheets"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 sm:pt-6">
          <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto">
            ← Back
          </Button>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Next: Program Selection →'}
          </Button>
        </div>
      </form>
    </div>
  )
}