import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'
import RecipientClient from './RecipientClient'
import { AlertCircle } from 'lucide-react'

export default async function LocationRequestPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params
  const rawToken = resolvedParams.token
  const publicTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const supabaseAdmin = (await import('@supabase/ssr')).createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )

  const { data: request, error } = await supabaseAdmin
    .from('location_requests')
    .select('*')
    .eq('public_token_hash', publicTokenHash)
    .single()

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Location Request'

  const ErrorUI = ({ title, message }: { title: string; message: string }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-md mx-auto p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )

  if (error || !request) {
    return <ErrorUI title="Invalid Request" message="This location request is invalid or does not exist." />
  }

  if (request.status === 'EXPIRED' || new Date(request.expires_at) < new Date()) {
    return <ErrorUI title="Request Expired" message="This location request has expired." />
  }

  if (request.status === 'SHARED') {
    return <ErrorUI title="Already Completed" message="This location request has already been completed." />
  }

  if (request.status === 'DECLINED') {
    return <ErrorUI title="Request Declined" message="This location request was previously declined." />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <RecipientClient 
        rawToken={rawToken} 
        companyName={companyName}
        expiresAt={request.expires_at}
      />
    </div>
  )
}
