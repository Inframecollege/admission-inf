"use client"

import { useState } from 'react'
import { Users, UserCheck, Phone, Mail, Clock } from 'lucide-react'

interface TabLayoutProps {
  children: React.ReactNode
  existingStudentPortal: React.ReactNode
}

export default function TabLayout({ children, existingStudentPortal }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Help Section - Visible on mobile only */}
      <div className="lg:hidden bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">INFRAME SCHOOL</h1>
          <a
            href="tel:+919876543210"
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
          >
            Call Now
          </a>
        </div>
        
        {/* Mobile Help Section */}
        <div className="bg-blue-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Need Help?</span>
            </div>
            <a
              href="tel:+919876543210"
              className="text-xs bg-blue-800 hover:bg-blue-900 px-2 py-1 rounded transition-colors duration-200"
            >
              Call +91 98765 43210
            </a>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-2 text-green-300" />
              <span>admissions@inframe.edu.in</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-2 text-orange-300" />
              <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Right Sidebar */}
      <div className="flex flex-1">
        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {activeTab === 'new' && (
            <div className="animate-fadeIn">
              {children}
            </div>
          )}

          {activeTab === 'existing' && (
            <div className="animate-fadeIn">
              {/* Existing Applicant Content */}
              {existingStudentPortal}
            </div>
          )}
        </main>

        {/* Right Sidebar with Vertical Tabs */}
        <aside className="w-80 bg-white border-l border-gray-200 shadow-lg hidden lg:block">
          <div className="sticky top-0 h-screen flex flex-col">
            {/* Tab Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Portal Access</h3>
              <p className="text-sm text-gray-600 mt-1">Choose your application type</p>
            </div>

            {/* Vertical Tab Navigation */}
            <nav className="p-4 space-y-3" aria-label="Tabs">
              {/* New Application Tab */}
              <button
                onClick={() => setActiveTab('new')}
                className={`${
                  activeTab === 'new'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                } w-full text-left p-4 border-2 rounded-lg transition-all duration-200 group`}
              >
                <div className="flex items-center">
                  <div className={`${
                    activeTab === 'new' ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  } p-2 rounded-lg mr-3 transition-colors duration-200`}>
                    <Users className={`h-5 w-5 ${
                      activeTab === 'new' ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">New Application</h4>
                    <p className="text-xs mt-1 opacity-75">Start your admission process</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    Apply Now
                  </span>
                  {activeTab === 'new' && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>

              {/* Existing Applicant Tab */}
              <button
                onClick={() => setActiveTab('existing')}
                className={`${
                  activeTab === 'existing'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                } w-full text-left p-4 border-2 rounded-lg transition-all duration-200 group`}
              >
                <div className="flex items-center">
                  <div className={`${
                    activeTab === 'existing' ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  } p-2 rounded-lg mr-3 transition-colors duration-200`}>
                    <UserCheck className={`h-5 w-5 ${
                      activeTab === 'existing' ? 'text-green-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Existing Applicant</h4>
                    <p className="text-xs mt-1 opacity-75">Pay application fees</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    Application Fee
                  </span>
                  {activeTab === 'existing' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
              </button>
            </nav>

            {/* Helpline and Contact Information - Moved up for better visibility */}
            <div className="px-4 pb-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Need Help?
                </h5>
                <div className="space-y-3 text-xs text-blue-800">
                  {/* Helpline Number */}
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-2 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Helpline</p>
                      <a href="tel:+919876543210" className="text-blue-600 hover:text-blue-800">
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  {/* Email Contact */}
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2 text-green-600" />
                    <div>
                      <p className="font-medium text-blue-900">Email Support</p>
                      <a href="mailto:admissions@inframe.edu.in" className="text-green-600 hover:text-green-800">
                        admissions@inframe.edu.in
                      </a>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-2 text-orange-600" />
                    <div>
                      <p className="font-medium text-blue-900">Office Hours</p>
                      <p className="text-orange-600">Mon-Sat: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Quick Contact Button */}
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <a
                    href="tel:+919876543210"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>

            {/* Tab Information - Moved to bottom */}
           
          </div>
        </aside>

        {/* Mobile Tab Navigation (visible on smaller screens) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="grid grid-cols-2">
            {/* New Application Tab - Mobile */}
            <button
              onClick={() => setActiveTab('new')}
              className={`${
                activeTab === 'new'
                  ? 'bg-blue-50 text-blue-700 border-t-2 border-blue-500'
                  : 'bg-white text-gray-600 border-t-2 border-transparent'
              } p-4 flex flex-col items-center transition-all duration-200`}
            >
              <Users className={`h-5 w-5 mb-1 ${
                activeTab === 'new' ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className="text-xs font-medium">New Application</span>
            </button>

            {/* Existing Applicant Tab - Mobile */}
            <button
              onClick={() => setActiveTab('existing')}
              className={`${
                activeTab === 'existing'
                  ? 'bg-green-50 text-green-700 border-t-2 border-green-500'
                  : 'bg-white text-gray-600 border-t-2 border-transparent'
              } p-4 flex flex-col items-center transition-all duration-200`}
            >
              <UserCheck className={`h-5 w-5 mb-1 ${
                activeTab === 'existing' ? 'text-green-600' : 'text-gray-500'
              }`} />
              <span className="text-xs font-medium">Application Fee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}