# One-Time Organizer Update Script

## Purpose
This script updates the user `organizer@example.com` to have organizer privileges on the platform by setting:
- `role` to `"organizer"`
- `organizerStatus` to `"approved"`

## Prerequisites
- The database must be running and accessible
- The user `organizer@example.com` must already exist in the database
- Node.js and npm must be installed

## How to Run

1. Navigate to the backend directory:
```bash
cd backend
```

2. Ensure your environment is set up with the correct DATABASE_URL in `.env` file:
```
DATABASE_URL="postgresql://user:password@localhost:5432/tangoworld"
```

3. Run the script using ts-node:
```bash
npx ts-node prisma/update-organizer.ts
```

## Expected Output

If the user exists and the update is successful, you should see:
```
Updating organizer@example.com user status...
Current user status:
  - Role: user
  - Organizer Status: none

✅ User updated successfully!
New user status:
  - Role: organizer
  - Organizer Status: approved

The user organizer@example.com can now create and manage events.
```

If the user doesn't exist:
```
Updating organizer@example.com user status...
User organizer@example.com not found in database.
Please ensure the user exists before running this script.
```

## What This Does

After running this script, the user `organizer@example.com` will be able to:
- Create new events
- Edit existing events they've created
- Manage event applications (accept, reject, waitlist)
- Access the organizer dashboard

## Safety

This script is idempotent - running it multiple times will not cause any issues. It will simply update the same user record each time.

## Alternative: Using the Seed Script

If you're starting with a fresh database, you can simply run the seed script instead:
```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

The seed script will create the `organizer@example.com` user with the correct role and status automatically.
