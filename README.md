# Tango World

## Overview

**Tango World** is a modern, mobile-first web application for discovering, promoting, and managing tango events.

The platform is designed for:
- **Dancers**, who search for events and apply to attend
- **Organizers**, who create events and manage attendance

The MVP focuses on **event discovery and event management**.  
Online payments, messaging, and notifications are intentionally out of scope.

The platform is global, with an initial focus on **Europe**.

---

## Product Scope (MVP)

### In Scope
- Public browsing and discovery of tango events
- SEO-friendly, shareable event detail pages
- User accounts and profiles
- Event creation and editing
- Attendance application and approval workflow
- Organizer dashboard (core value)
- Manual payment tracking (external bank transfer)

### Explicitly Out of Scope
- Online payment processing
- Messaging or chat
- Email or push notifications
- Native mobile apps
- Multilingual support
- Calendar integrations
- Platform-level admin dashboard

---

## User Roles

### Anonymous Visitor
- Browse events
- Search and filter events
- View event details

### Registered User (Dancer)
- Has a user profile
- Applies to events
- Views application and payment status
- Can request cancellation (status change handled by organizer in MVP)

### Organizer
- Same account as a dancer (no separate login)
- Creates and manages events
- Manages attendance and payment status
- Uses the organizer dashboard

---

## Core Features

### Event Discovery
- Search events by:
  - City
  - Date
  - Event name
- Filter:
  - Hide fully booked events
- No login required for browsing

### Event Creation & Management
- Multi-day events supported
- No recurring events (MVP)
- Event fields:
  - Name
  - City
  - Start and end dates
  - Daily schedule (times per day)
  - Venue (embedded for MVP)
  - Guests / stars
  - DJs (per day)
  - Maximum number of attendees:
    - Total
    - Male
    - Female

### Organizer Dashboard
- Create and edit events
- View all applicants
- Accept, reject, waitlist, or cancel participants
- See capacity and overbooking warnings
- Manually mark participants as paid

---

## Attendance Rules & Edge Cases (Authoritative)

This section defines the **exact business rules**.  
AI agents and contributors must not introduce alternative logic.

---

### Attendance Capacity

Each event defines:
- `max_guests_total`
- `max_guests_male`
- `max_guests_female`

Rules:
- Capacity is calculated **only using accepted participants**
- Applied and waitlisted users do not count toward capacity
- An event is considered full if **any relevant limit is reached**

---

### Gender Handling

- Gender is required in the user profile
- Gender is binary for MVP: `male`, `female`
- Gender is selected at profile level
- Gender cannot be changed per event
- No gender switching or rebalancing logic in MVP

---

### Attendance Statuses

Each attendance record has exactly one status:
- `applied`
- `accepted`
- `waitlisted`
- `rejected`
- `cancelled`

Rules:
- One attendance record per user per event
- Duplicate applications are not allowed

---

### Application Flow

1. Logged-in user applies to an event
2. Initial status:
   - `applied` if capacity is available
   - `waitlisted` if any relevant capacity is full
3. Organizer reviews applications manually

---

### Organizer Decisions

Organizers can:
- Accept an applicant
- Reject an applicant
- Move an applicant to the waitlist
- Cancel an accepted participant
- Mark a participant as paid

Rules:
- Organizers can accept participants even if the event is full
- The system must never auto-reject applicants
- Organizer actions always override automatic logic
- UI must show confirmation for organizer actions

---

### Overbooking Rules

- Overbooking is allowed by design
- The system must:
  - Allow acceptance beyond limits
  - Display clear warnings when limits are exceeded
- Overbooking is visible in the organizer dashboard

Example:
> “Female capacity exceeded by 1 participant”

---

### Waitlist Behavior

#### Adding to Waitlist
A user is placed on the waitlist if:
- Capacity is full at application time, or
- Organizer explicitly moves them to `waitlisted`

#### Promotion from Waitlist
- Promotion is **manual only**
- No automatic promotion
- Organizer chooses who to promote
- Capacity warnings apply when promoting

---

### Cancellation Rules

#### Who Can Cancel
- Organizer: can cancel any participant
- Dancer: can request cancellation, but organizer performs the status change (MVP)

#### Effects of Cancellation
- Status becomes `cancelled`
- Capacity slot is freed
- No automatic waitlist promotion occurs

---

### Payment Tracking (MVP)

- Payments happen externally (bank transfer)
- System tracks payment using:
  - `is_paid: true | false`
- Only organizers can update payment status
- Payment status does not affect:
  - acceptance
  - capacity
  - visibility

---

### Fully Booked Logic

An event is considered **fully booked** if:
- `accepted_male >= max_guests_male`
  OR
- `accepted_female >= max_guests_female`
  OR
- `accepted_total >= max_guests_total`

Search filter:
- “Hide fully booked events” hides events meeting the above condition

---

### Explicit Non-Goals (Attendance)

The system must not:
- Auto-promote waitlisted users
- Auto-rebalance genders
- Enforce payment before acceptance
- Implement refunds
- Implement deadline-based rules

---

## Data Model (MVP)

### User
- id
- name
- surname
- email
- city
- gender
- dietaryNeeds

### OrganizerProfile
- user_id (1–1 with User)
- phone_number

### Event
- id
- name
- city
- start_date
- end_date
- schedule (per day)
- venue (embedded)
- max_guests_total
- max_guests_male
- max_guests_female
- organizer_id

### Guest (Stars / DJs)
- id
- event_id
- name
- role (star, DJ)
- day (optional)

### Attendance
- id
- event_id
- user_id
- status
- is_paid

---

## Technical Architecture

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Mobile-first responsive design
- SEO-optimized pages

### Backend
- Node.js
- NestJS
- PostgreSQL
- Prisma ORM
- REST API

### Authentication
- Email/password
- Google OAuth
- Auth.js (NextAuth)

### Hosting & Deployment
- Render.com
- Environments:
  - Local development
  - Production
- No staging environment for MVP

---

## Engineering & UX Principles

- UX polish has priority over feature breadth
- Keep code simple and explicit
- Prefer clarity over abstraction
- Avoid premature optimization

---

## Testing Strategy

- Basic unit tests only
- Focus on:
  - backend services
  - attendance and capacity logic
- Jest for backend testing
- No frontend tests in MVP

---

## Guidance for AI Agents

Agents should:
- Follow this README as the single source of truth
- Ask before changing business rules
- Avoid implementing features marked as out of scope
- Preserve UX quality and data integrity
