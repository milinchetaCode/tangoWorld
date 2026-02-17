# Organizer Approval Workflow

## Overview
This document describes the organizer approval workflow on the Tango World platform.

## Problem
Users need to be able to request organizer privileges, but these requests should require manual approval by administrators before users can create and manage events.

## Solution
Implemented a two-step organizer approval workflow:

1. **User Request**: Users can request organizer status from their profile page
2. **Admin Approval**: Administrators manually approve pending requests using database scripts

## User Flow

### Requesting Organizer Status
1. User navigates to their profile page (`/profile`)
2. If their status is `"none"`, they see a "Request Organizer Status" button
3. User clicks the button and confirms they understand it's for event organizers
4. Backend updates their status to `"pending"` and issues a new JWT token
5. User sees "Pending Approval" status on their profile
6. User cannot create events until approved

### After Approval
1. Administrator approves the user (see Admin Process below)
2. User must log out and log back in to receive updated JWT token
3. User sees "Organizer" status and the "Organizer" menu appears in navigation
4. User can now create and manage events

## Database Schema

The User model has two relevant fields:
- `role`: String - "user", "organizer", or "admin" (default: "user")
- `organizerStatus`: String - "none", "pending", or "approved" (default: "none")

For a user to be a full organizer:
- `role: "organizer"`
- `organizerStatus: "approved"`

## Admin Process

### Checking User Status
To check a user's current status:

```bash
cd backend
npx ts-node prisma/check-user-status.ts user@example.com
```

This will show:
- User's current role and organizer status
- Whether they can create events
- What actions need to be taken

### Viewing Pending Requests
Administrators can query pending organizers:

```sql
SELECT id, email, name, surname, created_at
FROM users
WHERE organizer_status = 'pending'
ORDER BY created_at DESC;
```

### Approving a Request

#### Method 1: Approval Script (Easiest)
```bash
cd backend
npx ts-node prisma/approve-organizer.ts user@example.com
```

This script will:
- Check if the user exists
- Show current status
- Update to `organizerStatus: 'approved'`
- Display next steps for the user

#### Method 2: Update Script
1. Edit `/backend/prisma/update-organizer.ts` 
2. Change the email on line 10 to the user's email
3. Run:
```bash
cd backend
npx ts-node prisma/update-organizer.ts
```

#### Method 3: Direct SQL
```sql
UPDATE users 
SET organizer_status = 'approved' 
WHERE email = 'user@example.com';
```

#### Method 4: Prisma Studio
```bash
cd backend
npx prisma studio
```
Navigate to users table and update `organizerStatus` to "approved"

## Files Modified

### Backend
1. `/backend/src/users/users.service.ts`
   - Updated `requestOrganizer()` to set `organizerStatus: 'pending'` instead of auto-approving
   - Added documentation explaining the approval workflow

2. `/backend/src/users/users.controller.ts`
   - Modified `requestOrganizer()` endpoint to return new JWT token with updated status
   - Injected `AuthService` to generate new tokens

3. `/backend/src/users/users.module.ts`
   - Imported `AuthModule` to allow token generation

4. `/backend/src/users/users.controller.spec.ts`
   - Added tests for `requestOrganizer()` endpoint
   - Tests verify token refresh and authorization

### Frontend
1. `/frontend/src/app/profile/page.tsx`
   - Updated `handleRequestOrganizer()` to accept new JWT token from API
   - Stores updated token in localStorage immediately
   - Shows appropriate message about pending approval

### Documentation
1. `/backend/prisma/UPDATE_ORGANIZER_README.md`
   - Comprehensive guide for administrators
   - Multiple approval methods documented
   - Authorization rules explained

## Authorization Rules

### Frontend Authorization
- File: `/frontend/src/components/Navbar.tsx`
- Lines: 57, 109
- Logic: `user?.organizerStatus === 'approved'`
- Effect: "Organizer" menu link only shows for approved organizers

### Backend Authorization
- File: `/backend/src/events/events.controller.ts`
- Lines: 34, 47, 54
- Decorator: `@SetMetadata('status', ['approved'])`
- Guard: `RolesGuard` checks JWT payload's `organizerStatus`
- Effect: Event creation/editing/deletion requires approved status

## Security

### Request Security
- Users can only request organizer status for themselves (verified in controller)
- Endpoint is protected by JWT authentication
- User ID in JWT must match the ID in request parameters

### Token Security
- New JWT token issued immediately after status change
- Token contains updated `organizerStatus` in payload
- Frontend stores new token to enable immediate UI updates
- Full authorization still requires login after admin approval

## Current State vs Previous Implementation

### Before (Auto-Approval)
- Users were automatically approved when requesting organizer status
- No manual review process
- `organizerStatus` set to `"approved"` immediately

### After (Manual Approval)
- Users are set to `"pending"` when requesting organizer status
- Administrators must manually approve requests
- Users must re-login after approval to get updated JWT token
- Clear separation between request and approval

## What Users Can Do After Approval

Approved organizers can:
- Create new tango events
- Edit their own events
- View all applicants for their events
- Accept, reject, or waitlist applicants  
- Manage event capacity
- Mark participants as paid
- Access the organizer dashboard

## Future Enhancements

Consider implementing:
- Admin dashboard UI for approving/rejecting requests
- Email notifications when status changes  
- Audit log of approval actions
- Token refresh endpoint to avoid re-login requirement
- Rejection workflow with feedback messages
- Batch approval functionality
