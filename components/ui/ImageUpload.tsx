import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { cloudinaryService } from '@/lib/cloudinary'
import { Upload, Eye, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  label: string
  accept?: string
  required?: boolean
  file?: File
  imageUrl?: string
  onChange: (file: File | undefined, imageUrl?: string) => void
  onUrlGenerated?: (url: string) => void
  error?: string
  className?: string
  folder?: string
  showPreview?: boolean
}

export default function ImageUpload({ 
  label, 
  accept = "image/*",
  required, 
  file, 
  imageUrl,
  onChange, 
  onUrlGenerated,
  error,
  className,
  folder = 'admission-portal',
  showPreview = true
}: ImageUploadProps) {
  const inputId = React.useId()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Removed unused previewUrl state
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      onChange(undefined)
      return
    }

    // Upload to Cloudinary immediately
    setIsUploading(true)
    setUploadError(null)

    try {
      const uploadResult = await cloudinaryService.uploadImage(selectedFile, folder)
      const cloudinaryUrl = uploadResult.secure_url
      onChange(selectedFile, cloudinaryUrl)
      
      // Call the onUrlGenerated callback if provided
      if (onUrlGenerated) {
        onUrlGenerated(cloudinaryUrl)
      }
    } catch (error: unknown) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      onChange(selectedFile) // Keep the file but without URL
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    onChange(undefined)
    setUploadError(null)
    // Reset input
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) input.value = ''
  }

  const displayUrl = imageUrl // Only show uploaded images, not local preview

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
          disabled={isUploading}
        />
        
        {!displayUrl ? (
          <label
            htmlFor={inputId}
            className={cn(
              "cursor-pointer block",
              isUploading && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="space-y-2">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                                  <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                <p className="text-sm text-yellow-600 font-medium">Uploading to Cloudinary...</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-8 h-8 mx-auto" />
                </div>
              )}
              <p className="text-sm text-gray-600">
                {isUploading ? '' : `Click to upload ${label.toLowerCase()}`}
              </p>
              <p className="text-xs text-gray-500">JPG, PNG, JPEG (Max 5MB)</p>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            {showPreview && displayUrl && (
              <div className="relative inline-block">
                <Image
                  src={displayUrl}
                  alt={label}
                  width={128}
                  height={128}
                  className="max-w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => window.open(displayUrl, '_blank')}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                  title="View full size"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{file?.name || 'Image uploaded'}</p>
              {imageUrl && (
                <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Successfully uploaded to Cloudinary</span>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <label
                  htmlFor={inputId}
                  className="text-sm text-yellow-600 hover:text-yellow-800 cursor-pointer"
                >
                  Change
                </label>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {imageUrl && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Cloudinary URL:</strong> {imageUrl}
        </div>
      )}
    </div>
  )
} 