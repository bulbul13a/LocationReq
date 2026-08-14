'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Location } from '@/types/database.types'
import { format } from 'date-fns'

// Leaflet requires window, so we must load it dynamically with ssr: false
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

export default function MapClient({ location }: { location: Location }) {
  const [isMounted, setIsMounted] = useState(false)
  const position: [number, number] = [location.latitude, location.longitude]

  useEffect(() => {
    setIsMounted(true)
    
    // Fix Leaflet's default icon path issues with Next.js
    // This runs only on the client
    const L = require('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
        <div className="animate-pulse text-gray-500 font-medium">Loading Map...</div>
      </div>
    )
  }

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw an accuracy circle if accuracy is reasonable (e.g. less than 10km) */}
        {location.accuracy && location.accuracy < 10000 && (
          <Circle 
            center={position} 
            radius={location.accuracy} 
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.15, weight: 1 }}
          />
        )}
        
        <Marker position={position}>
          <Popup>
            <div className="p-1">
              <p className="font-semibold mb-1 text-sm">Location Received</p>
              <p className="text-xs text-gray-600 mb-1">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
              <p className="text-xs text-gray-600">Accuracy: ~{Math.round(location.accuracy)}m</p>
              <p className="text-xs text-gray-500 mt-2 border-t pt-2">
                {format(new Date(location.received_at), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
