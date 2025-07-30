
import TabLayout from '@/components/layout/TabLayout'
import AppRouter from '@/components/AppRouter'
import ExistingStudentContainer from '@/components/existing-student/ExistingStudentContainer'

export default function Home() {
  return (
    <TabLayout
      existingStudentPortal={<ExistingStudentContainer />}
    >
      <AppRouter />
    </TabLayout>
  )
}
