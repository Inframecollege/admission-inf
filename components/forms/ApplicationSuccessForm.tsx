"use client"

import { useApplication } from '@/contexts/ApplicationContext'
import Button from '@/components/ui/Button'
import { downloadApplicationPDF } from '@/utils/pdfGenerator'
import { Download, CheckCircle, Home } from 'lucide-react'

export default function ApplicationSuccessForm() {
  const { applicationData, resetApplication, setUserType, setCurrentStep } = useApplication()

  // Use existing application ID from context
  const applicationId = applicationData.applicationId || 'APP00000000'

  const handleDownloadPDF = async () => {
    try {
      await downloadApplicationPDF(applicationData, applicationId)
    } catch (error) {
      console.error('Failed to download PDF:', error)
      // You could add a toast notification here if needed
    }
  }

  const handleGoHome = () => {
    // Reset application data and start fresh
    resetApplication()
    setUserType('new')
    setCurrentStep('personal-info')
  }

  // Get payment method display text
  const getPaymentMethodText = () => {
    if (!applicationData.paymentDetails?.paymentOption) {
      return 'Online Payment'
    }

    switch (applicationData.paymentDetails.paymentOption) {
      case 'application':
        return 'Application Fee Only (Online)'
      case 'course':
        return 'Full Course Fee (Online)'
      case 'custom':
        return 'Custom Payment (Online)'
      default:
        return 'Online Payment'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-4">
            Application Submitted Successfully!
          </h1>
          
          <p className="text-green-700 mb-6 text-sm sm:text-base">
            Your application has been submitted successfully. You will receive a confirmation email shortly.
          </p>

          {/* Application ID */}
          <div className="bg-white p-4 sm:p-6 rounded-lg border border-green-200 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Application ID</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-gray-900 mb-4">
              {applicationId}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              This ID was generated during the review process. Keep it safe for future reference.
            </p>
          </div>

          {/* Application Summary */}
          <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-yellow-200 mb-6 text-left">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Application Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-yellow-700">Name:</span>
                <span className="ml-2 text-yellow-900">
                  {applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-yellow-700">Email:</span>
                <span className="ml-2 text-yellow-900">{applicationData.personalInfo.email}</span>
              </div>
              
              <div>
                <span className="font-medium text-yellow-700">Program:</span>
                <span className="ml-2 text-yellow-900 capitalize">
                  {(applicationData.programSelection.specialization || '').replace('-', ' ')}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-yellow-700">Campus:</span>
                <span className="ml-2 text-yellow-900 capitalize">
                  {applicationData.programSelection.campus.replace('-', ' ')}
                </span>
              </div>

              {applicationData.paymentDetails && (
                <>
                  <div>
                    <span className="font-medium text-yellow-700">Payment Method:</span>
                    <span className="ml-2 text-yellow-900">
                      {getPaymentMethodText()}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-yellow-700">Payment ID:</span>
                    <span className="ml-2 text-yellow-900 font-mono text-xs">
                      {applicationData.paymentDetails.paymentId}
                    </span>
                  </div>

                  <div>
                    <span className="font-medium text-yellow-700">Amount Paid:</span>
                    <span className="ml-2 text-yellow-900">
                      {applicationData.paymentDetails.paymentOption === 'application'
                        ? `₹${applicationData.paymentDetails.amount.toLocaleString()} (Application Fee)`
                        : applicationData.paymentDetails.paymentOption === 'course'
                        ? `₹${applicationData.paymentDetails.amount.toLocaleString()} (Full Course Fee)`
                        : applicationData.paymentDetails.paymentOption === 'custom'
                        ? `₹${applicationData.paymentDetails.amount.toLocaleString()} (Custom Payment)`
                        : `₹${applicationData.paymentDetails.amount.toLocaleString()}`
                      }
                    </span>
                  </div>

                  {applicationData.paymentDetails.paymentOption === 'custom' && applicationData.paymentDetails.remainingAmount && applicationData.paymentDetails.remainingAmount > 0 && (
                    <div className="col-span-2">
                      <span className="font-medium text-orange-700">Remaining Balance:</span>
                      <span className="ml-2 text-orange-900">
                        ₹{applicationData.paymentDetails.remainingAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Contact Information - Moved up for better visibility */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Admission Office:</span>
                <br />
                <span>Phone: +91 98765 43210</span>
                <br />
                <span>Email: admissions@inframe.edu.in</span>
              </div>
              <div>
                <span className="font-medium">Office Hours:</span>
                <br />
                <span>Monday - Saturday: 9:00 AM - 6:00 PM</span>
                <br />
                <span>Sunday: Closed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleDownloadPDF}
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Application PDF Again
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              New Application
            </Button>
          </div>

          {/* Next Steps */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mt-6 text-left">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Next Steps</h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>You will receive a confirmation email within 24 hours</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Keep your Application ID safe for future reference</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Your application PDF was available for download during the review process</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Admission results will be communicated via email and SMS</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>For any queries, contact our admission office with your Application ID</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
