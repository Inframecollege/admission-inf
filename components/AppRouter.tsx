"use client"

import { useApplication } from '@/contexts/ApplicationContext'
import LandingPage from '@/components/LandingPage'
import Sidebar from '@/components/Sidebar'
import NewApplicant from '@/components/NewApplicant'

export default function AppRouter() {
  const { userType, isInitialized } = useApplication()

  // Show loading until initialization is complete
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user type is set, show landing page with login/register
  if (!userType) {
    return <LandingPage />
  }

  // If user is authenticated, show the application with sidebar
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:ml-64">
        <NewApplicant />
      </main>
    </div>
  )
}
