# User Role Update Solution

## Problem
Update the user `organizer@example.com` to have organizer privileges on the Tango World platform.

## Solution
Created a one-time script that updates the user's role and organizer status in the database.

## Files Created

### 1. `/backend/prisma/update-organizer.ts`
A TypeScript script that:
- Connects to the Prisma database
- Finds the user `organizer@example.com`
- Updates their `role` to `"organizer"`
- Updates their `organizerStatus` to `"approved"`
- Provides clear console output showing before/after status

### 2. `/backend/prisma/UPDATE_ORGANIZER_README.md`
Documentation that explains:
- What the script does
- Prerequisites for running it
- Step-by-step instructions
- Expected output
- Alternative methods (using seed script)

## Database Schema Reference

The User model has two relevant fields:
- `role`: String with values "user", "organizer", or "admin" (default: "user")
- `organizerStatus`: String with values "none", "pending", or "approved" (default: "none")

For a user to be a full organizer, both fields should be set:
- `role: "organizer"`
- `organizerStatus: "approved"`

## How to Use

1. Ensure the database is running and accessible
2. Navigate to the backend directory: `cd backend`
3. Run the script: `npx ts-node prisma/update-organizer.ts`

The script is:
- **Idempotent**: Can be run multiple times safely
- **Safe**: Checks if user exists before updating
- **Informative**: Shows clear before/after status

## What the User Can Do After Update

Once updated, `organizer@example.com` can:
- Create new tango events
- Edit their own events
- View all applicants for their events
- Accept, reject, or waitlist applicants
- Manage event capacity
- Mark participants as paid
- Access the organizer dashboard

## Alternative: Fresh Database Setup

If starting with a fresh database, the seed script (`prisma/seed.ts`) already creates the `organizer@example.com` user with correct permissions. Simply run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## Security Note

This is a manual, one-time administrative action. In production:
- Only database administrators should run this script
- The script should be run in a secure environment
- Consider implementing a proper admin panel for role management in the future
