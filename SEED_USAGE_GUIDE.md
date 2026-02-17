# Database Seed Script Usage Guide

## Overview
The seed script (`backend/prisma/seed.ts`) is a development tool that populates the database with sample data for testing and development purposes.

## 🛡️ Production Safety
**Multiple layers of protection prevent accidental data loss:**
1. The seed configuration has been **removed from package.json** - Prisma will not automatically run the seed during any operations
2. The seed script includes environment protection - it refuses to run if `NODE_ENV=production`
3. The seed command has been removed from the deployment pipeline in render.yaml

## ⚠️ Important: Seed Script Behavior
The seed script **deletes all existing events and applications** before inserting sample data:
```typescript
// Clear existing events and applications to avoid duplicates
await prisma.application.deleteMany();
await prisma.event.deleteMany();
```

This is **intentional for development** but **destructive for production data**.

## Usage

### For Development (Manual Execution Only)
Since the seed configuration has been removed from package.json, you need to run it manually with ts-node:
```bash
cd backend
npx ts-node prisma/seed.ts
```

**Note:** Make sure NODE_ENV is not set to "production" or the script will refuse to run.

### For Production
**❌ DO NOT run the seed script in production!**

The seed script has been removed from the production deployment pipeline (`render.yaml`) to prevent data loss.

## What the Seed Script Creates

### Users
1. **Organizer Account**
   - Email: `organizer@example.com`
   - Password: `password123`
   - Role: organizer (approved)

2. **Regular User Account**
   - Email: `user@example.com`
   - Password: `password123`
   - Role: user

### Events
1. **Berlin Tango Marathon**
   - May 15-17, 2026
   - Capacity: 200 (100 male, 100 female)

2. **Paris Spring Festival**
   - April 10-12, 2026
   - Capacity: 150 (75 male, 75 female)

3. **Buenos Aires Tango Week**
   - August 20-27, 2026
   - Capacity: 500 (250 male, 250 female)

### Applications
- One accepted application from the regular user to the Berlin Tango Marathon

## When to Use the Seed Script

### ✅ Good Use Cases
- Setting up a fresh local development database
- Resetting your development database to a known state
- Creating test accounts for development
- Providing sample data for frontend development

### ❌ Bad Use Cases
- Running in production environments
- Running in staging with real user data
- Automated execution in deployment pipelines
- Any scenario where data preservation is important

## Deployment Configuration

The production deployment (`render.yaml`) now uses:
```yaml
startCommand: npx prisma migrate deploy && npx prisma generate && npm run start:prod
```

Note: **No seed script** in the start command. This ensures:
- ✅ Production data persists across deployments
- ✅ Database migrations run automatically
- ✅ Schema updates are applied
- ✅ User data is preserved

## Troubleshooting

### "The seed script won't run / exits with error"
If you see an error like `❌ ERROR: Cannot run seed script in production environment!`, this is the safety mechanism working correctly. To run the seed:
1. Make sure you're in a development environment
2. Either unset NODE_ENV or set it to "development":
   ```bash
   # Option 1: Unset NODE_ENV
   unset NODE_ENV
   npx ts-node prisma/seed.ts
   
   # Option 2: Set to development
   NODE_ENV=development npx ts-node prisma/seed.ts
   ```

### "I need to reset my development database"
```bash
cd backend
npx prisma migrate reset  # This will drop the database and run migrations
# If you need sample data, manually run the seed after:
npx ts-node prisma/seed.ts
```

### "I want to add initial data to production"
1. Create the data through the application UI, OR
2. Write a one-time migration script (not the seed script), OR
3. Manually insert data using SQL (not recommended)

### "I accidentally ran seed in production"
**Good news:** With the new environment protection (added in this fix), the seed script will refuse to run if NODE_ENV=production, preventing data loss.

**If you somehow bypassed this protection**, you'll need to:
1. Restore from a database backup (if available)
2. Recreate the data manually
3. Contact Render support about database backups

## Best Practices

1. **Never** include `npx prisma db seed` in production deployment scripts
2. **Always** review what a seed script does before running it
3. **Keep** seed scripts idempotent where possible (though this one intentionally isn't)
4. **Consider** environment checks if you must include seeding in automated pipelines
5. **Maintain** separate seed scripts for different environments if needed

## Related Files
- `backend/prisma/seed.ts` - The seed script itself
- `backend/package.json` - Contains the seed command configuration
- `render.yaml` - Production deployment configuration
- `backend/prisma/schema.prisma` - Database schema
