import React from 'react';
import {
  Compass,
  Calendar,
  Thermometer,
  CloudRain,
  Users,
  Plane,
  Bus,
  Utensils,
  PartyPopper,
  ShieldCheck,
  Luggage,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const DestinationInfo = ({ destinationInfo, userSelection }) => {
  if (!destinationInfo) return null;

  const {
    overview,
    bestTimeToVisit,
    howToReach,
    localTransport,
    foodToTry = [],
    festivals = [],
    safetyAndEtiquette,
    packingTips = []
  } = destinationInfo;

  const selectedMonth = userSelection?.travelMonth || 'Flexible';
  const monthlyGuide = bestTimeToVisit?.monthlyGuide || [];
  const isSelectedMonthGood = bestTimeToVisit?.isSelectedMonthGood;
  const selectedMonthAdvice = bestTimeToVisit?.selectedMonthAdvice;

  // Helper for badge coloring based on rating
  const getRatingBadge = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'best':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'good':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'avoid':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-6 sm:p-8 space-y-8">
      {/* 1. Header & Overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" /> Destination Intelligence & Guide
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          About the Destination
        </h2>
        {overview && (
          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
            {overview}
          </p>
        )}
      </div>

      {/* 2. Best Time to Visit & 12-Month Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              12-Month Climate & Crowd Guide
            </h3>
            <p className="text-xs text-gray-500">
              Seasonal ratings, temperatures, rainfall, and tourist flow month by month.
            </p>
          </div>

          {bestTimeToVisit?.bestMonths?.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5" /> Prime Months: {bestTimeToVisit.bestMonths.join(', ')}
            </div>
          )}
        </div>

        {/* 12-Month Horizontal Strip */}
        {monthlyGuide.length > 0 && (
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="grid grid-flow-col auto-cols-[130px] sm:auto-cols-[140px] gap-2.5 min-w-max">
              {monthlyGuide.map((m, idx) => {
                const isSelected = selectedMonth.toLowerCase() === m.month?.toLowerCase();

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500'
                        : 'border-gray-100 bg-gray-50/40 hover:border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-bold text-xs text-gray-900">
                          {m.month?.substring(0, 3)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRatingBadge(
                            m.rating
                          )}`}
                        >
                          {m.rating || 'Good'}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-gray-600">
                        {m.avgTempC && (
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{m.avgTempC}</span>
                          </div>
                        )}
                        {m.rainfall && (
                          <div className="flex items-center gap-1">
                            <CloudRain className="w-3 h-3 text-sky-500 shrink-0" />
                            <span className="truncate">{m.rainfall}</span>
                          </div>
                        )}
                        {m.crowdLevel && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-purple-500 shrink-0" />
                            <span>{m.crowdLevel} crowds</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {m.note && (
                      <p className="text-[10px] text-gray-500 mt-2 pt-1 border-t border-gray-100 line-clamp-2">
                        {m.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Month Advice Banner */}
        {selectedMonth !== 'Flexible' && selectedMonthAdvice && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isSelectedMonthGood !== false
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {isSelectedMonthGood !== false ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">
                Advice for Your Selected Month ({selectedMonth})
              </h4>
              <p className="text-xs leading-relaxed">{selectedMonthAdvice}</p>
            </div>
          </div>
        )}

        {/* Peak & Off Season Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {bestTimeToVisit?.peakSeason && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 block mb-0.5">Peak Season</span>
              <p className="text-gray-600">{bestTimeToVisit.peakSeason}</p>
            </div>
          )}
          {bestTimeToVisit?.offSeason && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 block mb-0.5">Off / Low Season</span>
              <p className="text-gray-600">{bestTimeToVisit.offSeason}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Transport & Transit Connectivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {howToReach && (
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-2">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Plane className="w-4 h-4 text-indigo-600" />
              How to Reach
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">{howToReach}</p>
          </div>
        )}

        {localTransport && (
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-2">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Bus className="w-4 h-4 text-indigo-600" />
              Getting Around Locally
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">{localTransport}</p>
          </div>
        )}
      </div>

      {/* 4. Food to Try & Local Festivals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Food Specialties */}
        {foodToTry.length > 0 && (
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-indigo-600" />
              Local Culinary Specialties
            </h4>
            <div className="flex flex-wrap gap-2">
              {foodToTry.map((dish, i) => (
                <span
                  key={i}
                  className="bg-white border border-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-2xs"
                >
                  🍽️ {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Festivals */}
        {festivals.length > 0 && (
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-indigo-600" />
              Celebrations & Festivals
            </h4>
            <div className="space-y-2">
              {festivals.map((fest, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-gray-100"
                >
                  <span className="font-semibold text-gray-900">{fest.name}</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    {fest.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Safety, Etiquette & Packing Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safetyAndEtiquette && (
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-2">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Safety & Local Etiquette
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">{safetyAndEtiquette}</p>
          </div>
        )}

        {packingTips.length > 0 && (
          <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Luggage className="w-4 h-4 text-indigo-600" />
              Packing Checklist Tips
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              {packingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationInfo;

