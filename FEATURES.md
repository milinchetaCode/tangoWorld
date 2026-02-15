# New Features Documentation

## Search and Filter Improvements

### Clear Search Button
When you search for events using the search bar on the main page, a **"Clear Search & Show All Events"** button now appears below the search field. This allows you to easily return to viewing all events without having to manually clear the search field.

**How to use:**
1. Enter a search term in the search bar (e.g., "Paris", "Marathon", "2026")
2. Press Enter or click Search
3. View filtered results
4. Click the "Clear Search & Show All Events" button to see all events again

The page also shows:
- The search term you used
- The number of matching results
- A clear visual indication that you're viewing filtered results

---

## Map View Feature

### Viewing Events on a Map
You can now view all events on an interactive map! This makes it easy to discover events near you or plan trips to multiple events in the same region.

**How to use:**
1. Navigate to the main events page
2. Below the page title, you'll see two buttons: **List View** and **Map View**
3. Click **Map View** to see events displayed on an interactive map
4. Click on any marker to see event details and a link to view more information
5. Switch back to **List View** anytime to see the traditional event cards

**Features:**
- Interactive map with zoom and pan controls
- Event markers showing event locations
- Click markers to see event name, location, dates, and a link to details
- Automatic map bounds adjustment to show all events
- Mobile-friendly and responsive

**Automatic Geocoding:**
- Events without coordinates are automatically geocoded when the map loads
- Once geocoded, coordinates are saved to the database for faster loading next time
- The geocoding process is transparent and happens in the background
- A loading indicator shows when geocoding is in progress

**Note:** Events are gradually getting coordinates through automatic geocoding. Events without coordinates will show a notice and will be geocoded when the map view is accessed.

---

## For Event Organizers

### Adding Location Coordinates to Events
When creating a new event, you can now add optional latitude and longitude coordinates to enable your event to appear on the map view.

**How to add coordinates:**
1. Go to the event creation form
2. In the **Location** section, after filling in the City and Venue fields, you'll see:
   - **Latitude (optional)** field
   - **Longitude (optional)** field
3. Enter the coordinates for your event location
   - Example: Paris coordinates are Latitude: 48.8566, Longitude: 2.3522
4. Submit your event

**Finding coordinates:**
- **Automatic:** The system automatically geocodes event locations and saves coordinates
- Use Google Maps: Right-click on your venue location and select the coordinates shown at the top
- Use online geocoding services to convert an address to coordinates
- Coordinates are optional - if not provided, they will be calculated automatically when someone views the map

**Tips:**
- Accurate coordinates help attendees find your event more easily
- Events with coordinates get better visibility on the map view
- Double-check coordinates before submitting to ensure accuracy
- If coordinates are not provided, they will be automatically calculated based on the location field when someone views the map
