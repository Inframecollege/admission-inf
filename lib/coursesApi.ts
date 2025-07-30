export interface Program {
  _id: string
  slug: string
  title: string
  parentCourseSlug: string
  parentCourseTitle: string
  duration: string
  description: string
  shortDescription: string
}

export interface Course {
  _id: string
  slug: string
  title: string
  description: string
  isActive: boolean
  programs: Program[]
}

interface CoursesResponse {
  success: boolean
  data: Course[]
}

class CoursesApiService {
  private baseURL = 'https://backend-rakj.onrender.com/api/v1'

  async getCourses(): Promise<CoursesResponse> {
    try {
      const response = await fetch(`${this.baseURL}/courses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch courses')
      }

      return result
    } catch (error) {
      console.error('Fetch courses error:', error)
      throw error
    }
  }

  // Helper function to get all active courses
  async getActiveCourses(): Promise<Course[]> {
    const response = await this.getCourses()
    return response.data.filter(course => course.isActive)
  }

  // Helper function to get all programs from all courses
  async getAllPrograms(): Promise<Program[]> {
    const courses = await this.getActiveCourses()
    const allPrograms: Program[] = []
    
    courses.forEach(course => {
      allPrograms.push(...course.programs)
    })
    
    return allPrograms
  }

  // Helper function to get programs by course slug
  async getProgramsByCourse(courseSlug: string): Promise<Program[]> {
    const courses = await this.getActiveCourses()
    const course = courses.find(c => c.slug === courseSlug)
    return course ? course.programs : []
  }
}

export const coursesApiService = new CoursesApiService() 