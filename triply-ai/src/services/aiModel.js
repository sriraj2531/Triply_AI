import { GoogleGenAI, Type } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Active Gemini 3.5 generation models
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite'
];

/**
 * Strict JSON schema for complete trip plan and destination intelligence.
 */
export const tripResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tripNote: {
      type: Type.STRING,
      description: "Executive travel overview, trip philosophy, and tailored advice."
    },
    destinationInfo: {
      type: Type.OBJECT,
      description: "Detailed destination intelligence, seasonal guide, and practical travel logistics.",
      properties: {
        overview: {
          type: Type.STRING,
          description: "Authoritative, engaging summary of the destination's history, culture, and highlights."
        },
        bestTimeToVisit: {
          type: Type.OBJECT,
          description: "Comprehensive seasonal guide and month-by-month recommendations.",
          properties: {
            bestMonths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Top recommended months to travel (e.g. ['October', 'November', 'March'])."
            },
            peakSeason: {
              type: Type.STRING,
              description: "Peak tourist season details (timing, atmosphere, crowd level)."
            },
            offSeason: {
              type: Type.STRING,
              description: "Low season or monsoon details and considerations."
            },
            isSelectedMonthGood: {
              type: Type.BOOLEAN,
              description: "Whether the user's chosen travel month is a favorable time to visit."
            },
            selectedMonthAdvice: {
              type: Type.STRING,
              description: "Actionable advice, weather warnings, and local tips specifically for the user's travel month."
            },
            monthlyGuide: {
              type: Type.ARRAY,
              description: "12-month calendar guide (from January through December).",
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  avgTempC: { type: Type.STRING, description: "e.g. '24°C' or '18-26°C'" },
                  rainfall: { type: Type.STRING, description: "e.g. 'Low', 'Moderate', or '120 mm'" },
                  crowdLevel: { type: Type.STRING, description: "e.g. 'Low', 'Moderate', 'High', 'Peak'" },
                  rating: {
                    type: Type.STRING,
                    enum: ["Best", "Good", "Avoid"],
                    description: "Seasonal rating badge."
                  },
                  note: { type: Type.STRING, description: "One concise sentence on what to expect." }
                },
                required: ["month", "avgTempC", "rainfall", "crowdLevel", "rating", "note"]
              }
            }
          },
          required: [
            "bestMonths",
            "peakSeason",
            "offSeason",
            "isSelectedMonthGood",
            "selectedMonthAdvice",
            "monthlyGuide"
          ]
        },
        howToReach: {
          type: Type.STRING,
          description: "Comprehensive transport connectivity via flights, railways, and highways."
        },
        localTransport: {
          type: Type.STRING,
          description: "Best internal transit options (metro, rideshare, tuk-tuks, rentals, ferries)."
        },
        foodToTry: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Array of iconic regional culinary specialties and must-try dishes."
        },
        festivals: {
          type: Type.ARRAY,
          description: "Prominent regional festivals and events.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              month: { type: Type.STRING }
            },
            required: ["name", "month"]
          }
        },
        safetyAndEtiquette: {
          type: Type.STRING,
          description: "Essential local cultural etiquette, dress codes, and safety guidance."
        },
        packingTips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Practical packing checklist recommendations tailored to the climate."
        }
      },
      required: [
        "overview",
        "bestTimeToVisit",
        "howToReach",
        "localTransport",
        "foodToTry",
        "festivals",
        "safetyAndEtiquette",
        "packingTips"
      ]
    },
    hotelsOptions: {
      type: Type.ARRAY,
      description: "Array of at least 10 recommended accommodations matching the user's budget tier, traveler type, and preferred stay type.",
      items: {
        type: Type.OBJECT,
        properties: {
          hotelName: { type: Type.STRING },
          hotelAddress: { type: Type.STRING },
          priceRange: { type: Type.STRING, description: "Localized price range with native currency symbol." },
          rating: { type: Type.NUMBER, description: "Rating out of 5 (e.g. 4.2 to 4.9)." },
          description: { type: Type.STRING },
          stayType: { type: Type.STRING, description: "e.g. 'Hotel', 'Homestay', 'Hostel / Dormitory', 'Boutique'" },
          foodHighlights: { type: Type.STRING, description: "Food & dining context (e.g. 'Pure-veg breakfast, 5+ vegetarian restaurants within 200m')." },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER }
            },
            required: ["latitude", "longitude"]
          }
        },
        required: ["hotelName", "hotelAddress", "priceRange", "rating", "description", "coordinates"]
      }
    },
    itinerary: {
      type: Type.ARRAY,
      description: "Daily travel plans with geographically grouped activities and scheduled lunch breaks at local eateries.",
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                activityName: { type: Type.STRING, description: "Name of the attraction, activity, or lunch spot." },
                description: { type: Type.STRING },
                ticketPrice: { type: Type.STRING, description: "Localized price or 'Free' (for lunch: estimated meal cost)." },
                timeRange: { type: Type.STRING, description: "e.g. '09:00 AM - 11:30 AM' or '01:00 PM - 02:00 PM'" },
                timeToTravel: { type: Type.STRING, description: "Estimated transit time to this spot." },
                isMealOrBreak: { type: Type.BOOLEAN, description: "Set to true if this slot is a dedicated lunch break or food stop at a local restaurant." },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    latitude: { type: Type.NUMBER },
                    longitude: { type: Type.NUMBER }
                  },
                  required: ["latitude", "longitude"]
                }
              },
              required: ["activityName", "description", "ticketPrice", "timeRange", "timeToTravel", "coordinates"]
            }
          }
        },
        required: ["dayNumber", "theme", "activities"]
      }
    }
  },
  required: ["tripNote", "destinationInfo", "hotelsOptions", "itinerary"]
};

