import axios from "axios";

const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
const placeApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

const config = {
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": placeApiKey || "",
    "X-Goog-FieldMask": [
      "places.photos",
      "places.displayName",
      "places.id"
    ]
  }
};

/**
 * Searches Google Places API for a place matching the query.
 *
 * @param {Object} data - payload with textQuery
 * @returns {Promise<any>}
 */
export const getPlaceDetails = async (data) => {
  if (!placeApiKey) return null;
  return axios.post(BASE_URL, data, config);
};

/**
 * Fetches a high-resolution photo URL for a place or activity.
 * Appends destination/city to improve query accuracy.
 *
 * @param {string} textQuery - Name of the place, hotel, or attraction
 * @param {string} [destination] - Optional destination/city to constrain search
 * @returns {Promise<string|null>} Photo URL or null on failure
 */
export const getPlacePhoto = async (textQuery, destination = "") => {
  if (!textQuery || !placeApiKey) {
    return null;
  }

  try {
    const combinedQuery = destination
      ? `${textQuery.trim()}, ${destination.trim()}`
      : textQuery.trim();

    const res = await getPlaceDetails({ textQuery: combinedQuery });
    const photoName = res?.data?.places?.[0]?.photos?.[0]?.name;

    if (!photoName) {
      return null;
    }

    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1080&maxWidthPx=1920&key=${placeApiKey}`;
  } catch (error) {
    console.error(`Failed to fetch place photo for "${textQuery}":`, error?.message || error);
    return null;
  }
};
