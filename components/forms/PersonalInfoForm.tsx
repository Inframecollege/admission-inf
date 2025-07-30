"use client"

import { useState, useEffect } from 'react'
import { useApplication } from '@/contexts/ApplicationContext'
import { PersonalInfo } from '@/types/application'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'
import { useFormAutoSave, useSavedDataNotification } from '@/hooks/useFormAutoSave'
import SavedDataNotification, { AutoSaveIndicator } from '@/components/ui/SavedDataNotification'
import { getStateOptions, getCityOptions } from '@/constants/stateCityMapping'
import { admissionApiService } from '@/lib/admissionApi'
import { cookieStorage } from '@/lib/cookieStorage'

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

const religionOptions = [
  { value: 'hinduism', label: 'Hinduism' },
  { value: 'islam', label: 'Islam' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'sikhism', label: 'Sikhism' },
  { value: 'buddhism', label: 'Buddhism' },
  { value: 'jainism', label: 'Jainism' },
  { value: 'judaism', label: 'Judaism' },
  { value: 'other', label: 'Other' }
]

// Get state options from the mapping
const stateOptions = getStateOptions()

const qualificationOptions = [
  { value: 'below-10th', label: 'Below 10th' },
  { value: '10th', label: '10th Pass' },
  { value: '12th', label: '12th Pass' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'post-graduation', label: 'Post Graduation' },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' }
]

