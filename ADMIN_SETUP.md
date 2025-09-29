# Admin Dashboard Setup Guide

## Prerequisites

Before you can login to the admin dashboard, you need to create an admin user in the database.

## Creating Admin User

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script located at: `/black-alligator/create_admin_user.sql`

This will create the default admin account with:
- **Email**: `admin@blackswamp.com`
- **Password**: `Admin@123456`
- **Role**: `super_admin`

## Login

1. Navigate to the dashboard login page
2. Use the credentials above to login
3. In development mode, you can click "使用測試帳號" to auto-fill the credentials

## Troubleshooting

If you get a 500 error when logging in:
1. Check that the admin_users table exists in your Supabase database
2. Verify the admin user was created by running:
   ```sql
   SELECT id, email, username, role, is_active
   FROM admin_users
   WHERE email = 'admin@blackswamp.com';
   ```
3. Ensure your `.env.local` file points to the correct Supabase URL

## Security Notes

- Change the default admin password immediately after first login
- The password uses bcrypt hashing for security
- Failed login attempts are tracked and logged