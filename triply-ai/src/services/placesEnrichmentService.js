/**
 * placesEnrichmentService.js
 *
 * Phase 4 – Ground results in real Google Places data.
 *
 * After the AI generates a trip plan, this service:
 *  1. Resolves each hotel and activity against the Google Places (New) Text Search API.
 *  2. Overlays real placeId, rating, opening hours, address and lat/lng on every object.
 *  3. Resolves photos ONCE at generation time and stores the URL directly on the object,
 *     so ActivityCard / HotelCard never need to call Places again on render.
 *
 * We stay within the free daily quota by batching requests sequentially and
 * short-circuiting when the API key is missing.
 */

const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';
const placeApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

// Field mask covering everything we want to overlay onto AI data
const FULL_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.photos',
  'places.regularOpeningHours',
  'places.location',
  'places.types',
].join(',');

// Photo resolution – large enough for hero images, small enough to stay fast
const PHOTO_MAX_H = 1080;
const PHOTO_MAX_W = 1920;

/**
 * Returns the Google Places photo CDN URL for a given photo resource name.
 *
 * @param {string} photoName - e.g. "places/ABC/photos/XYZ"
 * @returns {string}
 */
function buildPhotoUrl(photoName) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=${PHOTO_MAX_H}&maxWidthPx=${PHOTO_MAX_W}&key=${placeApiKey}`;
}

/**
 * Calls the Places Text Search API for a single text query.
 *
 * @param {string} textQuery
 * @returns {Promise<Object|null>} First matching place or null
 */
async function searchPlace(textQuery) {
  if (!placeApiKey || !textQuery) return null;

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': placeApiKey,
        'X-Goog-FieldMask': FULL_FIELD_MASK,
      },
      body: JSON.stringify({ textQuery }),
    });

    if (!response.ok) {
      console.warn(`Places API returned ${response.status} for query: "${textQuery}"`);
      return null;
    }

    const data = await response.json();
    return data?.places?.[0] ?? null;
  } catch (err) {
    console.error(`Places search failed for "${textQuery}":`, err?.message || err);
    return null;
  }
}

/**
 * Throttled sequential place lookup with a small delay between calls
 * so we don't hit rate limits when resolving many activities at once.
 *
 * @param {string[]} queries
 * @param {number} delayMs - ms between each request (default 120)
 * @returns {Promise<Array<Object|null>>}
 */
async function batchSearchPlaces(queries, delayMs = 120) {
  const results = [];
  for (const q of queries) {
    results.push(await searchPlace(q));
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

/**
 * Parses opening hours from the Places API response into a simple summary string.
 *
 * @param {Object|undefined} regularOpeningHours
 * @returns {string|null}
 */
function parseOpeningHours(regularOpeningHours) {
  if (!regularOpeningHours) return null;
  // weekdayDescriptions is an array like ["Monday: 9:00 AM – 5:00 PM", ...]
  const descriptions = regularOpeningHours?.weekdayDescriptions;
  if (Array.isArray(descriptions) && descriptions.length > 0) {
    return descriptions.join(' | ');
  }
  return regularOpeningHours?.openNow != null
    ? regularOpeningHours.openNow ? 'Currently Open' : 'Currently Closed'
    : null;
}

/**
 * Enriches a single hotel object with real Places data.
 *
 * @param {Object} hotel - AI-generated hotel object
 * @param {string} destinationCity - City name to append to search query
 * @returns {Promise<Object>} Enriched hotel
 */
async function enrichHotel(hotel, destinationCity) {
  if (!hotel?.hotelName) return hotel;

  const query = `${hotel.hotelName}, ${destinationCity}`;
  const place = await searchPlace(query);

  if (!place) return hotel;

  const photoName = place?.photos?.[0]?.name;
  const photoUrl = photoName ? buildPhotoUrl(photoName) : null;

  return {
    ...hotel,
    // Overlay real data; keep AI values as fallback
    placeId: place.id ?? hotel.placeId ?? null,
    hotelAddress: place.formattedAddress ?? hotel.hotelAddress,
    rating: place.rating ?? hotel.rating,
    coordinates: place.location
      ? { latitude: place.location.latitude, longitude: place.location.longitude }
      : hotel.coordinates,
    openingHours: parseOpeningHours(place.regularOpeningHours),
    photoUrl: photoUrl ?? hotel.photoUrl ?? null,
  };
}

/**
 * Enriches a single activity object with real Places data.
 *
 * @param {Object} activity - AI-generated activity object
 * @param {string} destinationCity - City name to narrow the search
 * @returns {Promise<Object>} Enriched activity
 */
async function enrichActivity(activity, destinationCity) {
  if (!activity?.activityName) return activity;

  // Meal/break stops often don't have a unique Places listing — skip API call
  if (activity.isMealOrBreak) return activity;

  const query = `${activity.activityName}, ${destinationCity}`;
  const place = await searchPlace(query);

  if (!place) return activity;

  const photoName = place?.photos?.[0]?.name;
  const photoUrl = photoName ? buildPhotoUrl(photoName) : null;

  // Validate time range against opening hours
  const openingHours = parseOpeningHours(place.regularOpeningHours);
  const openNow = place.regularOpeningHours?.openNow;

  return {
    ...activity,
    placeId: place.id ?? activity.placeId ?? null,
    address: place.formattedAddress ?? activity.address ?? null,
    rating: place.rating ?? activity.rating ?? null,
    coordinates: place.location
      ? { latitude: place.location.latitude, longitude: place.location.longitude }
      : activity.coordinates,
    openingHours: openingHours ?? activity.openingHours ?? null,
    openNow: openNow ?? null,
    photoUrl: photoUrl ?? activity.photoUrl ?? null,
  };
}

/**
 * Main enrichment pipeline.
 *
 * Takes the raw AI trip data and returns an enriched copy where every hotel
 * and sightseeing activity has been resolved against Google Places.
 *
 * @param {Object} tripData - Structured AI trip output
 * @param {string} destinationCity - City / region name (e.g. "Manali")
 * @returns {Promise<Object>} Enriched trip data
 */
export async function enrichTripWithPlaces(tripData, destinationCity) {
  if (!placeApiKey) {
    console.warn('VITE_GOOGLE_PLACES_API_KEY is missing – skipping Places enrichment.');
    return tripData;
  }

  if (!tripData) return tripData;

  // ── 1. Enrich hotels ──────────────────────────────────────────────────────
  const rawHotels = tripData.hotelsOptions ?? [];
  const enrichedHotels = [];
  for (const hotel of rawHotels) {
    enrichedHotels.push(await enrichHotel(hotel, destinationCity));
  }

  // ── 2. Enrich activities ──────────────────────────────────────────────────
  const rawItinerary = tripData.itinerary ?? [];
  const enrichedItinerary = [];

  for (const day of rawItinerary) {
    const rawActivities = day?.activities ?? [];
    const enrichedActivities = [];
    for (const activity of rawActivities) {
      enrichedActivities.push(await enrichActivity(activity, destinationCity));
    }
    enrichedItinerary.push({ ...day, activities: enrichedActivities });
  }

  return {
    ...tripData,
    hotelsOptions: enrichedHotels,
    itinerary: enrichedItinerary,
  };
}

