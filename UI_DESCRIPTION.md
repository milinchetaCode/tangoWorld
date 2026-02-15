# UI/UX Visual Description

This document describes the visual appearance of the new features since screenshots cannot be taken in the current environment.

## 1. Clear Search Button

### Before Search
**Main Page Hero Section:**
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Discover the Best of Tango                        ║
║                                                           ║
║   Find marathons and festivals globally.                 ║
║   Your next tanda awaits.                                ║
║                                                           ║
║   ┌──────────────────────────────────────────┐          ║
║   │ 🔍 Search by city, event name, or date... │          ║
║   └──────────────────────────────────────────┘          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### After Searching (e.g., "Paris")
**Main Page Hero Section:**
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Discover the Best of Tango                        ║
║                                                           ║
║   Find marathons and festivals globally.                 ║
║   Your next tanda awaits.                                ║
║                                                           ║
║   ┌──────────────────────────────────────────┐          ║
║   │ 🔍 Paris                                   │          ║
║   └──────────────────────────────────────────┘          ║
║                                                           ║
║   ┌──────────────────────────────────────────┐          ║
║   │  ✕  Clear Search & Show All Events       │          ║
║   └──────────────────────────────────────────┘          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Events Section:
╔═══════════════════════════════════════════════════════════╗
║                   Search Results                          ║
║          Found 3 events matching "Paris"                  ║
╚═══════════════════════════════════════════════════════════╝
```

**Visual Design Details:**
- Clear button has semi-transparent white background (white/10)
- Backdrop blur effect for modern glassmorphic look
- Rounded full border (rounded-full)
- White text color
- X icon on the left side
- Hover effect: background changes to white/20
- Smooth transition animations
- Small ring around button (ring-1 ring-white/20)

## 2. Map View Toggle

### Events Section with Toggle
```
╔═══════════════════════════════════════════════════════════╗
║                   Upcoming Events                          ║
║       Handpicked tango events from around the world.      ║
║                                                            ║
║               ┌──────────────────────┐                    ║
║               │ [📋 List View] [🗺️ Map View] │           ║
║               └──────────────────────┘                    ║
╚═══════════════════════════════════════════════════════════╝
```

**Toggle Button Design:**
- Container: Light slate background (bg-slate-100) with rounded corners
- Inner padding: 1px (p-1)
- Active button: White background with shadow (bg-white shadow-sm)
- Inactive button: Slate text (text-slate-600) with hover effect
- Icons from lucide-react: List and Map icons
- Smooth transitions between states

### List View (Default)
```
╔═══════════════════════════════════════════════════════════╗
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      ║
║  │   [Image]   │  │   [Image]   │  │   [Image]   │      ║
║  │             │  │             │  │             │      ║
║  │             │  │             │  │             │      ║
║  ├─────────────┤  ├─────────────┤  ├─────────────┤      ║
║  │ Event Title │  │ Event Title │  │ Event Title │      ║
║  │             │  │             │  │             │      ║
║  │ 📅 Date     │  │ 📅 Date     │  │ 📅 Date     │      ║
║  │ 📍 Location │  │ 📍 Location │  │ 📍 Location │      ║
║  │             │  │             │  │             │      ║
║  │ 👥 X attending │ │ 👥 X attending │ │ 👥 X attending │║
║  └─────────────┘  └─────────────┘  └─────────────┘      ║
╚═══════════════════════════════════════════════════════════╝
```

### Map View
```
╔═══════════════════════════════════════════════════════════╗
║ ⚠️ 2 events are not shown on the map because they        ║
║    don't have location coordinates yet.                   ║
╚═══════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════╗
║                                                            ║
║     🗺️         INTERACTIVE MAP                           ║
║                                                            ║
║        📍 Paris                                           ║
║           📍 Berlin        📍 Vienna                      ║
║                                                            ║
║                  📍 Barcelona                             ║
║                                                            ║
║         📍 Lisbon                                         ║
║                                                            ║
║                                                            ║
║  [+] [-]  Zoom Controls                                   ║
╚═══════════════════════════════════════════════════════════╝
```

**Map Marker Popup (when clicked):**
```
┌─────────────────────────────────┐
│ Paris Tango Marathon 2026       │
│                                 │
│ 📍 Paris, France                │
│ 📅 Mar 15 - Mar 18, 2026       │
│                                 │
│ View Details →                  │
└─────────────────────────────────┘
```

**Map Visual Design:**
- Height: 600px for good visibility
- Rounded corners (rounded-lg)
- Shadow (shadow-lg)
- Border (border border-slate-200)
- OpenStreetMap tile layer with street details
- Standard red marker pins
- Popups with formatted event information
- Clickable "View Details" link in rose color

**Warning Message Design:**
- Amber background (bg-amber-50)
- Amber border (border-amber-200)
- Amber text (text-amber-800)
- MapPin icon from lucide-react
- Rounded corners
- Padding for comfortable reading

## 3. Event Creation Form - Location Section

### Extended Location Section
```
╔═══════════════════════════════════════════════════════════╗
║ 📍 Location                                               ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  City *                            Venue *                 ║
║  ┌──────────────────────┐         ┌──────────────────┐   ║
║  │ Buenos Aires, Arg... │         │ La Catedral Club │   ║
║  └──────────────────────┘         └──────────────────┘   ║
║                                                            ║
║  Latitude (optional)               Longitude (optional)    ║
║  ┌──────────────────────┐         ┌──────────────────┐   ║
║  │ e.g., 48.8566        │         │ e.g., 2.3522     │   ║
║  └──────────────────────┘         └──────────────────┘   ║
║  For map display                   For map display        ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

**Form Field Design:**
- Labels: Medium font weight, slate-900 color
- Helper text: Extra small, slate-500 color
- Input fields: 
  - Rounded corners (rounded-lg)
  - White background
  - Slate-300 border ring
  - Rose-600 focus ring
  - Number type for lat/lng with step="any"
  - Placeholder text in slate-400

## Color Scheme

The implementation uses the existing TangoWorld color scheme:
- **Primary**: Rose-500/600 (#e11d48, #be123c)
- **Neutral**: Slate-50 to Slate-900
- **Background**: White and Slate-50
- **Text**: Slate-600 to Slate-900
- **Borders**: Slate-200/300
- **Warnings**: Amber-50/200/800

## Responsive Design

All components are mobile-friendly:
- Toggle buttons stack nicely on mobile
- Map maintains aspect ratio
- Form fields stack vertically on mobile (sm:grid-cols-2)
- Cards maintain 1-column on mobile, expand to 3 columns on large screens
- Clear button is full-width and easy to tap on mobile

## Accessibility

- Semantic HTML elements used throughout
- ARIA labels where appropriate
- Keyboard navigation supported
- Focus states clearly visible (focus:ring-2)
- Sufficient color contrast ratios
- Icons paired with text labels

This visual design maintains consistency with the existing TangoWorld interface while adding new functionality in an intuitive and user-friendly way.
