import React, { useEffect, useState } from 'react';
import { getPlacePhoto } from '../../services/placePhotoApi';
import { Clock, Navigation, Ticket, Utensils } from 'lucide-react';

const ActivityCard = ({ activity, destination = "" }) => {
  const [placePhoto, setPlacePhoto] = useState('');

  useEffect(() => {
    if (!activity?.activityName) {
      return;
    }

    let isMounted = true;
    const loadPhoto = async () => {
      const photoUrl = await getPlacePhoto(activity.activityName, destination);
      if (isMounted && photoUrl) {
        setPlacePhoto(photoUrl);
      }
    };
    loadPhoto();

    return () => {
      isMounted = false;
    };
  }, [activity?.activityName, destination]);

  if (!activity) return null;

  const isMeal = Boolean(
    activity.isMealOrBreak ||
    activity.activityName?.toLowerCase().includes('lunch') ||
    activity.activityName?.toLowerCase().includes('meal') ||
    activity.activityName?.toLowerCase().includes('restaurant')
  );

  const mapUrl = activity.placeId
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.activityName)}&query_place_id=${activity.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activity.activityName || ''}, ${destination || ''}`.trim())}`;

  return (
    <div className='group relative flex gap-x-5'>
      {/* Icon / Timeline indicator */}
      <div className='relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-200'>
        <div
          className={`relative z-10 size-6 text-white rounded-full flex items-center justify-center text-xs shadow-xs ${
            isMeal ? 'bg-amber-500' : 'bg-indigo-600'
          }`}
        >
          {isMeal ? <Utensils className="w-3.5 h-3.5" /> : '🧭'}
        </div>
      </div>

      {/* Right Content */}
      <div className='grow pb-8 group-last:pb-2'>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
          <span className="font-bold text-sm text-gray-900 flex items-center gap-1">
            <Clock className={`w-3.5 h-3.5 ${isMeal ? 'text-amber-600' : 'text-indigo-600'}`} />
            {activity.timeRange || 'Flexible timing'}
          </span>

          {isMeal && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              🍽️ Midday Lunch Break
            </span>
          )}

          {activity.timeToTravel && (
            <span className='text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full'>
              <Navigation className="w-3 h-3 text-gray-500" />
              {activity.timeToTravel}
            </span>
          )}
        </div>

        {/* Card linking out to Google Maps */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${activity.activityName || 'activity'} on Google Maps`}
          className={`block border rounded-xl hover:shadow-md transition-all overflow-hidden bg-white group/card ${
            isMeal
              ? 'border-amber-200 hover:border-amber-300'
              : 'border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className='relative flex flex-col sm:flex-row sm:items-center overflow-hidden'>
            <div className='h-40 sm:w-48 sm:h-full sm:absolute inset-0 bg-gray-100 overflow-hidden'>
              <img
                src={placePhoto || '/private.png'}
                alt={activity.activityName ? `Photo of ${activity.activityName}` : 'Activity venue'}
                className='h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300'
                loading="lazy"
              />
            </div>

            <div className='grow p-4 sm:ms-48'>
              <div className='min-h-24 flex flex-col justify-center'>
                <div className="flex items-start justify-between gap-2">
                  <h6
                    className={`font-bold transition-colors ${
                      isMeal
                        ? 'text-gray-900 group-hover/card:text-amber-700'
                        : 'text-gray-900 group-hover/card:text-indigo-600'
                    }`}
                  >
                    {activity.activityName || 'Activity'}
                  </h6>
                  {activity.ticketPrice && (
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                        isMeal
                          ? 'text-amber-800 bg-amber-50'
                          : 'text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      <Ticket className="w-3 h-3 mr-1" />
                      {activity.ticketPrice}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {activity.description || 'Explore and experience this attraction.'}
                </p>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default ActivityCard;
