import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import MapClient from './MapClient'
import { LocationRequestStatus } from '@/types/database.types'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return notFound()
  }

  // Fetch the request
  const { data: request, error: reqError } = await supabase
    .from('location_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (reqError || !request) {
    return notFound()
  }

  // Authorize: ensure the request belongs to this admin
  if (request.created_by !== user.id) {
    return notFound()
  }

  // If status is SHARED, fetch the location
  let location = null
  if (request.status === 'SHARED') {
    const { data: locData } = await supabase
      .from('locations')
      .select('*')
      .eq('request_id', id)
      .order('received_at', { ascending: false })
      .limit(1)
      .single()
    
    if (locData) {
      location = locData
    }
  }

  const getStatusBadge = (status: LocationRequestStatus) => {
    const styles = {
      PENDING: 'bg-blue-100 text-blue-800',
      SHARED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-orange-100 text-orange-800',
    }
    const icons = {
      PENDING: <Clock className="w-4 h-4 mr-1.5" />,
      SHARED: <CheckCircle className="w-4 h-4 mr-1.5" />,
      DECLINED: <XCircle className="w-4 h-4 mr-1.5" />,
      EXPIRED: <AlertCircle className="w-4 h-4 mr-1.5" />,
      ERROR: <AlertCircle className="w-4 h-4 mr-1.5" />,
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Request Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Information and status of the location request.</p>
          </div>
          <div>
            {getStatusBadge(request.status)}
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Recipient Label</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.recipient_label || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{request.message || 'N/A'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(request.created_at), 'dd MMM yyyy, hh:mm:ss a')}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Expires At</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(request.expires_at), 'dd MMM yyyy, hh:mm:ss a')}
              </dd>
            </div>
            
            {request.status === 'SHARED' && request.shared_at && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Shared At</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold text-green-600">
                  {format(new Date(request.shared_at), 'dd MMM yyyy, hh:mm:ss a')}
                </dd>
              </div>
            )}

            {request.status === 'DECLINED' && request.declined_at && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Declined At</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold text-red-600">
                  {format(new Date(request.declined_at), 'dd MMM yyyy, hh:mm:ss a')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {request.status === 'SHARED' && location && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              Location Data
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Coordinates</p>
                <p className="text-base font-semibold text-gray-900 font-mono">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Accuracy</p>
                <p className="text-base font-semibold text-gray-900">
                  Within {Math.round(location.accuracy)} meters
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-1">Received Time</p>
                <p className="text-base font-semibold text-gray-900">
                  {format(new Date(location.received_at), 'hh:mm:ss a')}
                </p>
              </div>
            </div>

            <MapClient location={location as any} />
          </div>
        </div>
      )}

      {request.status === 'PENDING' && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 flex items-start">
          <Info className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-base font-medium text-blue-900 mb-1">Waiting for recipient</h4>
            <p className="text-sm text-blue-800">
              This request is still pending. Once the recipient opens the link and explicitly agrees to share their location, it will appear here automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
