interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
}

interface CloudinaryConfig {
  cloudName: string
  uploadPreset: string
}

class CloudinaryService {
  private config: CloudinaryConfig

  constructor() {
    // You'll need to set these environment variables
    this.config = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset'
    }
  }

  async uploadImage(file: File, folder: string = 'admission-portal'): Promise<CloudinaryUploadResponse> {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.config.uploadPreset)
      formData.append('folder', folder)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Upload failed')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  }

  async uploadMultipleImages(files: File[], folder: string = 'admission-portal'): Promise<CloudinaryUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder))
    return Promise.all(uploadPromises)
  }

  // Helper function to get image URL with transformations
  getImageUrl(publicId: string, transformations: string = ''): string {
    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transformations}/${publicId}`
  }

  // Helper function to get optimized image URL
  getOptimizedImageUrl(publicId: string, width: number = 800, quality: number = 80): string {
    return this.getImageUrl(publicId, `f_auto,q_${quality},w_${width}`)
  }
}

export const cloudinaryService = new CloudinaryService() 