import Link from 'next/link'
import { MapPin, Shield } from 'lucide-react'

export default function PrivacyPage() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Our Company'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
          <Shield className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600">
          <p className="lead text-lg mb-6">
            Your privacy is critically important to us. This policy explains how {companyName} collects, uses, and protects your location data.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. What information do we collect?</h2>
          <p>
            When you consent to a location request, we collect precise geolocation data (latitude, longitude, and accuracy) provided by your device's browser. We also record the time the location was collected and information about the request status.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Why do we collect it?</h2>
          <p>
            Your location is collected solely for the specific, one-time purpose described in the location request sent to you by {companyName}. This allows us to confirm your location at that specific moment.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Explicit Consent</h2>
          <p>
            We will <strong>never</strong> attempt to collect your location without your explicit, unambiguous consent. Location sharing is entirely voluntary. You must manually click the "Share My Location" button and subsequently grant permission through your browser's prompt. You can decline any request without penalty.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. No Continuous Tracking</h2>
          <p>
            This service operates strictly on a one-time-use basis. We do not engage in background tracking, continuous tracking, or recording of your location history over time. Once you submit your location, the unique link expires and cannot be used to track you again.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention and Deletion</h2>
          <p>
            Location data is kept only as long as necessary for the purpose it was requested. By default, sensitive location data is automatically purged after {process.env.LOCATION_RETENTION_HOURS || '24'} hours.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Data Sharing</h2>
          <p>
            We do not sell, rent, or trade your precise location data with third parties. Your location is visible only to authorized administrators of {companyName}.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
