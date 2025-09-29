# Vercel Environment Variables Setup

## Required Environment Variables for Deployment

You need to set these environment variables in your Vercel project settings:

### For QA Environment (qa-black-panther-admin.vercel.app)

```bash
# Core Configuration (REQUIRED)
NEXT_PUBLIC_APP_ENV=qa
NEXT_PUBLIC_API_URL=https://black-alligator-qa-646040465533.asia-east1.run.app

# Application Info
NEXT_PUBLIC_APP_NAME=Black Swamp Admin (QA)
NEXT_PUBLIC_APP_VERSION=1.0.0-qa
NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN=@nebulab.com

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_SHOW_ENV_INDICATOR=true
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=true
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=true
```

### For Production Environment

```bash
# Core Configuration (REQUIRED)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://black-alligator-646040465533.asia-east1.run.app

# Application Info
NEXT_PUBLIC_APP_NAME=Black Swamp Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN=@nebulab.com

# Feature Flags (Production - more restrictive)
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=false
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_SHOW_ENV_INDICATOR=false
NEXT_PUBLIC_LOG_LEVEL=error
NEXT_PUBLIC_ENABLE_CONSOLE_LOGS=false
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=false
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (qa-black-panther-admin)
3. Go to "Settings" tab
4. Navigate to "Environment Variables" in the left sidebar
5. Add each variable listed above
6. Select the appropriate environment (Preview/Production)
7. Click "Save"
8. Redeploy your application for changes to take effect

## Important Notes

- `NEXT_PUBLIC_API_URL` is **REQUIRED** - the app will not work without it
- QA uses: `https://black-alligator-qa-646040465533.asia-east1.run.app`
- Production uses: `https://black-alligator-646040465533.asia-east1.run.app`
- All `NEXT_PUBLIC_*` variables are exposed to the browser (client-side)
- After adding/changing environment variables, you must redeploy

## Admin User Credentials

After deployment, make sure the admin user exists in the database:
- Email: `admin@blackswamp.com`
- Password: `Admin@123456`

Run the SQL script at `/black-alligator/create_admin_user.sql` in your Supabase dashboard to create this user.