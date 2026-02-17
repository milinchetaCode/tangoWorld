# Organizer Approval Process

## Overview
When users request to become organizers on the platform, they submit a request that sets their `organizerStatus` to `"pending"`. An administrator must manually approve these requests before users can create and manage events.

## Quick Start for Admins

### Check a User's Status
```bash
cd backend
npx ts-node prisma/check-user-status.ts user@example.com
```

### Approve a Pending Organizer
```bash
cd backend
npx ts-node prisma/approve-organizer.ts user@example.com
```

That's it! The user must then log out and log back in to access organizer features.

## User Roles and Status

### User Model Fields
- `role`: String with values `"user"`, `"organizer"`, or `"admin"` (default: `"user"`)
- `organizerStatus`: String with values `"none"`, `"pending"`, or `"approved"` (default: `"none"`)

### Status Flow
1. **Initial state**: New users have `role: "user"` and `organizerStatus: "none"`
2. **Request submitted**: User requests organizer status → `role: "organizer"`, `organizerStatus: "pending"`
3. **Approved**: Admin approves → `organizerStatus: "approved"` (user can now create events)

## Approval Process

### When a User Requests Organizer Status
1. User clicks "Request Organizer Status" button on their profile page
2. Backend updates user to: `role: "organizer"`, `organizerStatus: "pending"`
3. Backend issues a new JWT token with updated status
4. User sees "Pending Approval" status on their profile
5. User cannot create events until approved

### How to Approve a Pending Organizer

#### Option 1: Approval Script (Recommended - Easiest)
Use the approval script which handles everything automatically:

```bash
cd backend
npx ts-node prisma/approve-organizer.ts user@example.com
```

This script will:
- Verify the user exists
- Show their current status  
- Update them to `organizerStatus: 'approved'`
- Display clear next steps

#### Option 2: Check and Update Script
First check the user's status, then use the update script:

```bash
# Check user status
cd backend
npx ts-node prisma/check-user-status.ts user@example.com

# If you need to update, edit update-organizer.ts to change the email
# Then run:
npx ts-node prisma/update-organizer.ts
```

**Note**: The `update-organizer.ts` script requires manual editing to change the email address (line 10).

#### Option 3: Direct Database Update
If you have database access, you can update users directly:

```sql
-- View all pending organizers
SELECT id, email, name, surname, role, organizer_status 
FROM users 
WHERE organizer_status = 'pending';

-- Approve a specific user
UPDATE users 
SET organizer_status = 'approved' 
WHERE email = 'user@example.com';
```

#### Option 4: Use Prisma Studio (Visual Interface)
```bash
cd backend
npx prisma studio
```
Then navigate to the `users` table and update the `organizerStatus` field to `"approved"`.

## Prerequisites
- The database must be running and accessible
- The user must have already submitted an organizer request
- Node.js and npm must be installed (for script method)

## After Approval

### What the User Must Do
After an admin approves their request, users must:
1. **Log out** of the application
2. **Log back in** to receive a new JWT token with `organizerStatus: "approved"`
3. The "Organizer" menu link will now appear in the navigation
4. They can now create and manage events

### What Approved Organizers Can Do
Once approved, organizers can:
- See the "Organizer" menu link in the navigation bar
- Create new tango events
- Edit their own events
- View all applicants for their events
- Accept, reject, or waitlist applicants
- Manage event capacity
- Mark participants as paid
- Access the organizer dashboard

## Authorization Rules

### Frontend
- The "Organizer" menu link only displays when `user.organizerStatus === 'approved'`
- Checks are in `/frontend/src/components/Navbar.tsx` (lines 57 and 109)

### Backend
- Event creation endpoint requires `organizerStatus: 'approved'` (enforced by RolesGuard)
- Check is in `/backend/src/events/events.controller.ts` via `@SetMetadata('status', ['approved'])`
- Same check applies to event editing and deletion

## Security Notes

- Users can only request organizer status for themselves
- Only administrators should approve organizer requests
- The JWT token contains the `organizerStatus`, so users must re-login after approval
- This is a manual process by design - there is no automatic approval

## Future Enhancements

Consider implementing:
- Admin dashboard for managing organizer approvals
- Email notifications when status changes
- Automated approval based on verification criteria
- Token refresh endpoint to avoid requiring re-login
