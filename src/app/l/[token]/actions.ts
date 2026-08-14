'use server'

import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function submitLocation(
  rawToken: string,
  latitude: number,
  longitude: number,
  accuracy: number,
  deviceTimestamp: string | null
) {
  const supabase = await createClient()

  // Validate coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Invalid coordinates')
  }

  // Hash the token to look it up
  const publicTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  // Fetch the request
  const { data: request, error: fetchError } = await supabase
    .from('location_requests')
    .select('*')
    .eq('public_token_hash', publicTokenHash)
    .single()

  if (fetchError || !request) {
    throw new Error('Invalid location request')
  }

  if (request.status !== 'PENDING') {
    throw new Error(`Request has already been processed (Status: ${request.status})`)
  }

  if (new Date(request.expires_at) < new Date()) {
    // Optionally update status to EXPIRED here
    await supabase.from('location_requests').update({ status: 'EXPIRED' }).eq('id', request.id)
    throw new Error('This location request has expired')
  }

  // Insert location and update request status in a single transaction (or sequentially using service role)
  // Since we are using RLS and want to bypass it for this specific public submission, we can use the service role key.
  
  const supabaseAdmin = (await import('@supabase/ssr')).createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role to bypass RLS for insertion
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )

  const { error: insertError } = await supabaseAdmin
    .from('locations')
    .insert({
      request_id: request.id,
      latitude,
      longitude,
      accuracy,
      device_timestamp: deviceTimestamp
    })

  if (insertError) {
    console.error('Insert location error:', insertError)
    throw new Error('Failed to save location')
  }

  const { error: updateError } = await supabaseAdmin
    .from('location_requests')
    .update({
      status: 'SHARED',
      shared_at: new Date().toISOString()
    })
    .eq('id', request.id)

  if (updateError) {
    console.error('Update request error:', updateError)
    throw new Error('Failed to update request status')
  }

  return { success: true }
}

export async function declineRequest(rawToken: string) {
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

  const { data: request, error: fetchError } = await supabaseAdmin
    .from('location_requests')
    .select('*')
    .eq('public_token_hash', publicTokenHash)
    .single()

  if (fetchError || !request) {
    throw new Error('Invalid request')
  }

  if (request.status === 'PENDING') {
    await supabaseAdmin
      .from('location_requests')
      .update({
        status: 'DECLINED',
        declined_at: new Date().toISOString()
      })
      .eq('id', request.id)
  }

  return { success: true }
}
