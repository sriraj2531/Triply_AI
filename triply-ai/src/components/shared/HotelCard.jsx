import { Button } from "@/components/ui/button";
import { Star, MapPin, BedDouble, Utensils } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getPlacePhoto } from "../../services/placePhotoApi";

/**
 * HotelCard – Phase 4 update
 *
 * Priority for photos:
 *   1. hotel.photoUrl  — pre-resolved at generation time (no extra API call)
 *   2. Live getPlacePhoto() call — only when photoUrl is missing
 *
 * Coordinates stored on the hotel object are used to build a precise Maps link.
 */
const HotelCard = ({ hotel, destination = "" }) => {
    // Start with the pre-resolved photo URL if available
    const [placePhoto, setPlacePhoto] = useState(hotel?.photoUrl || '');

    useEffect(() => {
        // If the trip document already has a resolved photo, use it immediately
        if (hotel?.photoUrl) {
            setPlacePhoto(hotel.photoUrl);
            return;
        }

        if (!hotel?.hotelName) return;

        let isMounted = true;
        const loadPhoto = async () => {
            const photoUrl = await getPlacePhoto(hotel.hotelName, destination || hotel.hotelAddress || "");
            if (isMounted && photoUrl) {
                setPlacePhoto(photoUrl);
            }
        };
        loadPhoto();

        return () => {
            isMounted = false;
        };
    }, [hotel?.hotelName, hotel?.photoUrl, destination, hotel?.hotelAddress]);

    if (!hotel) return null;

    // Build Maps URL: prefer placeId deep link, fall back to coordinate link, then name search
    let mapUrl;
    if (hotel.placeId) {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.hotelName)}&query_place_id=${hotel.placeId}`;
    } else if (hotel.coordinates?.latitude && hotel.coordinates?.longitude) {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${hotel.coordinates.latitude},${hotel.coordinates.longitude}`;
    } else {
        mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.hotelName || ''}, ${hotel.hotelAddress || destination || ''}`.trim())}`;
    }

    const formattedPrice = typeof hotel.priceRange === 'string'
        ? (hotel.priceRange.split(' p')[0] || hotel.priceRange)
        : (hotel.priceRange || 'Check Rates');

    return (
        <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View details for ${hotel.hotelName || 'stay'} on Google Maps`}
            className="block group"
        >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img
                        src={placePhoto || '/private.png'}
                        alt={hotel.hotelName ? `Photo of ${hotel.hotelName}` : 'Accommodation stay'}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                    {hotel.rating && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-sm text-xs font-bold flex items-center text-gray-800">
                            <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                            {hotel.rating}
                        </div>
                    )}
                    {hotel.stayType && (
                        <div className="absolute top-3 left-3 bg-indigo-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                            <BedDouble className="w-3 h-3" />
                            {hotel.stayType}
                        </div>
                    )}
                </div>

                <div className="p-5 flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block">
                            Recommended Stay
                        </span>
                        <h5 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {hotel.hotelName || 'Boutique Stay'}
                        </h5>
                        {hotel.hotelAddress && (
                            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                {hotel.hotelAddress}
                            </p>
                        )}
                        <p className="text-xs text-gray-600 mt-1 mb-2 line-clamp-2 leading-relaxed">
                            {hotel.description || 'A highly rated stay offering comfortable lodging and prime connectivity.'}
                        </p>

                        {/* Opening hours badge (from Places API) */}
                        {hotel.openingHours && (
                            <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg mb-2 line-clamp-1">
                                🕐 {hotel.openingHours.split('|')[0].trim()}
                            </p>
                        )}

                        {/* Dining & Food Highlights */}
                        {hotel.foodHighlights && (
                            <p className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-100 px-2.5 py-1.5 rounded-lg mb-2 flex items-center gap-1.5 line-clamp-1">
                                <Utensils className="w-3 h-3 text-emerald-600 shrink-0" />
                                {hotel.foodHighlights}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <div>
                            <h5 className="text-sm font-bold text-gray-900">{formattedPrice}</h5>
                            <span className="text-[10px] text-gray-500 font-normal uppercase">est. per night</span>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4"
                        >
                            View on Maps
                        </Button>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default HotelCard;
