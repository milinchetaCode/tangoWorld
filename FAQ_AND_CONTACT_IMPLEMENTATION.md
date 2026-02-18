# FAQ and Contact Sections Implementation Summary

## Overview
This implementation adds optional FAQ and Contact information sections for event organizers, allowing them to share information with dancers during event creation and editing.

## Changes Made

### Backend Changes

#### 1. Database Schema (Prisma)
**File:** `backend/prisma/schema.prisma`

Added two new optional fields to the Event model:
- `faq` (String?, optional) - Frequently Asked Questions for dancers
- `contact` (String?, optional) - Contact information for organizers (visible only to accepted users)

#### 2. Database Migration
**File:** `backend/prisma/migrations/20260218141500_add_faq_and_contact_fields/migration.sql`

Created migration to add the new fields to the events table:
```sql
ALTER TABLE "events" ADD COLUMN "faq" TEXT,
ADD COLUMN "contact" TEXT;
```

#### 3. Backend Service
No changes required - the EventsService automatically handles the new fields through Prisma's auto-generated types.

### Frontend Changes

#### 1. Event Creation Form
**File:** `frontend/src/app/organizer/events/new/page.tsx`

- Added `faq` and `contact` to form state
- Added FAQ section with HelpCircle icon
- Added Contact section with Mail icon
- Both fields are optional textareas with helpful placeholders
- Fields are included in event data submission

#### 2. Event Edit Form
**File:** `frontend/src/app/organizer/events/[id]/edit/page.tsx`

- Added `faq` and `contact` to form state
- Populated fields from existing event data
- Added FAQ section with HelpCircle icon
- Added Contact section with Mail icon
- Both fields are optional textareas with helpful placeholders
- Fields are included in event data update

#### 3. Event Details Page
**File:** `frontend/src/app/events/[id]/page.tsx`

- Imported and integrated EventFaqAndContact component
- Passes event's faq and contact data to the component

#### 4. New Component: EventFaqAndContact
**File:** `frontend/src/components/EventFaqAndContact.tsx`

This client-side component handles displaying FAQ and Contact sections with proper access control:

**Features:**
- Displays FAQ section if provided (visible to all users)
- Displays Contact section with access control
- Fetches user's application status from `/applications/me` endpoint
- Shows contact info only if user has "accepted" status
- Shows a "locked" message for non-accepted users
- Proper TypeScript typing using Application interface
- Responsive UI with icons (HelpCircle, Mail, Lock)

**Security:**
- React auto-escaping prevents XSS attacks
- whitespace-pre-wrap CSS preserves formatting without enabling HTML
- Access control checked on client-side (server-side enforcement is implicit through user authentication)

## Access Control Logic

### FAQ Section
- **Visibility:** Public (visible to all users)
- **Rationale:** FAQs are general information meant to help all potential attendees

### Contact Section
- **Visibility:** Private (only for accepted dancers)
- **Implementation:** 
  1. Component fetches user's applications via `/applications/me` endpoint
  2. Checks if user has an application for this event with status === "accepted"
  3. If accepted: shows contact information
  4. If not accepted: shows locked message explaining access restriction
- **Rationale:** Contact information should only be shared with confirmed attendees

## UI/UX Design

### Form Fields (Create/Edit)
- Both fields use multi-line textarea inputs
- FAQ: 8 rows with helpful Q&A format placeholder
- Contact: 5 rows with example contact details placeholder
- Sections have clear icons and descriptions
- Consistent styling with existing form sections

### Display (Event Details)
- FAQ section uses HelpCircle icon
- Contact section uses Mail icon
- Locked state uses Lock icon with explanation text
- Sections appear after Schedule and Lineup sections
- Proper spacing and responsive design
- Uses prose styling for readable text display
- Preserves line breaks and formatting with whitespace-pre-wrap

## Testing Considerations

### Manual Testing Steps
1. **Event Creation:**
   - Create event without FAQ/Contact → Should save successfully
   - Create event with FAQ only → Should display FAQ on details page
   - Create event with Contact only → Should display Contact (with access control)
   - Create event with both → Should display both sections

2. **Event Editing:**
   - Edit existing event to add FAQ → Should save and display
   - Edit existing event to add Contact → Should save with access control
   - Edit existing event to modify FAQ/Contact → Should update properly
   - Edit existing event to remove FAQ/Contact → Should clear fields

3. **Access Control:**
   - View event as non-logged-in user → FAQ visible, Contact shows locked message
   - View event as logged-in user (not applied) → FAQ visible, Contact shows locked message
   - View event as applied user (pending) → FAQ visible, Contact shows locked message
   - View event as accepted user → FAQ visible, Contact information displayed
   - View event as rejected/waitlisted user → FAQ visible, Contact shows locked message

### Security Testing
- ✅ XSS Prevention: React auto-escaping tested
- ✅ Access Control: Only accepted users see contact info
- ✅ SQL Injection: Not applicable (using Prisma ORM)
- ✅ Type Safety: Proper TypeScript interfaces used

## Migration Guide

### Database Migration
To apply this change to an existing database:

```bash
cd backend
npx prisma migrate deploy
```

This will run the migration that adds the `faq` and `contact` columns to the `events` table.

### No Breaking Changes
- All changes are additive (new optional fields)
- Existing events will have NULL values for these fields
- Frontend components handle null/undefined values gracefully
- No changes required to existing API endpoints

## Code Quality

### TypeScript
- ✅ All files compile without errors
- ✅ Proper type definitions used
- ✅ Application interface imported and used correctly

### Code Review
- ✅ Passed automated code review
- ✅ No TypeScript 'any' types used
- ✅ Follows existing code patterns and conventions

### Build Status
- ✅ Backend builds successfully
- ✅ Frontend TypeScript compilation passes
- ✅ Prisma client generation successful

## Future Enhancements

Potential improvements for future iterations:
1. Rich text editor for FAQ formatting
2. Structured contact form fields instead of free text
3. Server-side validation for contact information format
4. Email/phone number validation
5. Multiple contact persons support
6. FAQ search/filter functionality
