// "use client"

// import { useApplication } from '@/contexts/ApplicationContext'
// import Button from '@/components/ui/Button'

// // Mock data for demonstration
// const mockApplicationData = {
//   applicationId: 'APP12345678',
//   status: 'Under Review',
//   submittedAt: '2024-01-15T10:30:00Z',
//   personalInfo: {
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john.doe@email.com',
//     phone: '9876543210',
//     dateOfBirth: '2000-05-15',
//     gender: 'male',
//     address: '123 Main Street',
//     city: 'Mumbai',
//     state: 'maharashtra',
//     pincode: '400001'
//   },
//   academicDetails: {
//     tenthBoard: 'cbse',
//     tenthPercentage: '85.5',
//     tenthYear: '2018',
//     twelfthBoard: 'cbse',
//     twelfthPercentage: '88.2',
//     twelfthYear: '2020',
//     graduationUniversity: 'Mumbai University',
//     graduationPercentage: '82.0',
//     graduationYear: '2023'
//   }
// }

// const statusColors = {
//   'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
//   'Approved': 'bg-green-100 text-green-800 border-green-200',
//   'Rejected': 'bg-red-100 text-red-800 border-red-200',
//   'Pending': 'bg-gray-100 text-gray-800 border-gray-200'
// }

// export default function ApplicationView() {
//   const { setCurrentStep } = useApplication()

//   const handleEditApplication = () => {
//     setCurrentStep('edit-continue')
//   }

//   const handleLogout = () => {
//     window.location.href = '/'
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Application</h1>
//         <p className="text-gray-600">View and manage your admission application</p>
//       </div>

//       {/* Application Status Card */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
//         <div className="flex justify-between items-start mb-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Status</h2>
//             <p className="text-sm text-gray-600">Application ID: {mockApplicationData.applicationId}</p>
//           </div>
//           <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[mockApplicationData.status as keyof typeof statusColors]}`}>
//             {mockApplicationData.status}
//           </span>
//         </div>
//         <div className="grid md:grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="font-medium text-gray-700">Submitted:</span>
//             <span className="ml-2">{formatDate(mockApplicationData.submittedAt)}</span>
//           </div>
//           <div>
//             <span className="font-medium text-gray-700">Last Updated:</span>
//             <span className="ml-2">{formatDate(mockApplicationData.submittedAt)}</span>
//           </div>
//         </div>
//       </div>

//       {/* Personal Information */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
//         <div className="grid md:grid-cols-2 gap-4 text-sm">
//           <div>
//             <span className="font-medium text-gray-700">Name:</span>
//             <span className="ml-2">{mockApplicationData.personalInfo.firstName} {mockApplicationData.personalInfo.lastName}</span>
//           </div>
//           <div>
//             <span className="font-medium text-gray-700">Email:</span>
//             <span className="ml-2">{mockApplicationData.personalInfo.email}</span>
//           </div>
//           <div>
//             <span className="font-medium text-gray-700">Phone:</span>
//             <span className="ml-2">{mockApplicationData.personalInfo.phone}</span>
//           </div>
//           <div>
//             <span className="font-medium text-gray-700">Date of Birth:</span>
//             <span className="ml-2">{mockApplicationData.personalInfo.dateOfBirth}</span>
//           </div>
//           <div>
//             <span className="font-medium text-gray-700">Gender:</span>
//             <span className="ml-2 capitalize">{mockApplicationData.personalInfo.gender}</span>
//           </div>
//           <div>
//             <span className="font-medium text-gray-700">Address:</span>
//             <span className="ml-2">
//               {mockApplicationData.personalInfo.address}, {mockApplicationData.personalInfo.city}, 
//               {mockApplicationData.personalInfo.state} - {mockApplicationData.personalInfo.pincode}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Academic Details */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Details</h2>
//         <div className="space-y-4">
//           <div className="grid md:grid-cols-3 gap-4 text-sm">
//             <div>
//               <span className="font-medium text-gray-700">10th Board:</span>
//               <span className="ml-2 uppercase">{mockApplicationData.academicDetails.tenthBoard}</span>
//             </div>
//             <div>
//               <span className="font-medium text-gray-700">10th Percentage:</span>
//               <span className="ml-2">{mockApplicationData.academicDetails.tenthPercentage}%</span>
//             </div>
//             <div>
//               <span className="font-medium text-gray-700">10th Year:</span>
//               <span className="ml-2">{mockApplicationData.academicDetails.tenthYear}</span>
//             </div>
//           </div>
//           <div className="grid md:grid-cols-3 gap-4 text-sm">
//             <div>
//               <span className="font-medium text-gray-700">12th Board:</span>
//               <span className="ml-2 uppercase">{mockApplicationData.academicDetails.twelfthBoard}</span>
//             </div>
//             <div>
//               <span className="font-medium text-gray-700">12th Percentage:</span>
//               <span className="ml-2">{mockApplicationData.academicDetails.twelfthPercentage}%</span>
//             </div>
//             <div>
//               <span className="font-medium text-gray-700">12th Year:</span>
//               <span className="ml-2">{mockApplicationData.academicDetails.twelfthYear}</span>
//             </div>
//           </div>
//           {mockApplicationData.academicDetails.graduationUniversity && (
//             <div className="grid md:grid-cols-3 gap-4 text-sm">
//               <div>
//                 <span className="font-medium text-gray-700">Graduation:</span>
//                 <span className="ml-2">{mockApplicationData.academicDetails.graduationUniversity}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Graduation %:</span>
//                 <span className="ml-2">{mockApplicationData.academicDetails.graduationPercentage}%</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Graduation Year:</span>
//                 <span className="ml-2">{mockApplicationData.academicDetails.graduationYear}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Documents Status */}
//       <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents Status</h2>
//         <div className="grid md:grid-cols-2 gap-4 text-sm">
//           <div className="flex items-center space-x-2">
//             <span className="text-green-600">✓</span>
//             <span>10th Grade Marksheet</span>
//             <span className="text-green-600 text-xs">Verified</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-green-600">✓</span>
//             <span>12th Grade Marksheet</span>
//             <span className="text-green-600 text-xs">Verified</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-green-600">✓</span>
//             <span>Graduation Marksheet</span>
//             <span className="text-yellow-600 text-xs">Under Review</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-green-600">✓</span>
//             <span>Photo</span>
//             <span className="text-green-600 text-xs">Verified</span>
//           </div>
//           <div className="flex items-center space-x-2">
//             <span className="text-green-600">✓</span>
//             <span>Signature</span>
//             <span className="text-green-600 text-xs">Verified</span>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 justify-between">
//         <div className="flex gap-4">
//           <Button onClick={handleEditApplication}>
//             Edit Application
//           </Button>
//           <Button variant="outline">
//             Download Application
//           </Button>
//         </div>
//         <Button variant="ghost" onClick={handleLogout}>
//           Logout
//         </Button>
//       </div>
//     </div>
//   )
// }
