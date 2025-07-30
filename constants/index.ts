// Export all course-related constants
export * from './inframeCourses'
export * from './courseSummary'

// Re-export commonly used items for convenience
export {
  COURSE_PROGRAMS,
  COURSE_CATEGORIES,
  COURSES_BY_DURATION,
  COURSES_BY_FEE,
  COURSES_BY_APPLICATION_FEE,
  COURSES_BY_ELIGIBILITY,
  POPULAR_BRANCHES,
  ALL_BRANCHES,
  FEE_RANGES,
  APPLICATION_FEE_RANGES,
  getCourseById,
  getCoursesByCategory,
  getCoursesByBranch,
  getCoursesByFeeRange,
  getCoursesByDuration,
  getCoursesByEligibility,
  getCoursesByApplicationFee
} from './inframeCourses'

export {
  COURSE_SUMMARY,
  COURSE_STATS,
  PROGRAM_TYPES,
  DURATION_OPTIONS,
  APPLICATION_FEE_RANGE_OPTIONS,
  ELIGIBILITY_OPTIONS,
  BRANCH_OPTIONS,
  CAMPUS_OPTIONS
} from './courseSummary'
