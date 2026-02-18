# Create Test Data Script

This script generates test data for the TangoWorld application database. It's designed to be run manually on the Render shell or any environment connected to the production database.

## What It Creates

- **5 test users** with realistic profiles
- **2 events** organized by the existing `organizer@example.com`
- **8 applications** (registrations) with different statuses:
  - Accepted (paid): 2
  - Accepted (not paid): 1
  - Applied: 2
  - Waitlisted: 1
  - Rejected: 1
  - Cancelled: 1

## Prerequisites

- The organizer account `organizer@example.com` must exist in the database
- The organizer must have `organizerStatus` set to `'approved'`

## How to Run on Render Shell

1. Open your Render dashboard
2. Navigate to your backend service
3. Click on "Shell" tab to open the shell
4. Run the following command:

```bash
npx ts-node prisma/create-test-data.ts
```

## Test Users Created

All test users have the password: `password123`

| Email | Name | City | Gender | Dietary Needs |
|-------|------|------|--------|---------------|
| alice.dancer@test.com | Alice Dancer | Barcelona | Female | Vegetarian |
| bob.leader@test.com | Bob Leader | Madrid | Male | None |
| charlie.swing@test.com | Charlie Swing | Valencia | Male | Gluten-free |
| diana.follower@test.com | Diana Follower | Seville | Female | None |
| edward.tango@test.com | Edward Tango | Bilbao | Male | Vegan |

## Events Created

1. **Mediterranean Tango Festival**
   - Location: Barcelona, Spain
   - Date: June 12-14, 2026
   - Capacity: 120 (60 male, 60 female)
   - Pricing options available (full event and daily)

2. **Summer Milonga Nights**
   - Location: Valencia, Spain
   - Date: July 20-22, 2026
   - Capacity: 80 (40 male, 40 female)
   - Pricing options available

## Application Distribution

### Event 1 (Mediterranean Tango Festival):
- Alice: Accepted + Paid
- Bob: Accepted (payment pending)
- Charlie: Applied
- Diana: Waitlisted
- Edward: Rejected

### Event 2 (Summer Milonga Nights):
- Alice: Applied
- Charlie: Cancelled
- Edward: Accepted + Paid

## Running Multiple Times

The script uses `upsert` for users, so running it multiple times will:
- **NOT** create duplicate users (safe to run multiple times)
- **WILL** create new events each time
- **WILL** create new applications

If you need to clean up test data, you can delete the test events and users manually or use the Prisma Studio.

## Troubleshooting

### Error: "organizer@example.com does not exist"
- Make sure the organizer account exists in the database
- Check that the email is exactly `organizer@example.com`

### Error: "organizer@example.com is not approved"
- Run the approve-organizer script:
  ```bash
  npx ts-node prisma/approve-organizer.ts organizer@example.com
  ```

### Database Connection Issues
- Verify that the `DATABASE_URL` environment variable is set correctly
- Check that the database is accessible from the Render shell
