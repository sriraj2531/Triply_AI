import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, Star, Clock, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/**
 * TripMap – Phase 4 interactive map view.
 *
 * Uses Leaflet + OpenStreetMap (100% free, no API key required).
 * Day-wise colored circle markers, side-panel list, day-filter tabs.
 */

// Fix Leaflet's broken default icon paths when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Color palette for up to 10 days (cycles beyond that)
const DAY_COLORS = [
  { bg: 'bg-indigo-600',  text: 'text-indigo-600',  light: 'bg-indigo-50',  border: 'border-indigo-200',  hex: '#4F46E5' },
  { bg: 'bg-rose-500',    text: 'text-rose-500',    light: 'bg-rose-50',    border: 'border-rose-200',    hex: '#F43F5E' },
  { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', hex: '#059669' },
  { bg: 'bg-amber-500',   text: 'text-amber-500',   light: 'bg-amber-50',   border: 'border-amber-200',   hex: '#F59E0B' },
  { bg: 'bg-violet-600',  text: 'text-violet-600',  light: 'bg-violet-50',  border: 'border-violet-200',  hex: '#7C3AED' },
  { bg: 'bg-cyan-600',    text: 'text-cyan-600',    light: 'bg-cyan-50',    border: 'border-cyan-200',    hex: '#0891B2' },
  { bg: 'bg-orange-500',  text: 'text-orange-500',  light: 'bg-orange-50',  border: 'border-orange-200',  hex: '#F97316' },
  { bg: 'bg-teal-600',    text: 'text-teal-600',    light: 'bg-teal-50',    border: 'border-teal-200',    hex: '#0D9488' },
  { bg: 'bg-pink-500',    text: 'text-pink-500',    light: 'bg-pink-50',    border: 'border-pink-200',    hex: '#EC4899' },
  { bg: 'bg-lime-600',    text: 'text-lime-600',    light: 'bg-lime-50',    border: 'border-lime-200',    hex: '#65A30D' },
];

/**
 * Creates a color-coded SVG circle marker icon for a given day color.
 */
function makeDayIcon(hex, dayLabel) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
            fill="${hex}" opacity="0.92"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.95"/>
      <text x="16" y="20" text-anchor="middle"
            font-size="9" font-weight="700" fill="${hex}" font-family="sans-serif">
        ${dayLabel}
      </text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

/**
 * Collects all sightseeing activities (non-meal) from the itinerary that have valid coordinates.
 */
function collectPins(itinerary) {
  const pins = [];
  (itinerary || []).forEach((day, dayIndex) => {
    const colorIndex = dayIndex % DAY_COLORS.length;
    (day.activities || []).forEach((activity) => {
      const lat = activity?.coordinates?.latitude;
      const lng = activity?.coordinates?.longitude;
      if (lat && lng && !activity.isMealOrBreak) {
        pins.push({
          dayNumber: day.dayNumber || dayIndex + 1,
          theme: day.theme || '',
          colorIndex,
          activity,
        });
      }
    });
  });
  return pins;
}

/**
 * Helper component: flies the map to show all current pins.
 */
function FitBounds({ pins }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    const bounds = L.latLngBounds(
      pins.map((p) => [p.activity.coordinates.latitude, p.activity.coordinates.longitude])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [pins, map]);
  return null;
}

/**
 * TripMap component – renders an OpenStreetMap with day-colored pins.
 *
 * @param {{ trip: Object }} props
 */
const TripMap = ({ trip }) => {
  const [selectedDay, setSelectedDay] = useState('all');

  const itinerary = trip?.tripData?.itinerary || [];

  const allPins = useMemo(() => collectPins(itinerary), [itinerary]);

  const filteredPins = useMemo(() => {
    if (selectedDay === 'all') return allPins;
    return allPins.filter((p) => String(p.dayNumber) === String(selectedDay));
  }, [allPins, selectedDay]);

  const uniqueDays = useMemo(() => {
    const seen = new Set();
    return itinerary
      .map((d, i) => ({ dayNumber: d.dayNumber || i + 1, theme: d.theme || '', colorIndex: i % DAY_COLORS.length }))
      .filter((d) => { if (seen.has(d.dayNumber)) return false; seen.add(d.dayNumber); return true; });
  }, [itinerary]);

  // Compute initial center from first pin, fallback to [20, 77] (India)
  const initialCenter = useMemo(() => {
    const first = allPins[0];
    return first
      ? [first.activity.coordinates.latitude, first.activity.coordinates.longitude]
      : [20, 77];
  }, [allPins]);

  if (allPins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <MapPin className="w-10 h-10 text-gray-300 mb-3" />
        <h4 className="font-semibold text-gray-600 text-sm">No Map Data Available</h4>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Coordinates were not resolved for this trip's activities. Regenerate the trip to get map pins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Day filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            selectedDay === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          All Days
        </button>
        {uniqueDays.map((day) => {
          const color = DAY_COLORS[day.colorIndex];
          const isActive = String(selectedDay) === String(day.dayNumber);
          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDay(day.dayNumber)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isActive
                  ? `${color.bg} text-white border-transparent shadow-sm`
                  : `${color.light} ${color.text} ${color.border} hover:shadow-xs`
              }`}
            >
              Day {day.dayNumber}
            </button>
          );
        })}
      </div>

      {/* Map + pin list */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Leaflet map */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 420 }}>
          <MapContainer
            center={initialCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit bounds when filtered pins change */}
            <FitBounds pins={filteredPins} />

            {filteredPins.map((pin, idx) => {
              const color = DAY_COLORS[pin.colorIndex];
              const icon = makeDayIcon(color.hex, `D${pin.dayNumber}`);
              const mapsUrl = pin.activity.placeId
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.activity.activityName)}&query_place_id=${pin.activity.placeId}`
                : `https://www.google.com/maps/search/?api=1&query=${pin.activity.coordinates.latitude},${pin.activity.coordinates.longitude}`;

              return (
                <Marker
                  key={idx}
                  position={[pin.activity.coordinates.latitude, pin.activity.coordinates.longitude]}
                  icon={icon}
                >
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[180px]">
                      <p className={`font-bold text-sm ${color.text}`}>
                        Day {pin.dayNumber}: {pin.activity.activityName}
                      </p>
                      {pin.activity.timeRange && (
                        <p className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 inline" /> {pin.activity.timeRange}
                        </p>
                      )}
                      {pin.activity.rating && (
                        <p className="text-yellow-600 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline" /> {pin.activity.rating}
                        </p>
                      )}
                      {pin.activity.address && (
                        <p className="text-gray-400 text-[11px]">{pin.activity.address}</p>
                      )}
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-indigo-600 font-semibold hover:underline"
                      >
                        Open in Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Scrollable pin list */}
        <div className="lg:col-span-2 max-h-[420px] overflow-y-auto space-y-2 pr-1">
          {filteredPins.length === 0 ? (
            <p className="text-xs text-gray-500 text-center p-4">No activities for the selected day.</p>
          ) : (
            filteredPins.map((pin, idx) => {
              const color = DAY_COLORS[pin.colorIndex];
              const mapsUrl = pin.activity.placeId
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.activity.activityName)}&query_place_id=${pin.activity.placeId}`
                : `https://www.google.com/maps/search/?api=1&query=${pin.activity.coordinates.latitude},${pin.activity.coordinates.longitude}`;

              return (
                <a
                  key={idx}
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-3 p-3 rounded-xl border ${color.border} ${color.light} hover:shadow-sm transition-all group`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full ${color.bg} text-white flex items-center justify-center text-[10px] font-bold shadow-xs`}>
                    D{pin.dayNumber}
                  </div>

                  <div className="grow min-w-0">
                    <p className={`text-xs font-bold ${color.text} truncate group-hover:underline`}>
                      {pin.activity.activityName}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
                      {pin.activity.timeRange && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {pin.activity.timeRange}
                        </span>
                      )}
                      {pin.activity.rating && (
                        <span className="text-[10px] text-yellow-600 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          {pin.activity.rating}
                        </span>
                      )}
                    </div>
                    {pin.activity.address && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{pin.activity.address}</p>
                    )}
                  </div>

                  <Navigation className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${color.text} opacity-60`} />
                </a>
              );
            })
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-right">
        {filteredPins.length} location{filteredPins.length !== 1 ? 's' : ''} shown · Click any pin to see details · Map data © OpenStreetMap
      </p>
    </div>
  );
};

export default TripMap;
