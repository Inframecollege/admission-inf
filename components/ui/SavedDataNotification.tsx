"use client"

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, X, RotateCcw } from 'lucide-react'
import Button from './Button'

interface SavedDataNotificationProps {
  show: boolean
  onRestore: () => void
  onDismiss: () => void
  stepName: string
  savedDataCount?: number
}

export default function SavedDataNotification({
  show,
  onRestore,
  onDismiss,
  stepName,
  savedDataCount = 0
}: SavedDataNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    }
  }, [show])

  const handleRestore = () => {
    onRestore()
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Allow animation to complete
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Allow animation to complete
  }

  if (!show) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Saved Data Found
            </h3>
            <p className="mt-1 text-xs text-yellow-700">
              We found previously saved data for the {stepName} step
              {savedDataCount > 0 && ` (${savedDataCount} fields)`}.
              Would you like to restore it?
            </p>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={handleRestore}
                className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Continue Fresh
              </Button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="bg-yellow-50 rounded-md inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Auto-save indicator component
interface AutoSaveIndicatorProps {
  isSaving?: boolean
  lastSaved?: Date | null
  className?: string
}

export function AutoSaveIndicator({ 
  isSaving = false, 
  lastSaved = null, 
  className = "" 
}: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSaved(true)
      const timer = setTimeout(() => setShowSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSaved, isSaving])

  if (!isSaving && !showSaved) return null

  return (
    <div className={`flex items-center text-xs ${className}`}>
      {isSaving ? (
        <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-500 mr-2"></div>
        <span className="text-yellow-600">Saving...</span>
        </>
      ) : showSaved ? (
        <>
          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
          <span className="text-green-600">
            Saved {lastSaved ? new Date(lastSaved).toLocaleTimeString() : ''}
          </span>
        </>
      ) : null}
    </div>
  )
}

// Progress restoration banner
interface ProgressRestorationBannerProps {
  show: boolean
  onRestore: () => void
  onDismiss: () => void
  currentStep: string
  savedStep: string
}

export function ProgressRestorationBanner({
  show,
  onRestore,
  onDismiss,
  savedStep
}: ProgressRestorationBannerProps) {
  if (!show) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <strong>Previous session found!</strong> You were last working on the{' '}
            <span className="font-medium">{savedStep}</span> step. 
            Would you like to continue from where you left off?
          </p>
          <div className="mt-3 flex space-x-3">
            <Button
              size="sm"
              onClick={onRestore}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Continue Previous Session
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDismiss}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Start Fresh
            </Button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="bg-yellow-50 rounded-md inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
