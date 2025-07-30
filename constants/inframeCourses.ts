// Inframe Courses Data Structure
export interface CourseProgram {
  id: string
  name: string
  duration: string
  durationYears: number
  eligibility: string
  applicationFee: number
  perYearFee: number
  totalFee: number
  paymentMode?: string
  branches: string[]
  category: string
  level: string
}

export interface CourseCategory {
  id: string
  name: string
  description: string
  programs: CourseProgram[]
}

// Individual Course Programs
export const COURSE_PROGRAMS: CourseProgram[] = [
  // Bachelor's Degree Programs (4 Years)
  {
    id: 'bdes',
    name: 'Bachelor of Design (B.Des)',
    duration: '4 years',
    durationYears: 4,
    eligibility: '10+2 any stream',
    applicationFee: 2500,
    perYearFee: 120000,
    totalFee: 480000,
    branches: [
      'Interior Design',
      'Fashion Design',
      'Graphic Design/Visual Communication',
      'UI/UX Design',
      'Animation & VFX'
    ],
    category: 'bachelors',
    level: 'undergraduate'
  },
  {
    id: 'bfa',
    name: 'Bachelor of Fine Arts (BFA)',
    duration: '4 years',
    durationYears: 4,
    eligibility: '10+2 any stream',
    applicationFee: 2000,
    perYearFee: 95000,
    totalFee: 380000,
    branches: [
      'Painting',
      'Applied Arts',
      'Sculpture',
      'Visual Communication'
    ],
    category: 'bachelors',
    level: 'undergraduate'
  },

  // Bachelor of Vocational Studies (3 Years)
  {
    id: 'bvs',
    name: 'Bachelor of Vocational Studies',
    duration: '3 years',
    durationYears: 3,
    eligibility: '10+2 any stream',
    applicationFee: 1500,
    perYearFee: 95000,
    totalFee: 285000,
    paymentMode: 'semester-wise payment',
    branches: [
      'Interior Design',
      'Fashion Design',
      'Graphic Design',
      'Fine Arts',
      'Animation & VFX',
      'Digital Marketing',
      'Jewellery Design',
      'Entrepreneurship Skill',
      'Media and Entertainment'
    ],
    category: 'vocational',
    level: 'undergraduate'
  },

  // Bachelor of Business Administration (3 Years)
  {
    id: 'bba',
    name: 'Bachelor of Business Administration (BBA)',
    duration: '3 years',
    durationYears: 3,
    eligibility: '10+2 any stream',
    applicationFee: 1500,
    perYearFee: 95000,
    totalFee: 285000,
    paymentMode: 'semester-wise payment',
    branches: [
      'Advertising and Marketing'
    ],
    category: 'business',
    level: 'undergraduate'
  },

  // Diploma Programs (3 Years)
  {
    id: 'diploma_3y',
    name: 'Diploma Programs (3 Years)',
    duration: '3 years',
    durationYears: 3,
    eligibility: '10+2 any stream',
    applicationFee: 1000,
    perYearFee: 95000,
    totalFee: 285000,
    paymentMode: 'semester-wise payment',
    branches: [
      'Interior Design',
      'Fashion Design',
      'Graphic Design',
      'Fine Arts',
      'Animation & VFX',
      'Jewellery Design'
    ],
    category: 'diploma',
    level: 'diploma'
  },

  // Diploma Programs (2 Years)
  {
    id: 'diploma_2y',
    name: 'Diploma Programs (2 Years)',
    duration: '2 years',
    durationYears: 2,
    eligibility: '10+2 any stream',
    applicationFee: 1000,
    perYearFee: 95000,
    totalFee: 190000,
    paymentMode: 'semester-wise payment',
    branches: [
      'Interior Design',
      'Fashion Design',
      'Graphic Design',
      'Fine Arts',
      'Animation',
      'Jewellery Design',
      'Entrepreneurship Skill',
      'Media and Entertainment'
    ],
    category: 'diploma',
    level: 'diploma'
  },

  // Diploma Programs (1 Year)
  {
    id: 'diploma_1y',
    name: 'Diploma Programs (1 Year)',
    duration: '1 year',
    durationYears: 1,
    eligibility: '10th class',
    applicationFee: 1000,
    perYearFee: 95000,
    totalFee: 95000,
    paymentMode: 'semester-wise payment',
    branches: [
      'Interior Design',
      'Fashion Technology',
      'Graphic Design/Multimedia',
      'UI/UX Design',
      'VFX',
      'Animation',
      'Jewellery Design',
      'Entrepreneurship Skill',
      'Media and Entertainment',
      'Cad Jewellery',
      'Digital Marketing',
      'Painting'
    ],
    category: 'short_diploma',
    level: 'certificate'
  },

  // Short-term Diploma Programs (11 Months) - REMOVED (not in new structure)
  // {
  //   id: 'short_diploma_11m',
  //   name: 'Short-term Diploma Programs (11 Months)',
  //   duration: '11 months',
  //   durationYears: 0.92,
  //   eligibility: '10th class',
  //   applicationFee: 1000,
  //   perYearFee: 95000,
  //   totalFee: 95000,
  //   branches: [
  //     'Cad Jewellery',
  //     'Digital Marketing',
  //     'Painting'
  //   ],
  //   category: 'short_term',
  //   level: 'certificate'
  // },

  // Short-term Diploma Programs (6 Months)
  {
    id: 'short_diploma_6m',
    name: 'Short-term Diploma Programs (6 Months)',
    duration: '6 months',
    durationYears: 0.5,
    eligibility: '10th class',
    applicationFee: 500,
    perYearFee: 45000,
    totalFee: 22500,
    branches: [
      'Interior Design',
      'Fashion Technology',
      'Graphic Design/Multimedia',
      'UI/UX Design',
      'VFX',
      'Animation',
      'Jewellery Design',
      'CAD Jewellery',
      'Digital Marketing',
      'Painting'
    ],
    category: 'certificate',
    level: 'certificate'
  }
]

