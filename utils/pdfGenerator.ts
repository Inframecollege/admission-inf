import jsPDF from 'jspdf'
import { ApplicationData } from '@/types/application'
import { getCourseById } from '@/constants'

export const generateApplicationPDF = async (applicationData: ApplicationData, applicationId: string) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Set default font
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)

  // Helper function to check if new page is needed
  const checkPageBreak = (requiredSpace: number = 50) => {
    if (yPosition > pageHeight - requiredSpace) {
      pdf.addPage()
      yPosition = 25

      // Add border to new page with safe margins
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
      return true
    }
    return false
  }

  // Helper function to add field with line separator
  const addField = (label: string, value: string, x: number, y: number, width: number = 120) => {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(label + ':', x, y)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const labelWidth = pdf.getTextWidth(label + ': ')

    // Handle long text by wrapping
    const maxValueWidth = width - labelWidth - 5
    const lines = pdf.splitTextToSize(value || '', maxValueWidth)
    let currentY = y

    lines.forEach((line: string, index: number) => {
      pdf.text(line, x + labelWidth, currentY)
      if (index < lines.length - 1) currentY += 6
    })

    // Add line separator
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.2)
    pdf.line(x, currentY + 2, x + width, currentY + 2)

    return currentY + 8
  }

  // Helper function to add two-column fields with proper spacing
  const addTwoColumnFields = (label1: string, value1: string, label2: string, value2: string, y: number) => {
    const leftX = 20
    const rightX = 105
    const fieldWidth = 75

    // Left column
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(label1 + ':', leftX, y)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const leftLabelWidth = pdf.getTextWidth(label1 + ': ')
    const leftMaxWidth = fieldWidth - leftLabelWidth - 5
    const leftLines = pdf.splitTextToSize(value1 || '', leftMaxWidth)

    let leftCurrentY = y
    leftLines.forEach((line: string, index: number) => {
      pdf.text(line, leftX + leftLabelWidth, leftCurrentY)
      if (index < leftLines.length - 1) leftCurrentY += 6
    })

    // Right column
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(label2 + ':', rightX, y)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const rightLabelWidth = pdf.getTextWidth(label2 + ': ')
    const rightMaxWidth = fieldWidth - rightLabelWidth - 5
    const rightLines = pdf.splitTextToSize(value2 || '', rightMaxWidth)

    let rightCurrentY = y
    rightLines.forEach((line: string, index: number) => {
      pdf.text(line, rightX + rightLabelWidth, rightCurrentY)
      if (index < rightLines.length - 1) rightCurrentY += 6
    })

    const maxY = Math.max(leftCurrentY, rightCurrentY)

    // Add line separators
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.2)
    pdf.line(leftX, maxY + 2, leftX + fieldWidth, maxY + 2)
    pdf.line(rightX, maxY + 2, rightX + fieldWidth, maxY + 2)

    return maxY + 8
  }

  // Helper function to add checkbox with religion selection
  const addReligionCheckbox = (religion: string, x: number, y: number, selectedReligion: string) => {
    const isSelected = selectedReligion?.toLowerCase() === religion.toLowerCase()

    // Draw checkbox
    pdf.setLineWidth(0.3)
    pdf.setDrawColor(0, 0, 0)
    pdf.rect(x, y - 2, 3, 3)

    if (isSelected) {
      // Fill the checkbox with color
      pdf.setFillColor(0, 0, 0) // Black fill
      pdf.rect(x + 0.5, y - 1.5, 2, 2, 'F') // Filled rectangle
    }

    pdf.setFontSize(8)
    pdf.text(religion, x + 6, y)
  }

  const personalInfo = applicationData.personalInfo
  const academicDetails = applicationData.academicDetails
  const programSelection = applicationData.programSelection

  // Add main border around entire form with safe margins
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.8)
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 35) // Slightly smaller height for safety

  // Header Section with School Info on Left and Photo on Right
  yPosition = 22

  // Left side - School Information with Logo
  try {
    // Fetch the logo image first
    const response = await fetch('/logo.png')
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Add the logo image
    const logoWidth = 40
    const logoHeight = 15
    pdf.addImage(uint8Array, 'PNG', 20, yPosition - 5, logoWidth, logoHeight, undefined, 'FAST')
    yPosition += logoHeight + 5
  } catch (error) {
    console.warn('Failed to add logo to PDF:', error)
    // Fallback to text if logo fails to load
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('INFRAME SCHOOL', 20, yPosition)
    yPosition += 7
  }

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text('ADMISSION FORM', 20, yPosition)

  yPosition += 6
  pdf.setFontSize(8)
  pdf.text('Email: admissions@inframe.edu.in', 20, yPosition)

  yPosition += 5
  pdf.text('Phone: +91 98765 43210', 20, yPosition)

  // Right side - Profile Photo
  const photoX = pageWidth - 45
  const photoY = 22
  const photoSize = 25

  // Check if profile photo URL exists
  if (personalInfo.profilePhotoUrl) {
    try {
      // Fetch the image data first
      const response = await fetch(personalInfo.profilePhotoUrl)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Add the profile photo to the PDF
      pdf.addImage(uint8Array, 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'FAST')
    } catch (error) {
      console.warn('Failed to add profile photo to PDF:', error)
      // Fallback to placeholder if image fails to load
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.5)
      pdf.rect(photoX, photoY, photoSize, photoSize)

      pdf.setFontSize(7)
      pdf.setTextColor(100, 100, 100)
      pdf.text('PROFILE', photoX + 3, photoY + 10)
      pdf.text('PHOTO', photoX + 5, photoY + 17)
      pdf.setTextColor(0, 0, 0)
    }
  } else {
    // Placeholder if no photo
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.5)
    pdf.rect(photoX, photoY, photoSize, photoSize)

    pdf.setFontSize(7)
    pdf.setTextColor(100, 100, 100)
    pdf.text('PROFILE', photoX + 3, photoY + 10)
    pdf.text('PHOTO', photoX + 5, photoY + 17)
    pdf.setTextColor(0, 0, 0)
  }

  // Horizontal divider after header
  yPosition = 55
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  pdf.line(20, yPosition, pageWidth - 20, yPosition)

  yPosition += 8

  // Application Form Number and Session
  yPosition = addTwoColumnFields('Application Form No', applicationId, 'Session', '2024-25', yPosition)

  // Course and Program Selection
  const selectedCourse = programSelection.programName ? getCourseById(programSelection.programName) : null
  const courseName = selectedCourse ? selectedCourse.name : (programSelection.programType || 'Bachelor of Design (B.Des)')
  yPosition = addField('Course', courseName, 20, yPosition, 170)

  yPosition += 5

  // Personal Information Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('PERSONAL INFORMATION', 20, yPosition)
  yPosition += 10

  // Name of the Applicant
  yPosition = addField('Name of the Applicant', `${personalInfo.firstName} ${personalInfo.lastName}`, 20, yPosition, 170)

  // Father's and Mother's Name
  yPosition = addTwoColumnFields("Father's Name", personalInfo.fathersName || '', "Mother's Name", personalInfo.mothersName || '', yPosition)

  // Date of Birth and Gender
  yPosition = addTwoColumnFields('Date of Birth', personalInfo.dateOfBirth || '', 'Gender', personalInfo.gender || '', yPosition)

  // Religion Section with checkbox selection
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('Religion:', 20, yPosition)

  yPosition += 6
  const religions = ['Hinduism', 'Islam', 'Sikhism', 'Christianity', 'Jainism', 'Buddhism', 'Other']
  let xPos = 20
  religions.forEach((religion, index) => {
    if (index === 4) { // Start new line after 4 religions
      yPosition += 8
      xPos = 20
    }
    addReligionCheckbox(religion, xPos, yPosition, personalInfo.religion || '')
    xPos += 30
  })

  yPosition += 12

  // Contact Information
  yPosition = addTwoColumnFields('Mobile No', personalInfo.phone || '', 'Email ID', personalInfo.email || '', yPosition)

  // Aadhar Number
  yPosition = addField('Aadhar Card No', personalInfo.aadharNumber || '', 20, yPosition, 170)

  // Addresses
  yPosition = addField('Permanent Address', personalInfo.permanentAddress || '', 20, yPosition, 170)
  yPosition = addField('Temporary Address', personalInfo.temporaryAddress || '', 20, yPosition, 170)

  yPosition += 8

  // GUARDIAN DETAILS Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('GUARDIAN DETAILS', 20, yPosition)
  yPosition += 10

  // Father's and Mother's Details in two columns
  yPosition = addTwoColumnFields("Father's Name", personalInfo.fathersName || '', "Mother's Name", personalInfo.mothersName || '', yPosition)
  yPosition = addTwoColumnFields("Father's Occupation", personalInfo.fathersOccupation || '', "Mother's Occupation", personalInfo.mothersOccupation || '', yPosition)

  // Parent's Address
  yPosition = addField("Parent's Address", personalInfo.permanentAddress || '', 20, yPosition, 170)

  // Local Guardian Details (part of Guardian Details section)
  yPosition += 5
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('LOCALGUARDIAN DETAILS', 20, yPosition)
  yPosition += 10
  yPosition = addTwoColumnFields('Local Guardian Name', personalInfo.localGuardianName || '', 'Mobile No', personalInfo.localGuardianPhone || '', yPosition)
  yPosition = addField('Local Guardian Address', personalInfo.localGuardianAddress || '', 20, yPosition, 170)

  // Check page break before Educational Details section
  checkPageBreak(120)

  // EDUCATIONAL DETAILS Section
  yPosition += 8
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('EDUCATIONAL DETAILS', 20, yPosition)
  yPosition += 10

  // Check page break before education table
  checkPageBreak(100)

  // Educational data rows - define before table height calculation
  const educationRows = [
    {
      exam: '10th',
      board: academicDetails.tenthBoard || '',
      institution: academicDetails.tenthInstitution || '',
      stream: '',
      year: academicDetails.tenthYear || '',
      percentage: academicDetails.tenthPercentage ? `${academicDetails.tenthPercentage}%` : ''
    },
    {
      exam: '12th',
      board: academicDetails.twelfthBoard || '',
      institution: academicDetails.twelfthInstitution || '',
      stream: academicDetails.twelfthStream || '',
      year: academicDetails.twelfthYear || '',
      percentage: academicDetails.twelfthPercentage ? `${academicDetails.twelfthPercentage}%` : ''
    },
    {
      exam: 'Diploma',
      board: academicDetails.diplomaInstitution || '',
      institution: '',
      stream: academicDetails.diplomaStream || '',
      year: academicDetails.diplomaYear || '',
      percentage: academicDetails.diplomaPercentage ? `${academicDetails.diplomaPercentage}%` : ''
    },
    {
      exam: 'Graduation',
      board: academicDetails.graduationUniversity || '',
      institution: '',
      stream: '',
      year: academicDetails.graduationYear || '',
      percentage: academicDetails.graduationPercentage ? `${academicDetails.graduationPercentage}%` : ''
    }
  ]

  // Educational Table with proper sizing and page break handling
  const rowHeight = 10 // Reduced row height
  const colWidths = [18, 32, 42, 32, 18, 22] // Adjusted column widths to fit better
  const headers = ['Exam', 'Board', 'Institution', 'Stream', 'Year', '%']

  // Check if we have enough space for the entire table
  const totalTableHeight = (educationRows.length + 1) * rowHeight + 20 // +1 for header, +20 for spacing
  if (yPosition + totalTableHeight > pageHeight - 60) {
    pdf.addPage()
    yPosition = 25

    // Add border to new page with safe margins
    pdf.setDrawColor(0, 0, 0)
    pdf.setLineWidth(0.8)
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
  }

  // Draw table headers
  let currentX = 20
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)

  headers.forEach((header, i) => {
    pdf.rect(currentX, yPosition, colWidths[i], rowHeight)

    pdf.setFontSize(6) // Smaller font for headers
    pdf.setFont('helvetica', 'bold')
    const textWidth = pdf.getTextWidth(header)
    const centerX = currentX + (colWidths[i] - textWidth) / 2
    pdf.text(header, centerX, yPosition + 6)

    currentX += colWidths[i]
  })

  yPosition += rowHeight

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(6) // Smaller font for table content

  educationRows.forEach((row) => {
    currentX = 20
    const rowData = [row.exam, row.board, row.institution, row.stream, row.year, row.percentage]

    rowData.forEach((data, i) => {
      pdf.rect(currentX, yPosition, colWidths[i], rowHeight)

      if (data) {
        // Fit text within cell with proper truncation
        const maxWidth = colWidths[i] - 2
        const lines = pdf.splitTextToSize(data, maxWidth)
        const displayText = lines[0] // Use first line only
        pdf.text(displayText, currentX + 1, yPosition + 6)
      }

      currentX += colWidths[i]
    })

    yPosition += rowHeight
  })

  yPosition += 10

  // Check page break before Program Selection
  checkPageBreak(80)

  // PROGRAM SELECTION Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('PROGRAM SELECTION', 20, yPosition)
  yPosition += 10

  const selectedProgramCourse = programSelection.programName ? getCourseById(programSelection.programName) : null
  const selectedCourseName = selectedProgramCourse ? selectedProgramCourse.name : (programSelection.programType || 'Not Selected')

  yPosition = addField('Selected Program', selectedCourseName, 20, yPosition, 170)
  yPosition = addField('Specialization', programSelection.specialization || '', 20, yPosition, 170)
  yPosition = addField('Campus', programSelection.campus || '', 20, yPosition, 170)

  yPosition += 8

  // Check page break before Payment Information
  checkPageBreak(80)

  // PAYMENT INFORMATION Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('PAYMENT INFORMATION', 20, yPosition)
  yPosition += 10

  // Get payment details from application data
  const paymentDetails = applicationData.paymentDetails
  const paymentMethod = paymentDetails?.paymentOption === 'application' ? 'Application Fee (Online)' :
                       paymentDetails?.paymentOption === 'course' ? 'Full Course Fee (Online)' :
                       paymentDetails?.paymentOption === 'custom' ? 'Custom Payment (Online)' : 'Not Selected'

  const applicationFee = paymentDetails?.applicationFee || selectedProgramCourse?.applicationFee || 0
  const paidAmount = paymentDetails?.amount || 0
  const remainingAmount = applicationFee - paidAmount

  yPosition = addTwoColumnFields('Payment Method', paymentMethod, 'Application Fee', `₹${applicationFee}`, yPosition)
  yPosition = addTwoColumnFields('Amount Paid', `₹${paidAmount}`, 'Remaining Amount', `₹${remainingAmount}`, yPosition)

  if (paymentDetails?.paymentId) {
    yPosition = addField('Payment ID', paymentDetails.paymentId, 20, yPosition, 170)
  }

  yPosition += 10

  // Check page break before Terms & Conditions
  checkPageBreak(100)

  // TERMS & CONDITIONS Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('TERMS & CONDITIONS', 20, yPosition)

  yPosition += 10
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')

  const terms = [
    '• The applicant must fulfill the eligibility criteria as specified in the admission guidelines.',
    '• Admission is subject to verification of all original documents during admission process.',
    '• If 12th results awaited and student doesn\'t qualified, school will not be liable for it.',
    '• The applicant must provide accurate, current, and complete information in the form.',
    '• Any misinformation or false documents will result in immediate disqualification.',
    '• The submission of the admission form does not guarantee admission.',
    '• Failure to provide required documents within stipulated time may result in rejection.',
    '• Admission is confirmed only after payment of the full admission fee as per fee structure.',
    '• The fee is non-refundable in any circumstances.',
    '• Failure to make timely payments may result in suspension or termination of enrollment.',
    '• ₹50 per day penalty will be charged for late fee payments.',
    '• The admission will be confirmed after verification of documents and payment of fees.',
    '• The institution reserves the right to revoke admission if any discrepancies are found.',
    '• Upon admission, the student agrees to abide by the rules and regulations of the institution.',
    '• Any violation of the code of conduct or disciplinary guidelines may lead to expulsion.',
    '• The information provided will be used solely for admission process and remain confidential.',
    '• The institution may use data for internal purposes like communication and announcements.',
    '• The institution reserves the right to deny admission without providing specific reasons.',
    '• The institution reserves the right to modify terms and conditions at any time.',
    '• Regular attendance and participation are mandatory for successful course completion.',
    '• Course is non-transferable and fees is not refundable in any case.',
    '• Students wishing to withdraw from the course must notify the institution in writing.',
    '• Exams would be held in different centre if approved by University & main centre.',
    '• School reserves the right to change or cancel any test center/city at its discretion.'
  ]

  terms.forEach((term) => {
    // Check if we need a new page before adding each term
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 25

      // Add border to new page with safe margins
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
    }

    const lines = pdf.splitTextToSize(term, pageWidth - 50)
    lines.forEach((line: string) => {
      // Check if we need a new page for each line
      if (yPosition > pageHeight - 35) {
        pdf.addPage()
        yPosition = 25

        // Add border to new page with safe margins
        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.8)
        pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
      }

      pdf.text(line, 20, yPosition)
      yPosition += 4 // Reduced line spacing
    })
    yPosition += 1 // Reduced spacing between terms
  })

  // Check if new page needed for signature and footer
  checkPageBreak(80)

  // Signature section
  yPosition += 15
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)

  // Two column signature layout
  pdf.text('Signature of Applicant:', 20, yPosition)
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  pdf.line(20, yPosition + 12, 75, yPosition + 12)

  pdf.text('Date:', 110, yPosition)
  pdf.line(125, yPosition + 12, 165, yPosition + 12)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.text(new Date().toLocaleDateString('en-GB'), 130, yPosition + 10)

  // Declaration
  yPosition += 20
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('DECLARATION:', 20, yPosition)

  yPosition += 6
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  const declaration = 'I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of my application.'
  const declarationLines = pdf.splitTextToSize(declaration, pageWidth - 40)
  declarationLines.forEach((line: string) => {
    // Check if we need a new page for declaration lines
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 25

      // Add border to new page with safe margins
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
    }
    pdf.text(line, 20, yPosition)
    yPosition += 5
  })

  // Ensure adequate space for footer
  checkPageBreak(45)

  // Footer - positioned at bottom with safe margin
  const footerY = pageHeight - 40
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  pdf.line(20, footerY - 3, pageWidth - 20, footerY - 3)

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('INFRAME SCHOOL', 20, footerY)

  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')
  pdf.text('D-98 Pal Link Road (Behind Kamla Nehru Hospital) Jodhpur', 20, footerY + 6)
  pdf.text('Email: admissions@inframe.edu.in | Phone: +91 98765 43210', 20, footerY + 12)
  pdf.text('www.inframeschool.com', 20, footerY + 18)

  return pdf
}

