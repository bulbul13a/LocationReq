'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { LocationRequest } from '@/types/database.types'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { Plus, Link as LinkIcon, ExternalLink, Map, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import CreateRequestModal from './CreateRequestModal'

export default function DashboardClient({
  initialRequests,
}: {
  initialRequests: LocationRequest[]
}) {
  const [requests, setRequests] = useState<LocationRequest[]>(initialRequests)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check for expired requests client-side for UI purposes (backend enforces it securely)
    const interval = setInterval(() => {
      setRequests(current => 
        current.map(req => {
          if (req.status === 'PENDING' && new Date(req.expires_at) < new Date()) {
            return { ...req, status: 'EXPIRED' }
          }
          return req
        })
      )
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_requests',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [payload.new as LocationRequest, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) => (req.id === payload.new.id ? (payload.new as LocationRequest) : req))
            )
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter((req) => req.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    shared: requests.filter((r) => r.status === 'SHARED').length,
    expired: requests.filter((r) => r.status === 'EXPIRED').length,
  }

  const getStatusBadge = (status: LocationRequest['status']) => {
    const styles = {
      PENDING: 'bg-blue-100 text-blue-800',
      SHARED: 'bg-green-100 text-green-800',
      DECLINED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      ERROR: 'bg-orange-100 text-orange-800',
    }
    const icons = {
      PENDING: <Clock className="w-3 h-3 mr-1 inline" />,
      SHARED: <CheckCircle className="w-3 h-3 mr-1 inline" />,
      DECLINED: <XCircle className="w-3 h-3 mr-1 inline" />,
      EXPIRED: <AlertCircle className="w-3 h-3 mr-1 inline" />,
      ERROR: <AlertCircle className="w-3 h-3 mr-1 inline" />,
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Location Request
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <dt className="text-sm font-medium text-blue-500 truncate">Pending</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.pending}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <dt className="text-sm font-medium text-green-500 truncate">Completed</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.shared}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <dt className="text-sm font-medium text-gray-500 truncate">Expired</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-600">{stats.expired}</dd>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient / Message
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                    No location requests found. Create one to get started.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.recipient_label || 'Unnamed Recipient'}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]" title={request.message || ''}>
                        {request.message || 'No message'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'SHARED' ? (
                        <Link href={`/admin/requests/${request.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                          <Map className="w-4 h-4 mr-1" /> View Map
                        </Link>
                      ) : (
                        <Link href={`/admin/requests/${request.id}`} className="text-gray-600 hover:text-gray-900 inline-flex items-center">
                          <ExternalLink className="w-4 h-4 mr-1" /> Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <CreateRequestModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
