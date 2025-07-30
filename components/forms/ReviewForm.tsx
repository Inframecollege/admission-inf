"use client"

import { useState, useEffect } from 'react'
import { useApplication } from '@/contexts/ApplicationContext'
import Button from '@/components/ui/Button'
import { FileText, Eye } from 'lucide-react'
import { admissionApiService } from '@/lib/admissionApi'
import { cookieStorage } from '@/lib/cookieStorage'
import Image from 'next/image'

export default function ReviewForm() {
  const { applicationData, setCurrentStep, updateApplicationData} = useApplication()
  const [applicationId, setApplicationId] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Generate application ID when component mounts
  useEffect(() => {
    if (!applicationId) {
      const newApplicationId = `APP${Date.now().toString().slice(-8)}`
      setApplicationId(newApplicationId)
      // Save application ID to context
      updateApplicationData({
        applicationId: newApplicationId
      })
    }
  }, [applicationId, updateApplicationData])

  const handleSubmit = async () => {
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
      setCurrentStep('payment')
    } catch (error: unknown) {
      console.error('Failed to save progress:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewDocument = (file: File | string, documentName: string) => {
    if (typeof file === 'string') {
      // If it's a URL, open it directly
      const newWindow = window.open(file, '_blank')
      if (newWindow) {
        newWindow.document.title = documentName
      }
    } else if (file) {
      // If it's a File object, create object URL
      const fileURL = URL.createObjectURL(file)
      const newWindow = window.open(fileURL, '_blank')
      if (newWindow) {
        newWindow.document.title = documentName
      }
    }
  }

  const renderDocumentStatus = (file: File | undefined, url: string | undefined, documentName: string) => {
    const hasFile = file || url
    const isImage = documentName.toLowerCase().includes('photo') || 
                   documentName.toLowerCase().includes('signature') ||
                   (url && url.match(/\.(jpg|jpeg|png|gif|webp)$/i))

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={hasFile ? "text-green-600" : "text-red-600"}>
            {hasFile ? "✓" : "✗"}
          </span>
          <span>{documentName}</span>
          {file && (
            <span className="text-gray-500">({file.name})</span>
          )}
          {url && !file && (
            <span className="text-gray-500">(Uploaded)</span>
          )}
        </div>
        {hasFile && (
          <div className="flex items-center space-x-2">
            {isImage && url && (
              <Image
                src={url}
                alt={documentName}
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded border"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDocument(file || url!, documentName)}
              className="flex items-center gap-1 text-xs"
            >
              <Eye className="w-3 h-3" />
              View
            </Button>
          </div>
        )}
      </div>
    )
  }

  const handleBack = () => {
    setCurrentStep('program-selection')
  }

  const handleEdit = (step: string) => {
    setCurrentStep(step as 'personal-info' | 'academic-details' | 'program-selection' | 'payment')
  }

  const { personalInfo, academicDetails, documents } = applicationData

  const termsAndConditions = [
    "The applicant must fulfill the eligibility criteria as specified in the admission guidelines for the program.",
    "Admission is subject to verification of all original documents during the admission process.",
    "If 12th results awaited and student doesn't qualified that school will not be liable for it.",
    "The applicant must provide accurate, current, and complete information in the admission form.",
    "Any misinformation or false documents will result in immediate disqualification and cancellation of admission.",
    "The submission of the admission form does not guarantee admission.",
    "Failure to provide the required documents within the stipulated time frame may result in rejection of the application.",
    "Admission is confirmed only after the payment of the full admission fee, as mentioned in the fee structure.",
    "The fee is non-refundable in any circumstances.",
    "Failure to make timely payments may result in suspension or termination of enrollment. ₹50 per day penalty would be taken for late fees payment.",
    "The admission will be confirmed after verification of all documents and payment of fees.",
    "The institution reserves the right to revoke admission at any stage if any discrepancies are found.",
    "Upon admission, the student agrees to abide by the rules and regulations of the institution.",
    "Any violation of the code of conduct or disciplinary guidelines may lead to expulsion.",
    "The information provided in the admission form will be used solely for the admission process and will remain confidential.",
    "The institution may use the data for internal purposes like communication, announcements, or records maintenance.",
    "The institution reserves the right to deny admission to any applicant without providing specific reasons.",
    "The institution reserves the right to modify the terms and conditions of admission at any time without prior notice.",
    "Regular attendance and participation are mandatory for successful course completion.",
    "Course is non transferable and fees is not refundable in any case.",
    "Students wishing to withdraw from the course must notify the institution in writing.",
    "Exams would be held in different centre if approved by University & main centre.",
    "School reserves the right to change or cancel any test center/city at its discretion, if required."
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Application</h1>
        <p className="text-gray-600">Please review all information before submitting your application.</p>
        
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <Button variant="outline" size="sm" onClick={() => handleEdit('personal-info')}>
              Edit
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2">{personalInfo.firstName} {personalInfo.lastName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2">{personalInfo.email}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2">{personalInfo.phone}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date of Birth:</span>
              <span className="ml-2">{personalInfo.dateOfBirth}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Gender:</span>
              <span className="ml-2 capitalize">{personalInfo.gender}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Address:</span>
              <span className="ml-2">{personalInfo.permanentAddress}, {personalInfo.city}, {personalInfo.state} - {personalInfo.pincode}</span>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Academic Details</h2>
            <Button variant="outline" size="sm" onClick={() => handleEdit('academic-details')}>
              Edit
            </Button>
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">10th Board:</span>
                <span className="ml-2 capitalize">{academicDetails.tenthBoard}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">10th Percentage:</span>
                <span className="ml-2">{academicDetails.tenthPercentage}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">10th Year:</span>
                <span className="ml-2">{academicDetails.tenthYear}</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">12th Board:</span>
                <span className="ml-2 capitalize">{academicDetails.twelfthBoard}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">12th Percentage:</span>
                <span className="ml-2">{academicDetails.twelfthPercentage}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">12th Year:</span>
                <span className="ml-2">{academicDetails.twelfthYear}</span>
              </div>
            </div>
            {academicDetails.graduationUniversity && (
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Graduation:</span>
                  <span className="ml-2">{academicDetails.graduationUniversity}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Graduation %:</span>
                  <span className="ml-2">{academicDetails.graduationPercentage}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Graduation Year:</span>
                  <span className="ml-2">{academicDetails.graduationYear}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Program Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Program Selection</h2>
            <Button variant="outline" size="sm" onClick={() => handleEdit('program-selection')}>
              Edit
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Course:</span>
              <span className="ml-2 capitalize">{applicationData.programSelection?.programType?.replace('-', ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Program:</span>
              <span className="ml-2 capitalize">{applicationData.programSelection?.programName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Campus:</span>
              <span className="ml-2 capitalize">{applicationData.programSelection?.campus?.replace('-', ' ')}</span>
            </div>
            {applicationData.programSelection?.duration && (
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2">{applicationData.programSelection.duration} years</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Uploaded Documents</h2>
          </div>
          <div className="space-y-4">
            {/* Personal Documents */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">Personal Documents</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {renderDocumentStatus(personalInfo.profilePhoto, personalInfo.profilePhotoUrl, 'Profile Photo')}
                {renderDocumentStatus(personalInfo.signature, personalInfo.signatureUrl, 'Signature')}
                {renderDocumentStatus(personalInfo.aadharCard, personalInfo.aadharCardUrl, 'Aadhar Card')}
              </div>
            </div>

            {/* Academic Documents */}
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">Academic Documents</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {renderDocumentStatus(documents.tenthMarksheet, documents.tenthMarksheetUrl, '10th Grade Marksheet')}
                {renderDocumentStatus(documents.twelfthMarksheet, documents.twelfthMarksheetUrl, '12th Grade Marksheet')}
                {(documents.diplomaMarksheet || documents.diplomaMarksheetUrl) && 
                  renderDocumentStatus(documents.diplomaMarksheet, documents.diplomaMarksheetUrl, 'Diploma Marksheet')}
                {(documents.graduationMarksheet || documents.graduationMarksheetUrl) && 
                  renderDocumentStatus(documents.graduationMarksheet, documents.graduationMarksheetUrl, 'Graduation Marksheet')}
              </div>
            </div>

            {/* Additional Documents */}
            {personalInfo.randomDocuments && personalInfo.randomDocuments.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-2">Additional Documents</h3>
                <div className="space-y-2">
                  {personalInfo.randomDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="font-medium">{doc.name}</span>
                        <span className="text-gray-500 text-sm">({doc.file.name})</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc.file, doc.name)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application ID Display */}
        {applicationId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Application ID Generated</h3>

            {/* Application ID Display */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Application ID</p>
                  <p className="text-xl font-mono font-bold text-gray-900">
                    {applicationId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please save this ID for future reference. You can download your application PDF after payment.
                  </p>
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-3">Terms & Conditions</h3>
          <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
            {termsAndConditions.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ul>

          {/* Agreement Checkbox */}
          <div className="mt-6 bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreement-checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreement-checkbox" className="text-sm text-gray-800">
                <span className="font-semibold">I hereby acknowledge and agree to the following:</span>
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700">
                  <li>I have read and understood all the terms and conditions mentioned above.</li>
                  <li>I agree to all the terms and conditions mentioned above.</li>
                  <li>I understand that all information provided is accurate and complete.</li>
                  <li>I understand that any fees paid are non-refundable as per the terms.</li>
                  <li>I agree to abide by all institutional rules and regulations.</li>
                </ul>
              </label>
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Declaration</h3>
          <p className="text-sm text-yellow-700">
            I hereby declare that all the information provided above is true and correct to the best of my knowledge.
            I understand that any false information may lead to the rejection of my application.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            ← Back
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={!agreed || isSaving}
            className={!agreed ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isSaving ? 'Saving...' : (agreed ? 'Next: Payment →' : 'Accept Terms to Continue')}
          </Button>
        </div>
      </div>
    </div>
  )
}

