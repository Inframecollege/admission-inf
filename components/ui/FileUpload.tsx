import React from 'react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  label: string
  accept: string
  required?: boolean
  file?: File
  onChange: (file: File | undefined) => void
  error?: string
  className?: string
}

export default function FileUpload({ 
  label, 
  accept, 
  required, 
  file, 
  onChange, 
  error,
  className 
}: FileUploadProps) {
  const inputId = React.useId()
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    onChange(selectedFile)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="cursor-pointer"
        >
          {file ? (
            <div className="space-y-2">
              <div className="text-green-600">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{file.name}</p>
              <p className="text-xs text-gray-500">Click to change file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-gray-400">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Click to upload {label.toLowerCase()}</p>
              <p className="text-xs text-gray-500">PDF Only (Max 5MB)</p>
            </div>
          )}
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}