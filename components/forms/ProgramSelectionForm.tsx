"use client"

import { useState, useEffect, useMemo } from 'react'
import { useApplication } from '@/contexts/ApplicationContext'
import { ProgramSelection } from '@/types/application'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Phone, GraduationCap, Clock, MapPin, Loader2 } from 'lucide-react'
import { admissionApiService } from '@/lib/admissionApi'
import { cookieStorage } from '@/lib/cookieStorage'
import { coursesApiService } from '@/lib/coursesApi'
import type { Course, Program } from '@/lib/coursesApi'

// Campus options - you can make this dynamic too if needed
const CAMPUS_OPTIONS = [
  { value: 'main-campus', label: 'Main Campus' },
  { value: 'north-campus', label: 'North Campus' },
  { value: 'south-campus', label: 'South Campus' },
  { value: 'online', label: 'Online' }
]

export default function ProgramSelectionForm() {
  const { applicationData, updateApplicationData, setCurrentStep } = useApplication()
  const [errors, setErrors] = useState<Partial<ProgramSelection>>({})
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  // Create a default program selection object with proper typing
  const defaultProgramSelection = useMemo(() => ({
    programType: '',
    programCategory: '',
    programName: '',
    campus: ''
  }), []);

  // Initialize program selection if not already set
  useEffect(() => {
    if (!applicationData.programSelection) {
      updateApplicationData({
        programSelection: defaultProgramSelection
      })
    }
  }, [applicationData, updateApplicationData, defaultProgramSelection])

  // Fetch courses and programs from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        setApiError(null)
        const response = await coursesApiService.getCourses()
        console.log('API Response:', response)
        const activeCourses = response.data.filter(course => course.isActive)
        console.log('Active courses:', activeCourses)
        setCourses(activeCourses)
      } catch (error: unknown) {
        console.error('Failed to fetch courses:', error)
        setApiError(error instanceof Error ? error.message : 'Failed to load courses')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const programSelection = applicationData.programSelection || defaultProgramSelection

  // Get course options from API
  const courseOptions = courses.map(course => ({
    value: course.slug,
    label: course.title
  }))
  
  console.log('Course options:', courseOptions)

  // Get program options based on selected course
  const programOptions = useMemo(() => {
    if (!programSelection.programType) return []
    
    const selectedCourse = courses.find(course => course.slug === programSelection.programType)
    if (!selectedCourse) {
      console.log('Selected course not found:', programSelection.programType)
      console.log('Available courses:', courses.map(c => ({ slug: c.slug, title: c.title })))
      return []
    }
    
    console.log('Selected course:', selectedCourse.title)
    console.log('Programs in course:', selectedCourse.programs)
    
    console.log('All programs:', selectedCourse.programs)
    
    return selectedCourse.programs.map((program: Program) => ({
      value: program.slug,
      label: program.title
    }))
  }, [programSelection.programType, courses])

  // Removed unused campusOptions variable

  const handleSelectChange = (field: keyof ProgramSelection, value: string) => {
    // Create a new object with the updated field
    const updatedSelection: ProgramSelection = {
      ...programSelection,
      [field]: value
    }

    // Reset dependent fields when parent field changes
    if (field === 'programType') {
      updatedSelection.programName = ''
      setSelectedProgram(null)
    } else if (field === 'programName') {
      // Find and set the selected program
      const selectedCourse = courses.find(course => course.slug === programSelection.programType)
      if (selectedCourse) {
        const program = selectedCourse.programs.find((program: Program) => program.slug === value)
        setSelectedProgram(program || null)
      }
    }

    // Update application data
    updateApplicationData({
      programSelection: updatedSelection
    })

    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProgramSelection> = {}

    if (!programSelection.programType) newErrors.programType = 'Course is required'
    if (!programSelection.programName) newErrors.programName = 'Program is required'
    if (!programSelection.campus) newErrors.campus = 'Campus is required'

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

      // Update program selection with additional details from selected program
      const updatedProgramSelection = {
        ...programSelection,
        programId: selectedProgram?._id || '',
        programSlug: selectedProgram?.slug || '',
        courseSlug: selectedProgram?.parentCourseSlug || '',
        duration: selectedProgram?.duration || '',
        description: selectedProgram?.description || ''
      }

      // Update application data with enhanced program selection
      updateApplicationData({
        programSelection: updatedProgramSelection
      })

      // Save progress to API
      await admissionApiService.saveProgress(admissionFormId, {
        ...applicationData,
        programSelection: updatedProgramSelection
      })
      
      // Move to next step
      setCurrentStep('review')
    } catch (error: unknown) {
      console.error('Failed to save progress:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save progress. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    setCurrentStep('academic-details')
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading courses and programs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Courses</h2>
          <p className="text-red-700">{apiError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Program Selection</h1>
        <p className="text-sm sm:text-base text-gray-600">Choose your preferred course and program.</p>
        
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* Inline Helpline */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm text-purple-900 font-medium">Confused about program selection?</span>
            </div>
            <a
              href="tel:+919876543210"
              className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
              Call +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Program Selection Container */}
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Program Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Select
              label="Course"
              options={courseOptions}
              value={programSelection.programType}
              onChange={(e) => handleSelectChange('programType', e.target.value)}
              error={errors.programType}
              placeholder="Select course"
              required
            />

            <Select
              label="Program"
              options={programOptions}
              value={programSelection.programName}
              onChange={(e) => handleSelectChange('programName', e.target.value)}
              error={errors.programName}
              placeholder="Select program"
              disabled={!programSelection.programType}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <Select
              label="Campus"
              options={CAMPUS_OPTIONS}
              value={programSelection.campus}
              onChange={(e) => handleSelectChange('campus', e.target.value)}
              error={errors.campus}
              placeholder="Select campus"
              required
            />
          </div>
        </div>

        {/* Selected Program Details */}
        {selectedProgram && (
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Program Details</h3>

            {/* Program Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Program Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Program:</span>
                  <span className="text-gray-900">{selectedProgram.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="text-gray-900">{selectedProgram.duration} years</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-700">Course:</span>
                  <span className="text-gray-900">{selectedProgram.parentCourseTitle}</span>
                </div>

                {programSelection.campus && (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 text-green-600">🏫</span>
                    <span className="font-medium text-gray-700">Campus:</span>
                    <span className="text-gray-900 capitalize">{programSelection.campus.replace('-', ' ')}</span>
                  </div>
                )}
              </div>

              {/* Program Description */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3">Program Description</h4>
                <p className="text-sm text-gray-700 mb-3">{selectedProgram.description}</p>
                
                {selectedProgram.shortDescription && (
                  <div className="text-xs text-gray-600 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium mb-1">Short Description:</p>
                    <p>{selectedProgram.shortDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 sm:pt-6">
          <Button type="button" variant="outline" onClick={handleBack} className="w-full sm:w-auto">
            ← Back
          </Button>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Next: Review Details →'}
          </Button>
        </div>
      </form>
    </div>
  )
}




