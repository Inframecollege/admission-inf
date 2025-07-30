import { ApplicationData } from '@/types/application'

interface SaveProgressResponse {
  success: boolean
  message: string
  data?: {
    admissionId: string
    status: string
    updatedAt: string
  }
  error?: string
}

class AdmissionApiService {
  private baseURL = 'https://backend-rakj.onrender.com/api/v1'

  async saveProgress(admissionId: string, applicationData: ApplicationData): Promise<SaveProgressResponse> {
    try {
      const requestBody = {
        personalInfo: {
          ...applicationData.personalInfo,
          // Include image URLs for documents
          profilePhotoUrl: applicationData.personalInfo.profilePhotoUrl,
          signatureUrl: applicationData.personalInfo.signatureUrl,
          aadharCardUrl: applicationData.personalInfo.aadharCardUrl,
          // Also include as separate fields that backend might expect
          profilePhoto: applicationData.personalInfo.profilePhotoUrl,
          signature: applicationData.personalInfo.signatureUrl,
          aadharCard: applicationData.personalInfo.aadharCardUrl,
        },
        academicDetails: {
          ...applicationData.academicDetails,
          // Include document URLs directly in academicDetails as the backend expects
          tenthMarksheet: applicationData.documents.tenthMarksheetUrl || '',
          twelfthMarksheet: applicationData.documents.twelfthMarksheetUrl || '',
          diplomaMarksheet: applicationData.documents.diplomaMarksheetUrl || '',
          graduationMarksheet: applicationData.documents.graduationMarksheetUrl || '',
        },
        documents: {
          ...applicationData.documents,
          // Include image URLs for academic documents
          tenthMarksheetUrl: applicationData.documents.tenthMarksheetUrl,
          twelfthMarksheetUrl: applicationData.documents.twelfthMarksheetUrl,
          diplomaMarksheetUrl: applicationData.documents.diplomaMarksheetUrl,
          graduationMarksheetUrl: applicationData.documents.graduationMarksheetUrl,
          photoUrl: applicationData.documents.photoUrl,
          signatureUrl: applicationData.documents.signatureUrl,
          // Also include as separate fields
          tenthMarksheet: applicationData.documents.tenthMarksheetUrl,
          twelfthMarksheet: applicationData.documents.twelfthMarksheetUrl,
          diplomaMarksheet: applicationData.documents.diplomaMarksheetUrl,
          graduationMarksheet: applicationData.documents.graduationMarksheetUrl,
          photo: applicationData.documents.photoUrl,
          signature: applicationData.documents.signatureUrl,
        },
        programSelection: applicationData.programSelection,
        paymentComplete: applicationData.paymentComplete,
        paymentDetails: applicationData.paymentDetails,
        currentStep: applicationData.currentStep,
        isComplete: applicationData.isComplete,
        submittedAt: applicationData.submittedAt,
        applicationId: applicationData.applicationId
      }

      // Debug: Log the data being sent
      console.log('Saving progress with data:', JSON.stringify(requestBody, null, 2))
      console.log('Image URLs in personalInfo:', {
        profilePhotoUrl: applicationData.personalInfo.profilePhotoUrl,
        signatureUrl: applicationData.personalInfo.signatureUrl,
        aadharCardUrl: applicationData.personalInfo.aadharCardUrl,
      })
      console.log('Image URLs in documents:', {
        tenthMarksheetUrl: applicationData.documents.tenthMarksheetUrl,
        twelfthMarksheetUrl: applicationData.documents.twelfthMarksheetUrl,
        diplomaMarksheetUrl: applicationData.documents.diplomaMarksheetUrl,
        graduationMarksheetUrl: applicationData.documents.graduationMarksheetUrl,
      })

      const response = await fetch(`${this.baseURL}/admission/${admissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()
      
      // Debug: Log the API response
      console.log('API Response:', result)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save progress')
      }

      return result
    } catch (error) {
      console.error('Save progress error:', error)
      throw error
    }
  }
}

export const admissionApiService = new AdmissionApiService() 