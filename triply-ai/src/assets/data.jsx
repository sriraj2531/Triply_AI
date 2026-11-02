import React from "react";
import { IndianRupeeIcon } from "lucide-react";

export const MAX_DAYS = 10;

export const BUDGET_OPTIONS = [
  { id: 'Budget', label: 'Budget Friendly', icon: <IndianRupeeIcon className="w-4 h-4" /> },
  { id: 'Moderate', label: 'Moderate', icon: <div className="flex"><IndianRupeeIcon className="w-4 h-4" /><IndianRupeeIcon className="w-4 h-4" /></div> },
  { id: 'Luxury', label: 'Luxury', icon: <div className="flex"><IndianRupeeIcon className="w-4 h-4" /><IndianRupeeIcon className="w-4 h-4" /><IndianRupeeIcon className="w-4 h-4" /></div> },
];

export const TRAVELER_OPTIONS = [
  { id: 'Solo', title: 'Solo Traveler', icon: '🧗', desc: 'Exploring at your own pace', defaultCount: 1 },
  { id: 'Couple', title: 'Couple', icon: '👩‍❤️‍👨', desc: 'Romantic getaways', defaultCount: 2 },
  { id: 'Family', title: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Kid-friendly activities', defaultCount: 4 },
  { id: 'Friends', title: 'Group / Friends', icon: '🥳', desc: 'Thrill-seekers group', defaultCount: 4 }
];

export const STAY_TYPE_OPTIONS = [
  { id: 'Hotel', label: 'Hotel / Resort', icon: '🏨', desc: 'Comfortable private rooms, standard amenities' },
  { id: 'Homestay', label: 'Homestay / Villa', icon: '🏡', desc: 'Cozy, personalized local hospitality' },
  { id: 'Dormitory', label: 'Hostel / Dormitory', icon: '🛏️', desc: 'Social atmosphere, budget backpacker bunks' },
  { id: 'Boutique', label: 'Boutique / Heritage', icon: '🏰', desc: 'Unique cultural heritage & scenic character' }
];

export const INTEREST_OPTIONS = [
  { id: 'nature', label: 'Nature & Scenery', icon: '🌿' },
  { id: 'heritage', label: 'Temples & Heritage', icon: '🏛️' },
  { id: 'adventure', label: 'Adventure', icon: '🧗' },
  { id: 'food', label: 'Food & Culinary', icon: '🍜' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'nightlife', label: 'Nightlife', icon: '🎉' },
  { id: 'relaxation', label: 'Relaxation & Wellness', icon: '🧘' }
];

export const TRANSPORT_OPTIONS = [
  { id: 'Flight', label: 'Flight', icon: '✈️', desc: 'Fastest for distance' },
  { id: 'Train', label: 'Train / Rail', icon: '🚆', desc: 'Scenic & connected' },
  { id: 'Road', label: 'Road / Drive', icon: '🚗', desc: 'Flexible travel' }
];

export const PACE_OPTIONS = [
  { id: 'Relaxed', label: 'Relaxed', icon: '☕', desc: '2-3 spots / day, plenty of downtime' },
  { id: 'Balanced', label: 'Balanced', icon: '⚖️', desc: '3-4 spots / day, well-rounded' },
  { id: 'Packed', label: 'Action-Packed', icon: '⚡', desc: '5+ spots / day, see everything' }
];

export const FOOD_OPTIONS = [
  { id: 'Any', label: 'Any / Flexible', icon: '🍽️' },
  { id: 'Vegetarian', label: 'Pure Veg', icon: '🥗' },
  { id: 'Non-Veg', label: 'Non-Vegetarian', icon: '🍗' }
];

export const MONTH_OPTIONS = [
  'Flexible',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
];
