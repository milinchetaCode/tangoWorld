# Shell Commands for Managing Organizer Approvals

This document provides all the shell commands you need to manage organizer approvals in the Tango World application.

## Prerequisites

Before running any commands:
1. Navigate to the backend directory: `cd backend`
2. Ensure the database is running and accessible
3. Ensure you have Node.js and npm installed

## Available Commands

### 1. List All Users Waiting for Approval

To see all users who are waiting for organizer approval:

```bash
cd backend
npx ts-node prisma/list-pending-organizers.ts
```

**What this shows:**
- List of all users with `organizerStatus: 'pending'`
- Their name, email, city, and request date
- The command to approve each user

**Example output:**
```
📋 Listing all users waiting for organizer approval...

Found 2 user(s) waiting for approval:

═════════════════════════════════════════════════════════════════

1. John Doe
─────────────────────────────────────────────────────────────────
   Email: john@example.com
   City: Berlin
   User ID: abc-123-def
   Request Date: 2026-02-15
   Status: pending

   To approve this user, run:
   npx ts-node prisma/approve-organizer.ts john@example.com
```

---

### 2. Check a Specific User's Status

To check the status of a specific user by their email:

```bash
cd backend
npx ts-node prisma/check-user-status.ts <email>
```

**Example:**
```bash
npx ts-node prisma/check-user-status.ts john@example.com
```

**What this shows:**
- User's name, email, and user ID
- Current role and organizer status
- Whether the user can create events
- Next steps to take (if approval is needed)

**Example output:**
```
Checking status for: john@example.com

User Information:
─────────────────────────────────────────
  Name: John Doe
  Email: john@example.com
  User ID: abc-123-def
  Created: 2026-02-15T10:30:00.000Z

Current Status:
─────────────────────────────────────────
  Role: organizer
  Organizer Status: pending

❌ This user CANNOT create events

Reason:
  - Organizer status is "pending" (waiting for admin approval)

To approve this user, run:
  npx ts-node prisma/approve-organizer.ts john@example.com
```

---

### 3. Approve a User

To approve a user's organizer request:

```bash
cd backend
npx ts-node prisma/approve-organizer.ts <email>
```

**Example:**
```bash
npx ts-node prisma/approve-organizer.ts john@example.com
```

**What this does:**
- Changes user's `organizerStatus` from `pending` to `approved`
- Sets user's `role` to `organizer`
- Displays confirmation and next steps

**Example output:**
```
Approving organizer request for: john@example.com

Current user status:
─────────────────────────────────────────
  Name: John Doe
  Role: organizer
  Organizer Status: pending

✅ User approved successfully!

New user status:
─────────────────────────────────────────
  Role: organizer
  Organizer Status: approved

Next Steps:
─────────────────────────────────────────
  1. Notify john@example.com that they have been approved
  2. User must log out and log back in to the application
  3. After login, the "Organizer" menu will appear
  4. User can now create and manage events
```

---

## Complete Workflow

### Typical Approval Process

1. **User submits organizer request** (via the web application)
   - User goes to their profile page
   - Clicks "Request Organizer Status" button
   - Status changes to `pending`

2. **Admin checks pending requests:**
   ```bash
   cd backend
   npx ts-node prisma/list-pending-organizers.ts
   ```

3. **Admin reviews a specific user** (optional):
   ```bash
   npx ts-node prisma/check-user-status.ts user@example.com
   ```

4. **Admin approves the user:**
   ```bash
   npx ts-node prisma/approve-organizer.ts user@example.com
   ```

5. **Admin notifies the user** (manually, via email or other means)
   - Inform them that they've been approved
   - Instruct them to log out and log back in

6. **User logs out and logs back in**
   - JWT token is refreshed with new status
   - "Organizer" menu appears in navigation
   - User can now create events

---

## Quick Reference

| Task | Command |
|------|---------|
| List all pending users | `npx ts-node prisma/list-pending-organizers.ts` |
| Check specific user | `npx ts-node prisma/check-user-status.ts <email>` |
| Approve a user | `npx ts-node prisma/approve-organizer.ts <email>` |

---

## Organizer Status Values

The `organizerStatus` field can have three values:

- **`none`**: User has not requested organizer status (default for new users)
- **`pending`**: User has requested organizer status and is waiting for approval
- **`approved`**: User has been approved and can create events

---

## Important Notes

### After Approval
- Users **must log out and log back in** after approval
- This is required to refresh the JWT token with the new status
- Without re-login, they won't see the organizer menu or be able to create events

### Security
- Only administrators should run these approval scripts
- These scripts require direct database access
- Users cannot approve themselves
- The approval process is manual by design

### Troubleshooting

**If a user can't create events after approval:**
1. Verify the approval worked: `npx ts-node prisma/check-user-status.ts <email>`
2. Confirm status is `approved`
3. Ask user to:
   - Log out completely
   - Clear browser cache/cookies
   - Log back in
   - Check that the "Organizer" menu appears

---

## Alternative Methods

### Using Prisma Studio (GUI)
```bash
cd backend
npx prisma studio
```
Then navigate to the `users` table and manually update the `organizerStatus` field.

### Using Direct SQL
If you have database access:
```sql
-- List pending organizers
SELECT id, email, name, surname, role, organizer_status 
FROM users 
WHERE organizer_status = 'pending';

-- Approve a specific user
UPDATE users 
SET organizer_status = 'approved', role = 'organizer'
WHERE email = 'user@example.com';
```

---

## Related Documentation

- [UPDATE_ORGANIZER_README.md](./UPDATE_ORGANIZER_README.md) - Detailed organizer approval process documentation
- [README.md](../README.md) - Full application documentation