// Course Categories
export const COURSE_CATEGORIES: CourseCategory[] = [
  {
    id: 'bachelors',
    name: "Bachelor's Degree Programs",
    description: '4-year undergraduate degree programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'bachelors')
  },
  {
    id: 'vocational',
    name: 'Bachelor of Vocational Studies',
    description: '3-year vocational undergraduate programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'vocational')
  },
  {
    id: 'business',
    name: 'Bachelor of Business Administration',
    description: '3-year business administration programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'business')
  },
  {
    id: 'diploma',
    name: 'Diploma Programs',
    description: '2-3 year diploma programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'diploma')
  },
  {
    id: 'short_diploma',
    name: '1 Year Diploma Programs',
    description: '1-year diploma programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'short_diploma')
  },
  {
    id: 'short_term',
    name: 'Short-term Programs',
    description: '11-month specialized programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'short_term')
  },
  {
    id: 'certificate',
    name: 'Certificate Programs 6 Months',
    description: '6-month certificate programs',
    programs: COURSE_PROGRAMS.filter(p => p.category === 'certificate')
  }
]

// Categorization by Duration
export const COURSES_BY_DURATION = {
  '4_years': COURSE_PROGRAMS.filter(p => p.durationYears === 4),
  '3_years': COURSE_PROGRAMS.filter(p => p.durationYears === 3),
  '2_years': COURSE_PROGRAMS.filter(p => p.durationYears === 2),
  '1_year': COURSE_PROGRAMS.filter(p => p.durationYears === 1),
  '11_months': COURSE_PROGRAMS.filter(p => p.durationYears === 0.92),
  '6_months': COURSE_PROGRAMS.filter(p => p.durationYears === 0.5)
}

