-- Supabase Schema for Location Request

-- Create location_requests table
CREATE TABLE location_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_token_hash TEXT NOT NULL UNIQUE,
    recipient_label TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SHARED', 'DECLINED', 'EXPIRED', 'ERROR')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    shared_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES location_requests(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    device_timestamp TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    request_id UUID REFERENCES location_requests(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE location_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only authenticated admins can read their own location_requests
CREATE POLICY "Admins can view their own requests" ON location_requests
    FOR SELECT TO authenticated
    USING (auth.uid() = created_by);

-- Only authenticated admins can insert location_requests
CREATE POLICY "Admins can insert requests" ON location_requests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Only authenticated admins can update their own location_requests
CREATE POLICY "Admins can update their own requests" ON location_requests
    FOR UPDATE TO authenticated
    USING (auth.uid() = created_by);

-- Only authenticated admins can read locations related to their requests
CREATE POLICY "Admins can view locations for their requests" ON locations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM location_requests
            WHERE location_requests.id = locations.request_id
            AND location_requests.created_by = auth.uid()
        )
    );

-- Note: We intentionally DO NOT allow public insertion into `locations` directly via client-side Supabase keys.
-- Public clients will hit a Next.js Server API route. The Next.js Server API route will use the SUPABASE_SERVICE_ROLE_KEY
-- to bypass RLS, validate the token, and securely insert the location and update the request status.

-- Indexes
CREATE INDEX idx_location_requests_token_hash ON location_requests(public_token_hash);
CREATE INDEX idx_location_requests_status ON location_requests(status);
CREATE INDEX idx_locations_request_id ON locations(request_id);

-- Enable realtime on location_requests
alter publication supabase_realtime add table location_requests;

-- Grant permissions to authenticated and service roles
GRANT ALL ON TABLE public.location_requests TO authenticated;
GRANT ALL ON TABLE public.location_requests TO service_role;
GRANT ALL ON TABLE public.locations TO authenticated;
GRANT ALL ON TABLE public.locations TO service_role;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;
