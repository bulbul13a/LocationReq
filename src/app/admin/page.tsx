import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'
import { LocationRequest } from '@/types/database.types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch location requests for the current admin
  const { data: requests, error } = await supabase
    .from('location_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching requests:', error)
    // Could display a server-rendered error here if needed
  }

  return (
    <DashboardClient initialRequests={(requests as LocationRequest[]) || []} />
  )
}
