# Quick Reference: Organizer Approval Commands

For administrators who need to manage organizer approvals, here are the essential commands:

## 📋 List All Pending Approvals

```bash
cd backend
npx ts-node prisma/list-pending-organizers.ts
```

Shows all users waiting for organizer approval with their details and approval commands.

## ✅ Approve a User

```bash
cd backend
npx ts-node prisma/approve-organizer.ts user@example.com
```

Approves a specific user's organizer request.

## 🔍 Check a User's Status

```bash
cd backend
npx ts-node prisma/check-user-status.ts user@example.com
```

Shows detailed status information for a specific user.

---

## 📚 Full Documentation

For comprehensive documentation with examples, troubleshooting, and alternative methods, see:

- **[backend/SHELL_COMMANDS.md](backend/SHELL_COMMANDS.md)** - Complete command reference with detailed examples
- **[backend/prisma/UPDATE_ORGANIZER_README.md](backend/prisma/UPDATE_ORGANIZER_README.md)** - Detailed organizer approval process

---

## 🎯 Quick Workflow

1. **List pending requests**: `npx ts-node prisma/list-pending-organizers.ts`
2. **Approve a user**: `npx ts-node prisma/approve-organizer.ts user@example.com`
3. **Notify the user** that they've been approved and need to log out/log in

That's it! The user must log out and log back in to see the organizer menu.
