import Link from 'next/link'
import { FileText, MapPin } from 'lucide-react'

export default function TermsPage() {
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'Our Company'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center mb-8 pb-6 border-b border-gray-100">
          <FileText className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-orange-700 font-medium">
                LEGAL REVIEW REQUIRED: This is a placeholder document. Before deploying this application to production, you must have this document reviewed and adapted by legal counsel to ensure compliance with applicable laws.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600">
          <p>
            Welcome to the {companyName} Location Request service. By using this service, you agree to these Terms of Service.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Use of the Service</h2>
          <p>
            This service allows you to voluntarily share your precise geolocation data with {companyName} upon request. You must be at least the age of majority in your jurisdiction to use this service.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Accuracy of Information</h2>
          <p>
            By consenting to share your location, you acknowledge that the location data provided by your device's browser will be transmitted to us. We rely on the accuracy of the data provided by your device and browser, and make no independent verification of its accuracy.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Prohibited Conduct</h2>
          <p>
            You agree not to attempt to manipulate, spoof, or provide false location data. You agree not to attempt to gain unauthorized access to the service or any related systems or networks.
          </p>

          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the service; (b) any unauthorized access, use, or alteration of your transmissions or content.
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
