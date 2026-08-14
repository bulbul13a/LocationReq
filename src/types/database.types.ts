export type LocationRequestStatus = 'PENDING' | 'SHARED' | 'DECLINED' | 'EXPIRED' | 'ERROR'

export interface LocationRequest {
  id: string
  public_token_hash: string
  recipient_label: string | null
  message: string | null
  status: LocationRequestStatus
  created_at: string
  expires_at: string
  shared_at: string | null
  declined_at: string | null
  created_by: string
}

export interface Location {
  id: string
  request_id: string
  latitude: number
  longitude: number
  accuracy: number
  device_timestamp: string | null
  received_at: string
}
