import {
  Banknote,
  Clock,
  Info,
  MapPin,
  Users,
  Compass,
  Car,
  Utensils,
  Calendar,
  Sparkles,
  BedDouble
} from 'lucide-react';
import React from 'react';

const TripStats = ({ trip }) => {
  if (!trip) return null;

  const userSelection = trip?.userSelection || {};
  const destinationLabel = userSelection?.destination?.label || 'Destination';
  const tripNote = trip?.tripData?.tripNote || '';
  const interests = Array.isArray(userSelection?.interests) ? userSelection.interests : [];

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5'>
      <h4 className='text-gray-900 font-bold flex items-center gap-2'>
        <Info className='h-4 w-4 text-indigo-600' />
        Trip Overview
      </h4>

      <div className='space-y-3.5 text-sm'>
        {/* Destination */}
        <div className='flex items-start justify-between gap-3 pb-3 border-b border-gray-100'>
          <div className='flex items-center gap-2 text-gray-600'>
            <MapPin className='h-4 w-4 text-indigo-500 shrink-0' />
            <span className='font-medium'>Destination</span>
          </div>
          <p className='font-semibold text-gray-900 text-right text-xs max-w-[55%] truncate'>
            {destinationLabel}
          </p>
        </div>

        {/* Starting City (if present) */}
        {userSelection?.startingCity && (
          <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Compass className='h-4 w-4 text-indigo-500 shrink-0' />
              <span className='font-medium'>Origin</span>
            </div>
            <p className='font-semibold text-gray-900 text-xs'>{userSelection.startingCity}</p>
          </div>
        )}

        {/* Duration */}
        <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
          <div className='flex items-center gap-2 text-gray-600'>
            <Clock className='h-4 w-4 text-indigo-500 shrink-0' />
            <span className='font-medium'>Duration</span>
          </div>
          <p className='font-semibold text-gray-900 text-xs'>
            {userSelection.noOfDays ? `${userSelection.noOfDays} Days` : 'N/A'}
          </p>
        </div>

        {/* Travel Month / Dates (if present) */}
        {userSelection?.travelMonth && (
          <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Calendar className='h-4 w-4 text-indigo-500 shrink-0' />
              <span className='font-medium'>Month / Timing</span>
            </div>
            <p className='font-semibold text-gray-900 text-xs'>{userSelection.travelMonth}</p>
          </div>
        )}

        {/* Travelers */}
        <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
          <div className='flex items-center gap-2 text-gray-600'>
            <Users className='h-4 w-4 text-indigo-500 shrink-0' />
            <span className='font-medium'>Travelers</span>
          </div>
          <p className='font-semibold text-gray-900 text-xs'>
            {userSelection.traveler || 'Group'}
            {userSelection.numberOfTravelers ? ` (${userSelection.numberOfTravelers} pax)` : ''}
          </p>
        </div>

        {/* Stay Preference */}
        {userSelection?.stayType && (
          <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
            <div className='flex items-center gap-2 text-gray-600'>
              <BedDouble className='h-4 w-4 text-indigo-500 shrink-0' />
              <span className='font-medium'>Stay Style</span>
            </div>
            <p className='font-semibold text-gray-900 text-xs'>{userSelection.stayType}</p>
          </div>
        )}

        {/* Budget */}
        <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
          <div className='flex items-center gap-2 text-gray-600'>
            <Banknote className='h-4 w-4 text-indigo-500 shrink-0' />
            <span className='font-medium'>Budget Tier</span>
          </div>
          <p className='font-semibold text-gray-900 text-xs'>
            {userSelection.budget || 'Standard'}
            {userSelection.exactBudget ? ` (~${userSelection.currency || '$'}${userSelection.exactBudget})` : ''}
          </p>
        </div>

        {/* Transport & Pace */}
        {(userSelection.transport || userSelection.pace) && (
          <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Car className='h-4 w-4 text-indigo-500 shrink-0' />
              <span className='font-medium'>Pace & Transit</span>
            </div>
            <p className='font-semibold text-gray-900 text-xs'>
              {[userSelection.pace, userSelection.transport].filter(Boolean).join(' • ')}
            </p>
          </div>
        )}

        {/* Food Preference */}
        {userSelection.foodPreference && (
          <div className='flex items-center justify-between pb-3 border-b border-gray-100'>
            <div className='flex items-center gap-2 text-gray-600'>
              <Utensils className='h-4 w-4 text-indigo-500 shrink-0' />
              <span className='font-medium'>Dietary</span>
            </div>
            <p className='font-semibold text-gray-900 text-xs'>{userSelection.foodPreference}</p>
          </div>
        )}

        {/* Selected Interests */}
        {interests.length > 0 && (
          <div className='pt-1'>
            <span className='text-xs font-semibold text-gray-600 block mb-2 flex items-center gap-1.5'>
              <Sparkles className='w-3.5 h-3.5 text-indigo-500' />
              Curated Interests
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {interests.map((interest, idx) => (
                <span
                  key={idx}
                  className='bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full capitalize'
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trip Note */}
        {tripNote && (
          <div className='pt-2'>
            <p className='text-xs text-gray-600 bg-gray-50 border border-gray-100 p-3.5 rounded-xl leading-relaxed'>
              {tripNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripStats;
