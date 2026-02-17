# Business Dashboard - Visual Description

## Overview
The Business Dashboard provides event organizers with a comprehensive view of their event's financial health through an elegant, data-rich interface with interactive charts and real-time metrics.

## Page Layout

### Header Section
- **Back Button**: "← Back to Manage Event" (top left)
- **Page Title**: "Business Dashboard: [Event Name]" (large, bold)
- **Subtitle**: "Financial overview and cost management" (smaller, gray text)

### Key Metrics Cards (Row 1 - 4 Cards)
Four prominent cards displaying the most important financial indicators:

1. **Total Costs** (Red accent)
   - Icon: Dollar sign in red
   - Label: "Total Costs"
   - Value: Displayed in large font with 2 decimal places (e.g., "$1,500.00")

2. **Confirmed Revenue** (Green accent)
   - Icon: Trending up arrow in green
   - Label: "Confirmed Revenue"
   - Value: Money from paid registrations (e.g., "$5,000.00")

3. **Theoretical Revenue** (Blue accent)
   - Icon: Trending up arrow in blue
   - Label: "Theoretical Revenue"
   - Value: Total if all accepted dancers pay (e.g., "$8,000.00")

4. **Net Profit (Confirmed)** (Green or Red based on value)
   - Icon: Trending up (green) or down (red) arrow
   - Label: "Net Profit (Confirmed)"
   - Value: Color-coded positive (green) or negative (red) (e.g., "$3,500.00")

### Additional Metrics Cards (Row 2 - 3 Cards)

5. **Payment Completion**
   - Icon: Users
   - Label: "Payment Completion"
   - Value: Percentage with context (e.g., "62.5%")
   - Subtext: "25 / 40 paid"

6. **Pending Revenue**
   - Icon: Credit card in orange
   - Label: "Pending Revenue"
   - Value: Money waiting to be collected (e.g., "$3,000.00")

7. **Net Profit (Theoretical)**
   - Icon: Trending up/down arrow (blue or red)
   - Label: "Net Profit (Theoretical)"
   - Value: Projected profit if all pay (e.g., "$6,500.00")

### Charts Section (Row 3 - 2 Charts Side by Side)

#### Left Chart: Revenue Breakdown (Pie Chart)
- **Title**: "Revenue Breakdown"
- **Data**: 
  - Confirmed Revenue (green slice)
  - Pending Revenue (orange slice)
- **Features**:
  - Labels show category name and dollar amount
  - Hover tooltip shows exact values
  - Legend below chart
- **Empty State**: "No revenue data yet" if no registrations

#### Right Chart: Costs by Category (Pie Chart)
- **Title**: "Costs by Category"
- **Data**:
  - Rent (red slice)
  - Insurance (orange slice)
  - Marketing (green slice)
  - Food (blue slice)
  - Other (purple slice)
- **Features**:
  - Labels show category and amount
  - Hover tooltip with details
  - Legend below chart
- **Empty State**: "No costs logged yet" if no costs

### Financial Overview Chart (Row 4 - Full Width)

#### Bar Chart: Costs vs Revenue Comparison
- **Title**: "Financial Overview"
- **Bars**:
  - Costs (red bar)
  - Confirmed Revenue (green bar)
  - Theoretical Revenue (blue bar)
- **Features**:
  - Y-axis shows dollar amounts
  - X-axis shows metric names
  - Hover tooltip shows exact values
  - Grid lines for easy reading

### Cost Management Section (Bottom)

#### Header
- **Title**: "Event Costs" (left)
- **Button**: "+ Add Cost" (right, rose/pink background, white text)

#### Add Cost Form (Expandable)
When "+ Add Cost" is clicked, shows a form with 4 fields in a 2x2 grid:

**Row 1:**
- **Category** (dropdown):
  - Venue Rent
  - Insurance
  - Marketing
  - Food & Catering
  - Other
- **Amount** (number input):
  - Placeholder: "$0.00"
  - Step: 0.01
  - Min: 0

**Row 2:**
- **Description** (text input):
  - Placeholder: "Enter description"
- **Date** (date picker):
  - Default: Today's date

**Action Buttons:**
- "Save Cost" (rose/pink, white text)
- "Cancel" (white, gray text, border)

#### Costs Table
A clean, organized table displaying all logged costs:

**Columns:**
1. **Date**: MM/DD/YYYY format
2. **Category**: Human-readable category name
3. **Description**: Full description text
4. **Amount**: Right-aligned, formatted as currency ($X,XXX.XX)
5. **Actions**: Trash icon button (red when hovered)

**Features:**
- Alternating row colors for readability
- Header row with light gray background
- Delete button shows trash icon
- Confirmation dialog before deletion
- Empty state: "No costs recorded yet" (centered, gray text)

## Color Scheme

### Primary Colors
- **Rose/Pink** (#ef4444 to #ec4899): Primary action buttons, branding
- **Slate Gray** (#334155 to #64748b): Text, backgrounds, borders
- **White** (#ffffff): Card backgrounds, button text

### Status Colors
- **Green** (#10b981): Positive values, confirmed revenue, success states
- **Blue** (#3b82f6): Theoretical values, informational states
- **Red** (#ef4444): Costs, negative values, delete actions
- **Orange** (#f59e0b): Pending/warning states
- **Purple** (#8b5cf6): Accent, "other" category

## Responsive Design

### Desktop (>1024px)
- 4 columns for key metrics
- 3 columns for additional metrics
- 2 columns for pie charts side by side
- Full-width bar chart
- Full table layout

### Tablet (768px - 1024px)
- 2 columns for metrics
- 2 columns for charts
- Responsive table with scroll if needed

### Mobile (<768px)
- 1 column for all metrics (stacked)
- 1 column for charts (stacked)
- Simplified table or card view
- Form fields stack vertically

## Interactive Elements

### Buttons
- Hover effects: Slight darkening of background
- Focus states: Outline for accessibility
- Active/pressed states: Slightly more darkening

### Charts
- Hover over segments: Tooltip appears with exact values
- Legend items: Clickable to toggle visibility (Recharts default)
- Smooth animations on load

### Form Inputs
- Focus: Border changes to rose/pink color
- Validation: Red border for errors
- Labels: Clear, accessible text

### Table Rows
- Hover: Light gray background
- Delete button: Only visible on hover (or always on mobile)

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1 > h2 > h3)
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG AA standards
- Screen reader friendly chart descriptions

## Empty States

1. **No Revenue Data**: Shows centered message in chart area
2. **No Costs Logged**: Shows centered message in chart and table
3. **No Accepted Applications**: Metrics show $0.00 with 0% completion

## Loading States

- Spinner while fetching data (centered, rose/pink)
- Skeleton screens for smoother perceived performance (future enhancement)

## Error States

- Error message in red at top of page
- Retry mechanism available
- User-friendly error messages (no stack traces)

## Navigation Flow

1. **Entry Points**:
   - From Organizer Dashboard: "Business" button on event card
   - From Manage Event page: "Business Dashboard" button in header

2. **Exit Points**:
   - "← Back to Manage Event" button (returns to manage page)
   - Browser back button
   - Main navigation (if user navigates away)

## Visual Hierarchy

1. **Most Important**: Key financial metrics (largest, top)
2. **Important**: Supporting metrics and charts (medium, middle)
3. **Detail Level**: Cost management table (bottom)
4. **Actions**: Buttons stand out with color and positioning

This layout provides a clear, professional financial dashboard that gives event organizers immediate insight into their event's financial performance while maintaining the clean, modern aesthetic of the rest of the application.