const occupationOptions = [
  { value: 'government-service', label: 'Government Service' },
  { value: 'private-service', label: 'Private Service' },
  { value: 'business', label: 'Business' },
  { value: 'farming', label: 'Farming' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' }
]

const relationOptions = [
  { value: 'uncle', label: 'Uncle' },
  { value: 'aunt', label: 'Aunt' },
  { value: 'grandfather', label: 'Grandfather' },
  { value: 'grandmother', label: 'Grandmother' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'family-friend', label: 'Family Friend' },
  { value: 'other', label: 'Other' }
]

interface PersonalInfoErrors {
  // Student Personal Details
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  religion?: string
  aadharNumber?: string
  permanentAddress?: string
  temporaryAddress?: string
  city?: string
  state?: string
  pincode?: string

  // Guardian Details (Parents)
  fathersName?: string
  fathersPhone?: string
  fathersOccupation?: string
  fathersQualification?: string
  mothersName?: string
  mothersPhone?: string
  mothersOccupation?: string
  mothersQualification?: string
  parentsAddress?: string

  // Local Guardian Details (Optional)
  localGuardianName?: string
  localGuardianPhone?: string
  localGuardianOccupation?: string
  localGuardianRelation?: string
  localGuardianAddress?: string

  // Documents
  profilePhoto?: string
  signature?: string
  aadharCard?: string
  randomDocuments?: string
}

export default function PersonalInfoForm() {
  const { applicationData, updateApplicationData, setCurrentStep } = useApplication()
  const [errors, setErrors] = useState<PersonalInfoErrors>({})
  const [cityOptions, setCityOptions] = useState<{ value: string; label: string }[]>([])

  const [showSavedDataNotification, setShowSavedDataNotification] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Auto-save functionality
  const { loadSavedProgress } = useFormAutoSave({
    stepName: 'personal-info',
    formData: applicationData.personalInfo as unknown as Record<string, unknown>,
    enabled: true,
    debounceMs: 2000 // Save after 2 seconds of inactivity
  })

  const checkForSavedData = useSavedDataNotification('personal-info')

  // Check for saved data on component mount
  useEffect(() => {
    const { hasSavedData } = checkForSavedData()
    if (hasSavedData) {
      setShowSavedDataNotification(true)
    }
  }, [checkForSavedData])

  // Update city options when state changes
  useEffect(() => {
    if (applicationData.personalInfo.state) {
      const cities = getCityOptions(applicationData.personalInfo.state)
      setCityOptions(cities)
    } else {
      setCityOptions([])
    }
  }, [applicationData.personalInfo.state])

  // Handle restoring saved data
  const handleRestoreSavedData = () => {
    const savedData = loadSavedProgress()
    if (savedData && Object.keys(savedData).length > 0) {
      updateApplicationData({
        personalInfo: {
          ...applicationData.personalInfo,
          ...savedData
        }
      })
      setLastSaved(new Date())
    }
    setShowSavedDataNotification(false)
  }

  const validateForm = (): boolean => {
    const newErrors: PersonalInfoErrors = {}
    const { personalInfo } = applicationData

    // Student Personal Details
    if (!personalInfo.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!personalInfo.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!personalInfo.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) newErrors.email = 'Email is invalid'
    if (!personalInfo.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(personalInfo.phone)) newErrors.phone = 'Phone number must be 10 digits'
    if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!personalInfo.gender) newErrors.gender = 'Gender is required'
    if (!personalInfo.religion) newErrors.religion = 'Religion is required'
    if (!personalInfo.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhar number is required'
    else if (!/^\d{12}$/.test(personalInfo.aadharNumber)) newErrors.aadharNumber = 'Aadhar number must be 12 digits'
    if (!personalInfo.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent address is required'
    if (!personalInfo.city.trim()) newErrors.city = 'City is required'
    if (!personalInfo.state) newErrors.state = 'State is required'
    if (!personalInfo.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(personalInfo.pincode)) newErrors.pincode = 'Pincode must be 6 digits'

    // Guardian Details (Parents)
    if (!personalInfo.fathersName.trim()) newErrors.fathersName = 'Father\'s name is required'
    if (!personalInfo.fathersPhone.trim()) newErrors.fathersPhone = 'Father\'s phone is required'
    else if (!/^\d{10}$/.test(personalInfo.fathersPhone)) newErrors.fathersPhone = 'Phone number must be 10 digits'
    if (!personalInfo.fathersOccupation) newErrors.fathersOccupation = 'Father\'s occupation is required'
    if (!personalInfo.fathersQualification) newErrors.fathersQualification = 'Father\'s qualification is required'
    if (!personalInfo.mothersName.trim()) newErrors.mothersName = 'Mother\'s name is required'
    if (!personalInfo.mothersPhone.trim()) newErrors.mothersPhone = 'Mother\'s phone is required'
    else if (!/^\d{10}$/.test(personalInfo.mothersPhone)) newErrors.mothersPhone = 'Phone number must be 10 digits'
    if (!personalInfo.mothersOccupation) newErrors.mothersOccupation = 'Mother\'s occupation is required'
    if (!personalInfo.mothersQualification) newErrors.mothersQualification = 'Mother\'s qualification is required'

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

      // Debug: Log the current application data
      // console.log('Current application data before save:', applicationData)
      // console.log('Personal info image URLs:', {
      //   aadharCardUrl: applicationData.personalInfo.aadharCardUrl,
      //   profilePhotoUrl: applicationData.personalInfo.profilePhotoUrl,
      //   signatureUrl: applicationData.personalInfo.signatureUrl,
      // })

      // Save progress to API
      await admissionApiService.saveProgress(admissionFormId, applicationData)
      
      // Move to next step
      setCurrentStep('academic-details')
    } catch (error: unknown) {
      console.error('Failed to save progress:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    const updatedPersonalInfo = {
      ...applicationData.personalInfo,
      [field]: value
    }

    // If state is changed, clear the city field
    if (field === 'state') {
      updatedPersonalInfo.city = ''
    }

    updateApplicationData({
      personalInfo: updatedPersonalInfo
    })

    // Clear error when user starts typing
    if (errors[field as keyof PersonalInfoErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Clear city error when state changes
    if (field === 'state' && errors.city) {
      setErrors(prev => ({ ...prev, city: undefined }))
    }
  }

  const handleImageChange = (field: 'aadharCard' | 'profilePhoto' | 'signature', file: File | undefined, imageUrl?: string) => {
    // console.log(`Image change for ${field}:`, { file, imageUrl })
    
    updateApplicationData({
      personalInfo: {
        ...applicationData.personalInfo,
        [field]: file,
        [`${field}Url`]: imageUrl
      }
    })
    
    // Clear error when user uploads a file
    if (file && errors[field as keyof PersonalInfoErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAadharUrlGenerated = (url: string) => {
    // Automatically populate a text field with the uploaded URL
    // You can modify this to populate any field you want
    console.log('Aadhar card uploaded to:', url)
    
    // Example: If you want to populate a custom field with the URL
    // updateApplicationData({
    //   personalInfo: {
    //     ...applicationData.personalInfo,
    //     customField: url
    //   }
    // })
  }

  const { personalInfo } = applicationData

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Saved Data Notification */}
      <SavedDataNotification
        show={showSavedDataNotification}
        onRestore={handleRestoreSavedData}
        onDismiss={() => setShowSavedDataNotification(false)}
        stepName="Personal Information"
        savedDataCount={Object.keys(loadSavedProgress()).length}
      />

      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Personal Information</h1>
            <p className="text-sm sm:text-base text-gray-600">Please fill in your personal details accurately.</p>
            
            {saveError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{saveError}</p>
              </div>
            )}
          </div>
          {/* Auto-save indicator */}
          <AutoSaveIndicator
            lastSaved={lastSaved}
            className="hidden sm:block"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Personal Details */}
        <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Personal Details</h2>

          {/* Student Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="First Name"
              value={personalInfo.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={errors.firstName}
              required
            />
            <Input
              label="Last Name"
              value={personalInfo.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Input
              label="Email Address"
              type="email"
              value={personalInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="10-digit mobile number"
              required
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Input
              label="Date of Birth"
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              error={errors.dateOfBirth}
              required
            />
            <Select
              label="Gender"
              value={personalInfo.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              options={genderOptions}
              error={errors.gender}
              placeholder="Select gender"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Select
              label="Religion"
              value={personalInfo.religion}
              onChange={(e) => handleInputChange('religion', e.target.value)}
              options={religionOptions}
              error={errors.religion}
              placeholder="Select religion"
              required
            />
            <Input
              label="Aadhar Number"
              value={personalInfo.aadharNumber}
              onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
              error={errors.aadharNumber}
              placeholder="12-digit Aadhar number"
              maxLength={12}
              required
            />
          </div>

          {/* Aadhar Card Upload */}
          <div className="mt-4 sm:mt-6">
            <ImageUpload
              label="Aadhar Card"
              accept=".jpg,.jpeg,.png"
              file={personalInfo.aadharCard}
              imageUrl={personalInfo.aadharCardUrl}
              onChange={(file, imageUrl) => handleImageChange('aadharCard', file, imageUrl)}
              onUrlGenerated={handleAadharUrlGenerated}
              error={errors.aadharCard}
              required
              folder="admission-portal/aadhar-cards"
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permanent Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={personalInfo.permanentAddress}
                onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                rows={3}
                placeholder="Permanent address"
                required
              />
              {errors.permanentAddress && <p className="text-sm text-red-600">{errors.permanentAddress}</p>}
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Address
              </label>
              <textarea
                value={personalInfo.temporaryAddress}
                onChange={(e) => handleInputChange('temporaryAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                rows={3}
                placeholder="Temporary address (if different from permanent)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Select
              label="City"
              value={personalInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              options={cityOptions}
              error={errors.city}
              placeholder={personalInfo.state ? "Select city" : "Select state first"}
              disabled={!personalInfo.state || cityOptions.length === 0}
              required
            />
            <Select
              label="State"
              value={personalInfo.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              options={stateOptions}
              error={errors.state}
              placeholder="Select state"
              required
            />
            <Input
              label="Pincode"
              value={personalInfo.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              error={errors.pincode}
              placeholder="6-digit pincode"
              required
            />
          </div>
        </div>

        {/* Guardian Details (Parents) */}
        <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Guardian Details (Parents)</h2>

          {/* Father's Details */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Father&apos;s Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Father's Name"
                value={personalInfo.fathersName}
                onChange={(e) => handleInputChange('fathersName', e.target.value)}
                error={errors.fathersName}
                required
              />
              <Input
                label="Father's Phone Number"
                type="tel"
                value={personalInfo.fathersPhone}
                onChange={(e) => handleInputChange('fathersPhone', e.target.value)}
                error={errors.fathersPhone}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
              <Select
                label="Father's Occupation"
                value={personalInfo.fathersOccupation}
                onChange={(e) => handleInputChange('fathersOccupation', e.target.value)}
                options={occupationOptions}
                error={errors.fathersOccupation}
                placeholder="Select occupation"
                required
              />
              <Select
                label="Father's Qualification"
                value={personalInfo.fathersQualification}
                onChange={(e) => handleInputChange('fathersQualification', e.target.value)}
                options={qualificationOptions}
                error={errors.fathersQualification}
                placeholder="Select qualification"
                required
              />
            </div>
          </div>

          {/* Mother's Details */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-800 mb-3">Mother&apos;s Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Mother's Name"
                value={personalInfo.mothersName}
                onChange={(e) => handleInputChange('mothersName', e.target.value)}
                error={errors.mothersName}
                required
              />
              <Input
                label="Mother's Phone Number"
                type="tel"
                value={personalInfo.mothersPhone}
                onChange={(e) => handleInputChange('mothersPhone', e.target.value)}
                error={errors.mothersPhone}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
              <Select
                label="Mother's Occupation"
                value={personalInfo.mothersOccupation}
                onChange={(e) => handleInputChange('mothersOccupation', e.target.value)}
                options={occupationOptions}
                error={errors.mothersOccupation}
                placeholder="Select occupation"
                required
              />
              <Select
                label="Mother's Qualification"
                value={personalInfo.mothersQualification}
                onChange={(e) => handleInputChange('mothersQualification', e.target.value)}
                options={qualificationOptions}
                error={errors.mothersQualification}
                placeholder="Select qualification"
                required
              />
            </div>
          </div>

          {/* Parents Additional Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
            <div></div>
            <div></div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parents Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={personalInfo.parentsAddress}
              onChange={(e) => handleInputChange('parentsAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={3}
              placeholder="Parents address"
              required
            />
            {errors.parentsAddress && <p className="text-sm text-red-600">{errors.parentsAddress}</p>}
          </div>
        </div>

        {/* Local Guardian Details (Optional) */}
        <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Local Guardian Details</h2>
          <p className="text-sm text-gray-600 mb-4">(Optional - Fill if you have a local guardian)</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Local Guardian Name"
              value={personalInfo.localGuardianName || ''}
              onChange={(e) => handleInputChange('localGuardianName', e.target.value)}
              error={errors.localGuardianName}
              placeholder="Local guardian name"
            />
            <Input
              label="Local Guardian Phone"
              type="tel"
              value={personalInfo.localGuardianPhone || ''}
              onChange={(e) => handleInputChange('localGuardianPhone', e.target.value)}
              error={errors.localGuardianPhone}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
            <Select
              label="Local Guardian Occupation"
              value={personalInfo.localGuardianOccupation || ''}
              onChange={(e) => handleInputChange('localGuardianOccupation', e.target.value)}
              options={occupationOptions}
              error={errors.localGuardianOccupation}
              placeholder="Select occupation"
            />
            <Select
              label="Relation with Local Guardian"
              value={personalInfo.localGuardianRelation || ''}
              onChange={(e) => handleInputChange('localGuardianRelation', e.target.value)}
              options={relationOptions}
              error={errors.localGuardianRelation}
              placeholder="Select relation"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local Guardian Address
            </label>
            <textarea
              value={personalInfo.localGuardianAddress || ''}
              onChange={(e) => handleInputChange('localGuardianAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows={3}
              placeholder="Local guardian address"
            />
            {errors.localGuardianAddress && <p className="text-sm text-red-600">{errors.localGuardianAddress}</p>}
          </div>
        </div>

        <div className="flex justify-center sm:justify-end pt-4 sm:pt-6">
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Next: Academic Details →'}
          </Button>
        </div>
      </form>
    </div>
  )
}