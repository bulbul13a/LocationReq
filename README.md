# Location Request Web Application

A consent-based, privacy-focused location sharing application built with Next.js, Supabase, and Tailwind CSS. 

This application allows an administrator to generate unique, secure links to request a recipient's precise location. The recipient must explicitly grant consent and browser location permission for the location to be shared.

## Features
- **Admin Dashboard**: Create, view, and manage location requests.
- **Privacy-First**: No background tracking, explicit consent required, clear privacy policy.
- **Secure Links**: Cryptographically secure tokens to prevent guessing.
- **Realtime Updates**: Admin dashboard updates instantly when a recipient shares their location.
- **Map View**: Integrated Leaflet map to visualize the received coordinates.

## Prerequisites
- Node.js v18.18.0 or newer
- A [Supabase](https://supabase.com/) project

## Setup Instructions

### 1. Database Setup (Supabase)
1. Go to your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Copy the contents of `supabase/schema.sql` and run it to create the necessary tables, indexes, and Row Level Security (RLS) policies.

### 2. Authentication Setup (Supabase)
1. In your Supabase project, go to **Authentication** > **Providers**.
2. Ensure **Email** is enabled.
3. Turn off "Confirm email" if you want to be able to create users and log in immediately without verifying emails (useful for MVP).
4. Go to **Authentication** > **Users** and create a new user (this will be your Admin account).

### 3. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in the following variables:
- `NEXT_PUBLIC_BASE_URL`: The URL where your app is hosted (e.g. `http://localhost:3000` for local testing).
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service_role secret key (used for bypassing RLS during public submission).
- `NEXT_PUBLIC_COMPANY_NAME`: Your organization name displayed to recipients.

### 4. Install Dependencies
Run the following command to install required packages:
```bash
npm install
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000/admin` and log in with the Admin account you created.

## How to Test the Complete Flow (iPhone / Safari)

**IMPORTANT**: The browser `Geolocation API` requires a secure context (**HTTPS**). It will not work over standard HTTP unless the host is `localhost`. If you want to test on an actual mobile device over your local network, you MUST use a tool that provides an HTTPS tunnel.

1. **Setup HTTPS Tunnel**: Use a service like `ngrok` or `localtunnel` to expose your local port 3000.
   ```bash
   npx ngrok http 3000
   ```
2. Update your `.env.local`'s `NEXT_PUBLIC_BASE_URL` to the ngrok HTTPS URL and restart the dev server.
3. Go to the Admin Dashboard (via the ngrok URL) and log in.
4. Click **Create Location Request** and generate a link.
5. Copy the link and open it on your iPhone Safari browser.
6. Observe the consent page and click **Share My Location**.
7. Accept the Safari prompt asking for Location Permissions.
8. Look at the Admin Dashboard on your desktop—it will update automatically via Supabase Realtime!

## Security Considerations
- The `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the client-side. It is only used in secure Server Actions.
- The `locations` table is locked down with RLS. Public insertion is explicitly forbidden; it must go through the Next.js Server Action which validates the request state and token hash before using the service key.
- Tokens in the URL are random 256-bit hashes, preventing enumeration attacks.

## Location Retention
By default, the application is designed for one-time location sharing. You can configure automatic deletion of old location data using Supabase `pg_cron` extensions or Edge Functions, based on the `LOCATION_RETENTION_HOURS` policy.