/**
 * Retries an asynchronous operation with exponential backoff on transient 429/503 errors.
 *
 * @param {Function} fn - Async operation to execute
 * @param {number} retries - Maximum retry attempts (default 3)
 * @param {number} baseDelayMs - Base delay in ms (default 1500)
 * @returns {Promise<any>}
 */
async function callWithRetry(fn, retries = 3, baseDelayMs = 1500) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const errMsg = error?.message?.toLowerCase() || '';
      const isTransient =
        errMsg.includes('429') ||
        errMsg.includes('503') ||
        errMsg.includes('quota') ||
        errMsg.includes('rate limit') ||
        errMsg.includes('busy') ||
        errMsg.includes('overloaded') ||
        errMsg.includes('demand');

      if (isTransient && attempt < retries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(`Transient Gemini error (attempt ${attempt + 1}/${retries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Generates structured travel plan and destination intelligence using Gemini responseSchema.
 * Uses responseMimeType: "application/json" and eliminates regex markdown stripping.
 *
 * @param {string} prompt - Detailed travel prompt
 * @returns {Promise<Object>} Strictly structured JSON trip plan
 */
export async function generateTripWithAI(prompt) {
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env.local file.');
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const result = await callWithRetry(async () => {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: tripResponseSchema,
          }
        });

        const textResponse = response?.text;
        if (!textResponse) {
          throw new Error(`Model ${model} returned an empty response.`);
        }

        // Direct parse enabled by responseMimeType & responseSchema
        return JSON.parse(textResponse);
      });

      return result;
    } catch (error) {
      lastError = error;
      console.warn(`Model "${model}" attempt encountered an issue:`, error?.message || error);

      const errMsg = error?.message?.toLowerCase() || '';
      if (errMsg.includes('api_key') || errMsg.includes('unauthenticated') || errMsg.includes('key not valid')) {
        break;
      }
    }
  }

  console.error('All Gemini generation attempts failed:', lastError);
  throw lastError || new Error('Failed to generate trip with Gemini AI.');
}
