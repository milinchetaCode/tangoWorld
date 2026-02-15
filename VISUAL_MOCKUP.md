# Manage Event Page - Visual Mockup

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                                     │
│                                                                          │
│ Manage: Tango Marathon Buenos Aires 2026                               │
│ Total Capacity: 27 / 50 • Paid: 15 / 27                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬─────────────────────────────────────┐
│ Accepted Dancers                │ Status Summary                      │
├─────────────────────────────────┼─────────────────────────────────────┤
│                                 │                                     │
│ Male: 15 / 20            75%    │ Applied                             │
│ [████████████░░░░]              │ M: 5  F: 3  (8)                    │
│                                 │                                     │
│ Female: 12 / 20          60%    │ Waitlisted                          │
│ [████████░░░░░░░]               │ M: 2  F: 1  (3)                    │
│                                 │                                     │
│                                 │ Rejected                            │
│                                 │ M: 1  F: 0  (1)                    │
└─────────────────────────────────┴─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Participants                                                            │
│ Manage applications and payment status.                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Maria González (F) [Paid]                    [Accepted]                │
│ maria@email.com • Applied: Jan 10, 2026      [⏱] [✗] [💵]            │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ John Smith (M)                                [Applied]                 │
│ john@email.com • Applied: Jan 12, 2026        [✓] [⏱] [✗]             │
│ Dietary needs: Vegetarian                                               │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Ana Silva (F)                                 [Waitlisted]              │
│ ana@email.com • Applied: Jan 15, 2026         [✓] [✗]                  │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Carlos Rodriguez (M)                          [Rejected]                │
│ carlos@email.com • Applied: Jan 8, 2026       [✓] [⏱]                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Color Legend

### Status Badges
- 🔵 **Applied** - Blue background (bg-blue-100, text-blue-800)
- 🟢 **Accepted** - Green background (bg-green-100, text-green-800)
- 🟡 **Waitlisted** - Yellow background (bg-yellow-100, text-yellow-900)
- 🔴 **Rejected** - Red background (bg-red-100, text-red-800)

### Action Buttons
- ✓ **Accept** - Green icon (text-green-600)
- ⏱ **Waitlist** - Yellow icon (text-yellow-600)
- ✗ **Reject** - Red icon (text-red-600)
- 💵 **Payment** - Green when paid, gray when unpaid

### Progress Bars
- 🔵 **Male** - Blue bar (bg-blue-600)
- 🟣 **Female** - Pink bar (bg-pink-600)
- ⚪ **Background** - Light gray (bg-gray-200)

### Text Colors
- **Headings** - Dark gray (text-gray-900)
- **Body** - Medium gray (text-gray-700)
- **Secondary** - Light gray (text-gray-600)

## Interaction Flow

### Accepting an Application
1. Organizer clicks the ✓ button
2. Status changes from "Applied" to "Accepted"
3. Badge color changes from blue to green
4. 💵 Payment button appears
5. Statistics update automatically

### Marking Payment as Done
1. Organizer clicks the 💵 button (gray)
2. Button changes to green background
3. "Paid" badge appears next to name
4. Payment counter in header updates

### Status Change
1. Click any action button (✓, ⏱, ✗)
2. API call to backend with authorization
3. Backend verifies organizer ownership
4. Status updated in database
5. UI updates immediately
6. Statistics recalculate

### Error Handling
If unauthorized:
```
┌─────────────────────────────────────┐
│ ⚠️ Failed to update status:         │
│ Not authorized                      │
│                                     │
│ [OK]                                │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 640px)
- Statistics cards side-by-side
- Participant info and buttons on same line
- Full email addresses visible

### Mobile (< 640px)
- Statistics cards stacked vertically
- Participant info and buttons stack
- Email truncates if too long
- Buttons remain accessible

## Key Features Highlight

### 1. Visual Capacity Tracking
The progress bars give immediate feedback:
- Blue bar at 75% = male capacity nearly full
- Pink bar at 60% = female capacity has room
- Organizer can see balance at a glance

### 2. Gender Balance Overview
Status summary shows distribution:
- Applied: 5 males, 3 females (can accept more females)
- Waitlisted: 2 males, 1 female (gender balanced)
- Rejected: 1 male, 0 females (minimal rejections)

### 3. Payment Tracking
Header shows: "Paid: 15 / 27"
- 15 out of 27 accepted dancers have paid
- 12 still need to pay
- Easy to follow up with unpaid dancers

### 4. Quick Actions
Each participant row has immediate actions:
- No need to go to separate pages
- Status changes are instant
- Visual feedback is clear
- Undo is possible (just click another button)

## Accessibility Features

1. **Color + Icon**: Status shown with both color and icon
2. **High Contrast**: All text meets WCAG standards
3. **Semantic HTML**: Proper heading hierarchy
4. **Keyboard Navigation**: All buttons are keyboard accessible
5. **Screen Reader**: Labels and ARIA attributes where needed

## Performance Optimizations

1. **Local State Updates**: Immediate UI feedback before backend confirms
2. **Conditional Rendering**: Only show relevant buttons
3. **Efficient Calculations**: Statistics computed once per render
4. **Minimal Re-renders**: React state updates are batched

## Summary

The new manage event page provides:
- ✅ Clear visual hierarchy
- ✅ At-a-glance statistics
- ✅ Easy-to-use controls
- ✅ Professional appearance
- ✅ Gender balance tracking
- ✅ Payment management
- ✅ Responsive design
- ✅ Accessible interface
