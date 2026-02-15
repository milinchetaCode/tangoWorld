// Geocoding utility using Nominatim (OpenStreetMap's geocoding service)
// Free to use with appropriate rate limiting

// Rate limit delay for Nominatim API (1 request per second)
export const GEOCODING_DELAY_MS = 1100;

interface GeocodingResult {
  latitude: number;
  longitude: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
}

// In-memory cache to avoid repeated API calls for the same location
const geocodeCache = new Map<string, GeocodingResult | null>();

/**
 * Geocode a location string to coordinates using Nominatim API
 * @param location - Location string (e.g., "Paris, France")
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  if (!location || location.trim() === '') {
    return null;
  }

  const normalizedLocation = location.trim().toLowerCase();

  // Check cache first
  if (geocodeCache.has(normalizedLocation)) {
    return geocodeCache.get(normalizedLocation) ?? null;
  }

  try {
    // Use Nominatim API with appropriate headers
    // Rate limit: 1 request per second for free tier
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TangoWorld Event Map', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.warn(`Geocoding failed for "${location}": ${response.statusText}`);
      geocodeCache.set(normalizedLocation, null);
      return null;
    }

    const data: NominatimResponse[] = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No geocoding results found for "${location}"`);
      geocodeCache.set(normalizedLocation, null);
      return null;
    }

    const result: GeocodingResult = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };

    // Cache the result
    geocodeCache.set(normalizedLocation, result);
    
    return result;
  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    geocodeCache.set(normalizedLocation, null);
    return null;
  }
}

/**
 * Batch geocode multiple locations with rate limiting
 * @param locations - Array of location strings
 * @param delayMs - Delay between requests in milliseconds (default 1000ms for Nominatim)
 * @returns Array of results in the same order as input
 */
export async function batchGeocodeLocations(
  locations: string[],
  delayMs: number = GEOCODING_DELAY_MS
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    const result = await geocodeLocation(location);
    results.push(result);

    // Add delay between requests to respect rate limits
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
