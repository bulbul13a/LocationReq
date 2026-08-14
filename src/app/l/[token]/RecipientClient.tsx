'use client'

import { useState, useEffect } from 'react'
import { submitLocation, declineRequest } from './actions'
import { MapPin, Navigation, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function RecipientClient({
  rawToken,
  companyName,
  expiresAt,
}: {
  rawToken: string
  companyName: string
  expiresAt: string
}) {
  const [status, setStatus] = useState<'IDLE' | 'LOCATING' | 'SUBMITTING' | 'SUCCESS' | 'DECLINED' | 'ERROR'>('IDLE')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')
  
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const expiry = new Date(expiresAt)
      const diffMs = expiry.getTime() - now.getTime()
      
      if (diffMs <= 0) {
        setStatus('ERROR')
        setErrorMessage('This location request has expired.')
        setTimeLeft('00:00')
        return
      }
      
      const mins = Math.floor(diffMs / 60000)
      const secs = Math.floor((diffMs % 60000) / 1000)
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    
    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const handleShare = () => {
    setStatus('LOCATING')
    setErrorMessage(null)

    if (!navigator.geolocation) {
      setStatus('ERROR')
      setErrorMessage('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setStatus('SUBMITTING')
          const result = await submitLocation(
            rawToken,
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy,
            new Date(position.timestamp).toISOString()
          )
          
          if (result.error) {
            setStatus('ERROR')
            setErrorMessage(result.error)
          } else {
            setStatus('SUCCESS')
          }
        } catch (err: any) {
          setStatus('ERROR')
          setErrorMessage(err.message || 'Failed to submit location.')
        }
      },
      (error) => {
        setStatus('ERROR')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location permission was denied. Please allow location access in your browser settings to continue.')
            break
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setErrorMessage('The request to get user location timed out.')
            break
          default:
            setErrorMessage('An unknown error occurred while requesting location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    )
  }

  const handleDecline = async () => {
    try {
      const result = await declineRequest(rawToken)
      if (result.error) {
        setStatus('ERROR')
        setErrorMessage(result.error)
      } else {
        setStatus('DECLINED')
      }
    } catch (err) {
      setStatus('ERROR')
      setErrorMessage('Failed to decline request, please try again.')
    }
  }

  if (status === 'SUCCESS') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Shared</h2>
        <p className="text-gray-600 mb-8 max-w-sm">
          Thank you. Your current location has been securely shared with {companyName}. You may now close this page.
        </p>
      </div>
    )
  }

  if (status === 'DECLINED') {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Declined</h2>
        <p className="text-gray-600 mb-8 max-w-sm">
          Location sharing was declined. Your location has not been shared. You may close this page.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-md mx-auto">
      <div className="bg-blue-600 p-6 flex justify-center">
        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <MapPin className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Share Your Location</h2>
        
        <p className="text-gray-600 text-center mb-6">
          <strong className="text-gray-900">{companyName}</strong> is requesting your current location.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              If you choose to continue, your current location will be shared <strong>once</strong> with {companyName}. This is not continuous location tracking.
            </p>
          </div>
        </div>

        {status === 'ERROR' && errorMessage && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {status === 'IDLE' || status === 'ERROR' ? (
          <>
            <div className="text-center mb-6">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Request expires in</span>
              <div className="text-2xl font-mono text-gray-900 font-semibold">{timeLeft}</div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Navigation className="mr-2 h-5 w-5" />
                Share My Location
              </button>
              
              <button
                onClick={handleDecline}
                className="w-full flex items-center justify-center py-3.5 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Decline
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium">
              {status === 'LOCATING' ? 'Finding your location...' : 'Securely submitting...'}
            </p>
            {status === 'LOCATING' && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Please allow location access when prompted by your browser.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