// Categorization by Fee Structure
export const COURSES_BY_FEE = {
  'premium': COURSE_PROGRAMS.filter(p => p.perYearFee === 120000), // ₹1,20,000/year
  'standard': COURSE_PROGRAMS.filter(p => p.perYearFee === 95000), // ₹95,000/year
  'basic': COURSE_PROGRAMS.filter(p => p.perYearFee === 45000)     // ₹45,000/year
}

// Categorization by Eligibility
export const COURSES_BY_ELIGIBILITY = {
  '10_plus_2': COURSE_PROGRAMS.filter(p => p.eligibility === '10+2 any stream'),
  '10th_class': COURSE_PROGRAMS.filter(p => p.eligibility === '10th class')
}

// Popular Branches across all programs
export const POPULAR_BRANCHES = {
  'interior_design': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('interior design'))
  ),
  'fashion_design': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('fashion'))
  ),
  'animation': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('animation'))
  ),
  'graphic_design': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('graphic'))
  ),
  'jewellery_design': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('jewellery'))
  ),
  'digital_marketing': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('digital marketing'))
  ),
  'ui_ux_design': COURSE_PROGRAMS.filter(p =>
    p.branches.some(branch => branch.toLowerCase().includes('ui/ux'))
  )
}

// All unique branches
export const ALL_BRANCHES = Array.from(
  new Set(COURSE_PROGRAMS.flatMap(program => program.branches))
).sort()

// Fee ranges
export const FEE_RANGES = {
  min: Math.min(...COURSE_PROGRAMS.map(p => p.totalFee)),
  max: Math.max(...COURSE_PROGRAMS.map(p => p.totalFee)),
  perYear: {
    min: Math.min(...COURSE_PROGRAMS.map(p => p.perYearFee)),
    max: Math.max(...COURSE_PROGRAMS.map(p => p.perYearFee))
  }
}

// Application Fee ranges
export const APPLICATION_FEE_RANGES = {
  min: Math.min(...COURSE_PROGRAMS.map(p => p.applicationFee)),
  max: Math.max(...COURSE_PROGRAMS.map(p => p.applicationFee))
}

// Categorization by Application Fee
export const COURSES_BY_APPLICATION_FEE = {
  'highest': COURSE_PROGRAMS.filter(p => p.applicationFee === 2500), // ₹2,500
  'high': COURSE_PROGRAMS.filter(p => p.applicationFee === 2000),    // ₹2,000
  'medium': COURSE_PROGRAMS.filter(p => p.applicationFee === 1500),  // ₹1,500
  'standard': COURSE_PROGRAMS.filter(p => p.applicationFee === 1000), // ₹1,000
  'basic': COURSE_PROGRAMS.filter(p => p.applicationFee === 500)     // ₹500
}

// Helper functions
export const getCourseById = (id: string): CourseProgram | undefined => {
  return COURSE_PROGRAMS.find(course => course.id === id)
}

export const getCoursesByCategory = (categoryId: string): CourseProgram[] => {
  return COURSE_PROGRAMS.filter(course => course.category === categoryId)
}

export const getCoursesByBranch = (branchName: string): CourseProgram[] => {
  return COURSE_PROGRAMS.filter(course =>
    course.branches.some(branch =>
      branch.toLowerCase().includes(branchName.toLowerCase())
    )
  )
}

export const getCoursesByFeeRange = (minFee: number, maxFee: number): CourseProgram[] => {
  return COURSE_PROGRAMS.filter(course =>
    course.totalFee >= minFee && course.totalFee <= maxFee
  )
}

export const getCoursesByDuration = (years: number): CourseProgram[] => {
  return COURSE_PROGRAMS.filter(course => course.durationYears === years)
}

export const getCoursesByEligibility = (eligibility: string): CourseProgram[] => {
  return COURSE_PROGRAMS.filter(course => course.eligibility === eligibility)
}

export const getCoursesByApplicationFee = (applicationFee: number): CourseProgram[] => {
  return COURSE_PROGRAMS.filter(course => course.applicationFee === applicationFee)
}
