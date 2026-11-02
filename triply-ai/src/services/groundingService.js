/**
 * Service to ground AI travel data with verified real-world sources:
 * - Wikipedia REST API for authoritative destination overviews
 * - Open-Meteo Historical Climate API for verified 12-month temperature and rainfall normals
 *
 * If external calls fail or time out, it gracefully falls back to the AI-generated values.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Extracts a clean city name from a Google Places label (e.g. "Kyoto, Japan" -> "Kyoto").
 *
 * @param {string} destinationLabel
 * @returns {string}
 */
export function extractCityName(destinationLabel) {
  if (!destinationLabel) return '';
  return destinationLabel.split(',')[0].trim();
}

/**
 * Fetches destination summary from Wikipedia REST API.
 *
 * @param {string} cityName
 * @returns {Promise<string|null>} Summary extract or null if not found
 */
export async function fetchWikipediaSummary(cityName) {
  if (!cityName) return null;

  try {
    const cleanName = cityName.trim().replace(/\s+/g, '_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanName)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TriplyAI/1.0 (TravelPlanner)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.extract || null;
  } catch (error) {
    console.warn(`Wikipedia grounding skipped for "${cityName}":`, error?.message || error);
    return null;
  }
}

/**
 * Fetches monthly climate averages (temperature and precipitation) from Open-Meteo API.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Array<{month: string, avgTempC: string, rainfall: string}>|null>}
 */
export async function fetchOpenMeteoMonthlyClimate(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  try {
    // Query historical 1-year archive to compute monthly normals
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_mean,precipitation_sum&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const times = data?.daily?.time || [];
    const temps = data?.daily?.temperature_2m_mean || [];
    const precips = data?.daily?.precipitation_sum || [];

    if (times.length === 0) return null;

    // Aggregate into 12 calendar months
    const monthlyTemps = Array.from({ length: 12 }, () => []);
    const monthlyPrecip = Array.from({ length: 12 }, () => 0);

    times.forEach((dateStr, idx) => {
      const monthIdx = parseInt(dateStr.split('-')[1], 10) - 1;
      const t = temps[idx];
      const p = precips[idx];

      if (typeof t === 'number' && !isNaN(t)) {
        monthlyTemps[monthIdx].push(t);
      }
      if (typeof p === 'number' && !isNaN(p)) {
        monthlyPrecip[monthIdx] += p;
      }
    });

    return MONTH_NAMES.map((name, i) => {
      const tempsList = monthlyTemps[i];
      const avgT = tempsList.length > 0
        ? Math.round(tempsList.reduce((a, b) => a + b, 0) / tempsList.length)
        : null;
      const totalP = Math.round(monthlyPrecip[i]);

      return {
        month: name,
        avgTempC: avgT !== null ? `${avgT}°C` : '',
        rainfall: totalP > 0 ? `${totalP} mm` : 'Low'
      };
    });
  } catch (error) {
    console.warn('Open-Meteo climate grounding skipped:', error?.message || error);
    return null;
  }
}

/**
 * Grounds the AI-generated destinationInfo with real-world Wikipedia & Open-Meteo data.
 * Falls back to AI values if network calls fail.
 *
 * @param {Object} tripData - The AI-generated trip data object
 * @param {string} destinationLabel - The full destination name/city
 * @returns {Promise<Object>} Enriched trip data
 */
export async function groundTripData(tripData, destinationLabel) {
  if (!tripData || !tripData.destinationInfo) {
    return tripData;
  }

  const cityName = extractCityName(destinationLabel);

  // Attempt to find coordinates from first hotel or activity
  const coords =
    tripData?.hotelsOptions?.[0]?.coordinates ||
    tripData?.itinerary?.[0]?.activities?.[0]?.coordinates;

  const lat = coords?.latitude;
  const lng = coords?.longitude;

  try {
    const [wikiResult, climateResult] = await Promise.allSettled([
      fetchWikipediaSummary(cityName),
      (lat && lng) ? fetchOpenMeteoMonthlyClimate(lat, lng) : Promise.resolve(null)
    ]);

    // 1. Ground Overview from Wikipedia if available
    if (wikiResult.status === 'fulfilled' && wikiResult.value) {
      const wikiExtract = wikiResult.value;
      const originalOverview = tripData.destinationInfo.overview || '';
      // Retain AI context while grounding with authoritative summary
      tripData.destinationInfo.overview = wikiExtract.length > 80
        ? `${wikiExtract} ${originalOverview}`.trim()
        : originalOverview || wikiExtract;
    }

    // 2. Ground Monthly Climate from Open-Meteo if available
    if (climateResult.status === 'fulfilled' && climateResult.value) {
      const realMonthly = climateResult.value;
      const guide = tripData?.destinationInfo?.bestTimeToVisit?.monthlyGuide;

      if (Array.isArray(guide)) {
        guide.forEach((mObj, idx) => {
          const realData = realMonthly[idx];
          if (realData) {
            if (realData.avgTempC) mObj.avgTempC = realData.avgTempC;
            if (realData.rainfall) mObj.rainfall = realData.rainfall;
          }
        });
      }
    }
  } catch (err) {
    console.warn('Data grounding encountered an unexpected error, using AI values:', err);
  }

  return tripData;
}

