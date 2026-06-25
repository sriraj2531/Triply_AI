import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
// Initialize the chat session with history to enforce the JSON Schema
const chat = ai.chats.create({
  model: "gemini-3.1-flash-lite",
  history: [
    {
      role: "user",
      parts: [{ text: "Generate a travel plan for Location: New York for 2 days for a couple traveler on economy budget. Return the result strictly as a single JSON object using camelCase keys, the travel plan with trip note and must feature hotelsOptions array, each hotel with hotelName, hotelAddress, priceRange, imageUrl, rating, description, and a coordinates, alongside an itinerary array of daily plans. Each day must include a dayNumber, theme, and an activities array, where each activity contains activityName, description, imageUrl, ticketPrice, timeRange, timeToTravel and coordinates" }],
    },
    {
      role: "model",
      parts: [{
        text: JSON.stringify({
          "tripNote": "This 2-day economy travel plan for New York City focuses on experiencing the city's iconic sights and romantic charm without breaking the bank. Transportation will primarily be via the affordable NYC subway (OMNY tap-to-pay is recommended). For meals, embrace local delis, street food, and $1 pizza slices to keep costs down. The itinerary prioritizes free or low-cost attractions, offering a rich experience for a couple on a budget.",
          "hotelsOptions": [
            {
              "hotelName": "Moxy NYC Downtown",
              "hotelAddress": "143 Fulton St, New York, NY 10038",
              "priceRange": "$160 - $230 per night",
              "imageUrl": "https://images.unsplash.com/photo-1571896349882-e806a699c268?auto=format&fit=crop&q=80&w=1000",
              "rating": 4.2,
              "description": "A stylish and modern hotel in the Financial District offering compact rooms with clever design. It's well-connected by subway and close to many downtown attractions, providing good value for money.",
              "coordinates": {
                "latitude": 40.7101,
                "longitude": -74.0097
              }
            },
            {
              "hotelName": "Hotel Mimosa",
              "hotelAddress": "145 Bowery, New York, NY 10002",
              "priceRange": "$140 - $200 per night",
              "imageUrl": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1000",
              "rating": 3.9,
              "description": "Located in the vibrant Lower East Side, Hotel Mimosa offers simple, clean, and affordable rooms. It's a great base for exploring Chinatown and Little Italy, and provides easy subway access to other parts of the city.",
              "coordinates": {
                "latitude": 40.7183,
                "longitude": -73.9947
              }
            }
          ],
          "itinerary": [
            {
              "dayNumber": 1,
              "theme": "Midtown Icons & Park Romance",
              "activities": [
                {
                  "activityName": "Central Park Exploration",
                  "description": "Start your day with a romantic walk through Central Park. Visit Strawberry Fields, Bethesda Terrace, and stroll around The Lake. Pack a picnic lunch to save money.",
                  "imageUrl": "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "09:00 AM - 12:00 PM",
                  "timeToTravel": "20-30 mins via Subway (depending on hotel)",
                  "coordinates": {
                    "latitude": 40.7828,
                    "longitude": -73.9653
                  }
                },
                {
                  "activityName": "Grand Central Terminal & Chrysler Building View",
                  "description": "Admire the magnificent architecture of Grand Central Terminal. Afterwards, walk a short distance to appreciate the exterior of the iconic Chrysler Building, a true Art Deco masterpiece.",
                  "imageUrl": "https://images.unsplash.com/photo-1543716627-839b54c40519?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "01:30 PM - 02:30 PM",
                  "timeToTravel": "15 mins via Subway/Walk",
                  "coordinates": {
                    "latitude": 40.7527,
                    "longitude": -73.9772
                  }
                },
                {
                  "activityName": "The High Line Park Walk",
                  "description": "Enjoy a leisurely stroll on The High Line, an elevated urban park built on historic railway lines. It offers unique city views and beautiful landscaping, perfect for a couple.",
                  "imageUrl": "https://images.unsplash.com/photo-1555109307-f7d9da25c244?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "03:30 PM - 05:00 PM",
                  "timeToTravel": "20 mins via Subway",
                  "coordinates": {
                    "latitude": 40.7482,
                    "longitude": -74.0048
                  }
                },
                {
                  "activityName": "Times Square at Night",
                  "description": "Experience the electrifying energy and dazzling billboards of Times Square after sunset. It's a free spectacle and a quintessential New York experience.",
                  "imageUrl": "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "07:30 PM - 09:00 PM",
                  "timeToTravel": "15 mins via Subway",
                  "coordinates": {
                    "latitude": 40.7580,
                    "longitude": -73.9855
                  }
                }
              ]
            },
            {
              "dayNumber": 2,
              "theme": "Lower Manhattan History & Brooklyn Views",
              "activities": [
                {
                  "activityName": "Staten Island Ferry for Statue of Liberty Views",
                  "description": "Take a free round-trip ride on the Staten Island Ferry for incredible views of the Statue of Liberty, Ellis Island, and the Lower Manhattan skyline without paying for a boat tour.",
                  "imageUrl": "https://images.unsplash.com/photo-1620021392955-a00e470a9279?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "09:30 AM - 11:00 AM",
                  "timeToTravel": "10-20 mins via Subway (depending on hotel)",
                  "coordinates": {
                    "latitude": 40.7013,
                    "longitude": -74.0139
                  }
                },
                {
                  "activityName": "9/11 Memorial & Oculus",
                  "description": "Visit the poignant 9/11 Memorial and its reflecting pools, a powerful tribute to those lost. Then, marvel at the unique architecture of the Oculus, a striking transportation hub.",
                  "imageUrl": "https://images.unsplash.com/photo-1534430480872-3498386e7a56?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free (Museum entry is separate)",
                  "timeRange": "11:30 AM - 01:00 PM",
                  "timeToTravel": "5 mins walk from Ferry Terminal",
                  "coordinates": {
                    "latitude": 40.7115,
                    "longitude": -74.0132
                  }
                },
                {
                  "activityName": "Brooklyn Bridge Walk",
                  "description": "Walk across the iconic Brooklyn Bridge from Manhattan to Brooklyn. This historic walk offers stunning panoramic views of both Manhattan and Brooklyn skylines, perfect for photos.",
                  "imageUrl": "https://images.unsplash.com/photo-1525934169-7a52a46e5555?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "02:30 PM - 04:00 PM",
                  "timeToTravel": "10-15 mins walk from 9/11 Memorial",
                  "coordinates": {
                    "latitude": 40.7061,
                    "longitude": -73.9969
                  }
                },
                {
                  "activityName": "DUMBO & Brooklyn Bridge Park",
                  "description": "Explore the charming DUMBO (Down Under the Manhattan Bridge Overpass) neighborhood. Take the famous shot on Washington Street, and relax in Brooklyn Bridge Park, enjoying the waterfront and Manhattan views.",
                  "imageUrl": "https://images.unsplash.com/photo-1563228994-3a479c93a7a2?auto=format&fit=crop&q=80&w=1000",
                  "ticketPrice": "Free",
                  "timeRange": "04:00 PM - 06:00 PM",
                  "timeToTravel": "5 mins walk from Brooklyn Bridge exit",
                  "coordinates": {
                    "latitude": 40.7033,
                    "longitude": -73.9905
                  }
                }
              ]
            }
          ]
        })
      }],
    },
  ],
});

//Main Function to Generate the Trip
export async function generateTripWithAI(DYNAMIC_PROMPT) {
  try {
    //We use chat.send Message
    const response = await chat.sendMessage({
      message: DYNAMIC_PROMPT,
    });
    const textResponse = response.text;
    // Cleaning the string: Remove Markdown JSON formatting if AI includes it 
    const cleanJson = textResponse.replace(/```json|```/g,"").trim()
    // console.log("Clean json: ",cleanJson);
    return JSON.parse(cleanJson);
  } catch (error) {
    console.log("Error Generating the trip :",error);
    throw error;
  }
}



const response1 = await chat.sendMessage({
  message: "I have 2 dogs in my house.",
});
console.log("Chat response 1:", response1.text);