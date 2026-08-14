'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function createLocationRequest(formData: FormData) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const recipientLabel = formData.get('recipientLabel') as string
  const expirationMinutes = parseInt(formData.get('expiration') as string, 10) || 30
  const message = formData.get('message') as string

  // Generate cryptographically secure random token (32 bytes = 256 bits)
  const rawToken = crypto.randomBytes(32).toString('hex')
  
  // Hash the token for database storage
  const publicTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const expiresAt = new Date(Date.now() + expirationMinutes * 60000).toISOString()

  const { data, error } = await supabase
    .from('location_requests')
    .insert({
      public_token_hash: publicTokenHash,
      recipient_label: recipientLabel || null,
      message: message || null,
      expires_at: expiresAt,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Insert error:', error)
    throw new Error('Failed to create location request')
  }

  revalidatePath('/admin')

  // Return the raw token only once
  // The client will use this to construct the sharable link
  return {
    success: true,
    requestId: data.id,
    rawToken: rawToken,
  }
}
