// Course Summary and Quick Reference Data
export const COURSE_SUMMARY = {
  // Duration Categories
  DURATION_CATEGORIES: [
    {
      id: '4_years',
      name: '4 Years',
      description: "Bachelor's Degree Programs (B.Des, BFA)",
      programs: ['Bachelor of Design (B.Des)', 'Bachelor of Fine Arts (BFA)']
    },
    {
      id: '3_years',
      name: '3 Years',
      description: 'Vocational Studies, BBA, Diploma',
      programs: ['Bachelor of Vocational Studies', 'Bachelor of Business Administration (BBA)', 'Diploma Programs (3 Years)']
    },
    {
      id: '2_years',
      name: '2 Years',
      description: 'Diploma Programs',
      programs: ['Diploma Programs (2 Years)']
    },
    {
      id: '1_year',
      name: '1 Year',
      description: '1 Year Diploma Programs',
      programs: ['Diploma Programs (1 Year)']
    },
    {
      id: '11_months',
      name: '11 Months',
      description: 'Specialized Short Programs',
      programs: ['Short-term Diploma Programs (11 Months)']
    },
    {
      id: '6_months',
      name: '6 Months',
      description: 'Certificate Programs 6 Months',
      programs: ['Short-term Diploma Programs (6 Months)']
    }
  ],

  // Application Fee Categories
  APPLICATION_FEE_CATEGORIES: [
    {
      id: 'highest',
      name: '₹2,500',
      amount: 2500,
      description: 'Bachelor of Design (B.Des)',
      programs: ['Bachelor of Design (B.Des)']
    },
    {
      id: 'high',
      name: '₹2,000',
      amount: 2000,
      description: 'Bachelor of Fine Arts (BFA)',
      programs: ['Bachelor of Fine Arts (BFA)']
    },
    {
      id: 'medium',
      name: '₹1,500',
      amount: 1500,
      description: 'Bachelor programs (BVS, BBA)',
      programs: [
        'Bachelor of Vocational Studies',
        'Bachelor of Business Administration (BBA)'
      ]
    },
    {
      id: 'standard',
      name: '₹1,000',
      amount: 1000,
      description: 'All Diploma Programs',
      programs: [
        'Diploma Programs (3 Years)',
        'Diploma Programs (2 Years)',
        'Diploma Programs (1 Year)'
      ]
    },
    {
      id: 'basic',
      name: '₹500',
      amount: 500,
      description: '6-month certificate programs',
      programs: ['Short-term Diploma Programs (6 Months)']
    }
  ],

  // Popular Branches
  POPULAR_BRANCHES: [
    {
      id: 'interior_design',
      name: 'Interior Design',
      description: 'Available across all program levels',
      availability: 'All Levels'
    },
    {
      id: 'fashion_design',
      name: 'Fashion Design/Technology',
      description: 'Available in most programs',
      availability: 'Most Programs'
    },
    {
      id: 'animation',
      name: 'Animation',
      description: 'Available in multiple program types',
      availability: 'Multiple Types'
    },
    {
      id: 'graphic_design',
      name: 'Graphic Design',
      description: 'Offered in various formats',
      availability: 'Various Formats'
    },
    {
      id: 'jewellery_design',
      name: 'Jewellery Design',
      description: 'Specialized programs available',
      availability: 'Specialized'
    },
    {
      id: 'digital_marketing',
      name: 'Digital Marketing',
      description: 'Modern skill-based programs',
      availability: 'Skill-based'
    },
    {
      id: 'ui_ux_design',
      name: 'UI/UX Design',
      description: 'Technology-focused programs',
      availability: 'Technology-focused'
    }
  ],

  // Eligibility Categories
  ELIGIBILITY_CATEGORIES: [
    {
      id: '10_plus_2',
      name: '10+2 Required',
      description: "Bachelor's degrees, 3-year diplomas, 2-year diplomas",
      programs: [
        'Bachelor of Design (B.Des)',
        'Bachelor of Fine Arts (BFA)',
        'Bachelor of Vocational Studies',
        'Bachelor of Business Administration (BBA)',
        'Diploma Programs (3 Years)',
        'Diploma Programs (2 Years)'
      ]
    },
    {
      id: '10th_class',
      name: '10th Class',
      description: '1-year diploma, certificate programs 6 months',
      programs: [
        'Diploma Programs (1 Year)',
        'Short-term Diploma Programs (11 Months)',
        'Short-term Diploma Programs (6 Months)'
      ]
    }
  ]
}

// Quick Stats
export const COURSE_STATS = {
  TOTAL_PROGRAMS: 8,
  TOTAL_BRANCHES: 25,
  DURATION_RANGE: '6 months to 4 years',
  APPLICATION_FEE_RANGE: '₹500 to ₹2,500',
  ELIGIBILITY_OPTIONS: 2,
  CATEGORIES: 7
}

// Program Types for Forms
export const PROGRAM_TYPES = [
  { value: 'bachelors', label: "Bachelor's Degree Programs" },
  { value: 'vocational', label: 'Bachelor of Vocational Studies' },
  { value: 'business', label: 'Bachelor of Business Administration' },
  { value: 'diploma', label: 'Diploma Programs' },
  { value: 'short_diploma', label: '1 Year Diploma Programs' },
  { value: 'short_term', label: 'Short-term Programs' },
  { value: 'certificate', label: 'Certificate Programs 6 Months' }
]

// Duration Options for Forms
export const DURATION_OPTIONS = [
  { value: '4', label: '4 Years' },
  { value: '3', label: '3 Years' },
  { value: '2', label: '2 Years' },
  { value: '1', label: '1 Year' },
  { value: '0.92', label: '11 Months' },
  { value: '0.5', label: '6 Months' }
]

// Application Fee Range Options for Forms
export const APPLICATION_FEE_RANGE_OPTIONS = [
  { value: 'basic', label: '₹500', min: 500, max: 500 },
  { value: 'standard', label: '₹1,000', min: 1000, max: 1000 },
  { value: 'medium', label: '₹1,500', min: 1500, max: 1500 },
  { value: 'high', label: '₹2,000', min: 2000, max: 2000 },
  { value: 'highest', label: '₹2,500', min: 2500, max: 2500 }
]

// Eligibility Options for Forms
export const ELIGIBILITY_OPTIONS = [
  { value: '10th_class', label: '10th Class' },
  { value: '10_plus_2', label: '10+2 Any Stream' }
]

// All Branches for Forms (sorted alphabetically)
export const BRANCH_OPTIONS = [
  'Advertising and Marketing',
  'Animation',
  'Animation & VFX',
  'Applied Arts',
  'Cad Jewellery',
  'Digital Marketing',
  'Entrepreneurship Skill',
  'Fashion Design',
  'Fashion Technology',
  'Fine Arts',
  'Graphic Design',
  'Graphic Design/Multimedia',
  'Graphic Design/Visual Communication',
  'Interior Design',
  'Jewellery Design',
  'Media and Entertainment',
  'Painting',
  'Sculpture',
  'Textile Design',
  'UI/UX Design',
  'VFX',
  'Visual Communication'
].map(branch => ({ value: branch.toLowerCase().replace(/[^a-z0-9]/g, '_'), label: branch }))

// Campus Options (if multiple campuses exist)
export const CAMPUS_OPTIONS = [
  { value: 'main', label: 'Main Campus' },
  // Add more campuses as needed
]