export const downloadApplicationPDF = async (applicationData: ApplicationData, applicationId: string) => {
  const pdf = await generateApplicationPDF(applicationData, applicationId)
  pdf.save(`Application_${applicationId}.pdf`)
}

export const generateExistingStudentPDF = (studentData: {
  id: string
  fullName: string
  email: string
  phone: string
  programCategory: string
  selectedProgram: string
  specialization: string
  campus: string
  admissionDate: string
  hasInitialPayment: boolean
  applicationFee: number
  paidAmount: number
  remainingAmount: number
  academicYear: string
}, paymentData?: {
  amount: number
  type: 'full' | 'partial'
  transactionId: string
  timestamp: string
}) => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Set default font
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(0, 0, 0)

  // Helper function to check if new page is needed
  const checkPageBreak = (requiredSpace: number = 50) => {
    if (yPosition > pageHeight - requiredSpace) {
      pdf.addPage()
      yPosition = 25

      // Add border to new page with safe margins
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
      return true
    }
    return false
  }

  // Helper function to add field with line separator
  const addField = (label: string, value: string, x: number, y: number, width: number = 120) => {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(label + ':', x, y)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const labelWidth = pdf.getTextWidth(label + ': ')

    // Handle long text by wrapping
    const maxValueWidth = width - labelWidth - 5
    const lines = pdf.splitTextToSize(value || '', maxValueWidth)
    let currentY = y

    lines.forEach((line: string, index: number) => {
      pdf.text(line, x + labelWidth, currentY)
      if (index < lines.length - 1) currentY += 6
    })

    // Add line separator
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.2)
    pdf.line(x, currentY + 2, x + width, currentY + 2)

    return currentY + 8
  }

  // Helper function to add two-column fields
  const addTwoColumnFields = (label1: string, value1: string, label2: string, value2: string, y: number) => {
    const leftX = 20
    const rightX = 105
    const fieldWidth = 75

    // Left column
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(label1 + ':', leftX, y)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const leftLabelWidth = pdf.getTextWidth(label1 + ': ')
    const leftMaxWidth = fieldWidth - leftLabelWidth - 5
    const leftLines = pdf.splitTextToSize(value1 || '', leftMaxWidth)

    let leftCurrentY = y
    leftLines.forEach((line: string, index: number) => {
      pdf.text(line, leftX + leftLabelWidth, leftCurrentY)
      if (index < leftLines.length - 1) leftCurrentY += 6
    })

    // Right column
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.text(label2 + ':', rightX, y)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    const rightLabelWidth = pdf.getTextWidth(label2 + ': ')
    const rightMaxWidth = fieldWidth - rightLabelWidth - 5
    const rightLines = pdf.splitTextToSize(value2 || '', rightMaxWidth)

    let rightCurrentY = y
    rightLines.forEach((line: string, index: number) => {
      pdf.text(line, rightX + rightLabelWidth, rightCurrentY)
      if (index < rightLines.length - 1) rightCurrentY += 6
    })

    const maxY = Math.max(leftCurrentY, rightCurrentY)

    // Add line separators
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.2)
    pdf.line(leftX, maxY + 2, leftX + fieldWidth, maxY + 2)
    pdf.line(rightX, maxY + 2, rightX + fieldWidth, maxY + 2)

    return maxY + 8
  }

  // Add main border around entire form
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.8)
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)

  // Header Section
  yPosition = 22

  // School Information
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text('INFRAME SCHOOL', 20, yPosition)

  yPosition += 7
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.text('EXISTING STUDENT - PAYMENT RECEIPT', 20, yPosition)

  yPosition += 6
  pdf.setFontSize(8)
  pdf.text('Email: admissions@inframe.edu.in', 20, yPosition)

  yPosition += 5
  pdf.text('Phone: +91 98765 43210', 20, yPosition)

  // Right side - Profile Photo placeholder
  const photoX = pageWidth - 45
  const photoY = 22
  const photoSize = 25

  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  pdf.rect(photoX, photoY, photoSize, photoSize)

  pdf.setFontSize(7)
  pdf.setTextColor(100, 100, 100)
  pdf.text('PROFILE', photoX + 3, photoY + 10)
  pdf.text('PHOTO', photoX + 5, photoY + 17)
  pdf.setTextColor(0, 0, 0)

  // Horizontal divider after header
  yPosition = 55
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.5)
  pdf.line(20, yPosition, pageWidth - 20, yPosition)

  yPosition += 8

  // Student Information Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('STUDENT INFORMATION', 20, yPosition)
  yPosition += 10

  yPosition = addTwoColumnFields('Student ID', studentData.id, 'Student Name', studentData.fullName, yPosition)
  yPosition = addTwoColumnFields('Email', studentData.email, 'Phone', studentData.phone, yPosition)
  yPosition = addTwoColumnFields('Admission Date', studentData.admissionDate, 'Academic Year', studentData.academicYear, yPosition)

  yPosition += 8

  // Program Information Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('PROGRAM INFORMATION', 20, yPosition)
  yPosition += 10

  yPosition = addField('Selected Program', studentData.selectedProgram, 20, yPosition, 170)
  yPosition = addTwoColumnFields('Specialization', studentData.specialization, 'Campus', studentData.campus, yPosition)

  yPosition += 8

  // Check page break before Payment Information
  checkPageBreak(100)

  // Payment Information Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.text('PAYMENT INFORMATION', 20, yPosition)
  yPosition += 10

  yPosition = addTwoColumnFields('Application Fee', `₹${studentData.applicationFee.toLocaleString('en-IN')}`, 'Amount Paid', `₹${studentData.paidAmount.toLocaleString('en-IN')}`, yPosition)
  yPosition = addTwoColumnFields('Remaining Balance', `₹${studentData.remainingAmount.toLocaleString('en-IN')}`, 'Payment Progress', `${((studentData.paidAmount / studentData.applicationFee) * 100).toFixed(1)}%`, yPosition)

  // Add recent payment details if available
  if (paymentData) {
    yPosition += 8
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.text('RECENT PAYMENT DETAILS', 20, yPosition)
    yPosition += 8

    yPosition = addTwoColumnFields('Payment Amount', `₹${paymentData.amount.toLocaleString('en-IN')}`, 'Payment Type', paymentData.type === 'full' ? 'Full Payment' : 'Partial Payment', yPosition)
    yPosition = addTwoColumnFields('Transaction ID', paymentData.transactionId, 'Payment Date', new Date(paymentData.timestamp).toLocaleDateString('en-GB'), yPosition)
  }

  yPosition += 10

  // Check page break before Terms
  checkPageBreak(80)

  // Terms & Conditions Section
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('IMPORTANT NOTES', 20, yPosition)

  yPosition += 10
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')

  const terms = [
    '• This is an official payment receipt from INFRAME SCHOOL.',
    '• Please keep this document safe for future reference.',
    '• The remaining balance must be paid as per the fee structure.',
    '• For any payment-related queries, contact the admission office.',
    '• Payment receipts are automatically generated and are valid for official purposes.',
    '• Late payment penalties may apply as per institutional policy.',
    '• All payments are non-refundable as per admission terms.',
    '• The institution reserves the right to modify fee structure with prior notice.'
  ]

  terms.forEach((term) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = 25

      // Add border to new page
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.8)
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
    }

    const lines = pdf.splitTextToSize(term, pageWidth - 50)
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 35) {
        pdf.addPage()
        yPosition = 25

        // Add border to new page
        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.8)
        pdf.rect(15, 15, pageWidth - 30, pageHeight - 35)
      }

      pdf.text(line, 20, yPosition)
      yPosition += 4
    })
    yPosition += 1
  })

  // Check if new page needed for signature and footer
  checkPageBreak(80)

  // Signature section
  yPosition += 15
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)

  pdf.text('Authorized Signature:', 20, yPosition)
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  pdf.line(20, yPosition + 12, 75, yPosition + 12)

  pdf.text('Date:', 110, yPosition)
  pdf.line(125, yPosition + 12, 165, yPosition + 12)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.text(new Date().toLocaleDateString('en-GB'), 130, yPosition + 10)

  // Ensure adequate space for footer
  checkPageBreak(45)

  // Footer
  const footerY = pageHeight - 40
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.3)
  pdf.line(20, footerY - 3, pageWidth - 20, footerY - 3)

  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.text('INFRAME SCHOOL', 20, footerY)

  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')
  pdf.text('D-98 Pal Link Road (Behind Kamla Nehru Hospital) Jodhpur', 20, footerY + 6)
  pdf.text('Email: admissions@inframe.edu.in | Phone: +91 98765 43210', 20, footerY + 12)
  pdf.text('www.inframeschool.com', 20, footerY + 18)

  return pdf
}

export const downloadExistingStudentPDF = (studentData: {
  id: string
  fullName: string
  email: string
  phone: string
  programCategory: string
  selectedProgram: string
  specialization: string
  campus: string
  admissionDate: string
  hasInitialPayment: boolean
  applicationFee: number
  paidAmount: number
  remainingAmount: number
  academicYear: string
}, paymentData?: {
  amount: number
  type: 'full' | 'partial'
  transactionId: string
  timestamp: string
}) => {
  const pdf = generateExistingStudentPDF(studentData, paymentData)
  pdf.save(`Payment_Receipt_${studentData.id}_${new Date().toISOString().split('T')[0]}.pdf`)
}