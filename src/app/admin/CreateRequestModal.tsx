'use client'

import { useState } from 'react'
import { createLocationRequest } from './actions'
import { X, Copy, Check, Share2, ExternalLink } from 'lucide-react'

export default function CreateRequestModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await createLocationRequest(formData)
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const link = `${baseUrl}/l/${result.rawToken}`
      setGeneratedLink(link)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (generatedLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Share your location',
          text: 'Please share your current location with me.',
          url: generatedLink,
        })
      } catch (err) {
        console.error('Error sharing', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      
      {/* Modal panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <span className="sr-only">Close</span>
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-6" id="modal-title">
          Create Location Request
        </h3>
        
        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="recipientLabel" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Name / Label (Optional)
              </label>
              <input
                type="text"
                name="recipientLabel"
                id="recipientLabel"
                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
                Expiration
              </label>
              <select
                id="expiration"
                name="expiration"
                className="block w-full bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                defaultValue={process.env.NEXT_PUBLIC_DEFAULT_EXPIRATION_MINUTES || '30'}
              >
                <option value="10">10 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">24 hours</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message to Recipient (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Please share your current location so we can confirm your location."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-5">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <h4 className="text-xl font-medium text-gray-900 mb-2">Location request created!</h4>
            <p className="text-sm text-gray-500 mb-6">
              Share this unique link with the recipient. It will expire based on your settings.
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 px-3 py-2.5 bg-gray-50 text-gray-600 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-l border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-100"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex gap-3">
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                  <button
                    onClick={handleShare}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </button>
                )}
                
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Open
                </a>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Close and return to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
