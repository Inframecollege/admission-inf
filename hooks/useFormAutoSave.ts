import { useEffect, useCallback, useRef } from 'react'
import { useApplication } from '@/contexts/ApplicationContext'

interface UseFormAutoSaveOptions {
  stepName: string
  formData: Record<string, unknown>
  enabled?: boolean
  debounceMs?: number
}

export const useFormAutoSave = ({
  stepName,
  formData,
  enabled = true,
  debounceMs = 1000
}: UseFormAutoSaveOptions) => {
  const { saveFormProgress, getFormProgress } = useApplication()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string>('')

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const currentDataString = JSON.stringify(formData)
      
      // Only save if data has actually changed
      if (currentDataString !== previousDataRef.current && enabled) {
        saveFormProgress(stepName, formData)
        previousDataRef.current = currentDataString
        console.log(`Auto-saved form progress for ${stepName}`)
      }
    }, debounceMs)
  }, [formData, stepName, enabled, debounceMs, saveFormProgress])

  // Auto-save when form data changes
  useEffect(() => {
    if (enabled && Object.keys(formData).length > 0) {
      debouncedSave()
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [formData, enabled, debouncedSave])

  // Load saved progress
  const loadSavedProgress = useCallback(() => {
    const savedData = getFormProgress(stepName)
    return savedData || {}
  }, [stepName, getFormProgress])

  // Check if there's saved data for this step
  const hasSavedProgress = useCallback(() => {
    const savedData = getFormProgress(stepName)
    return savedData && Object.keys(savedData).length > 0
  }, [stepName, getFormProgress])

  // Manual save function
  const saveNow = useCallback(() => {
    if (enabled) {
      saveFormProgress(stepName, formData)
      previousDataRef.current = JSON.stringify(formData)
    }
  }, [formData, stepName, enabled, saveFormProgress])

  return {
    loadSavedProgress,
    hasSavedProgress,
    saveNow
  }
}

// Hook for showing saved data notification
export const useSavedDataNotification = (stepName: string) => {
  const { getFormProgress } = useApplication()

  const checkForSavedData = useCallback(() => {
    const savedData = getFormProgress(stepName)
    return {
      hasSavedData: !!(savedData && Object.keys(savedData).length > 0),
      savedData: savedData || {}
    }
  }, [stepName, getFormProgress])

  return checkForSavedData
}
