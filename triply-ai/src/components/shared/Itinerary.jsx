import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ActivityCard from './ActivityCard';
import { CalendarDays, AlertCircle } from 'lucide-react';

const Itinerary = ({ trip }) => {
  const itineraryList = trip?.tripData?.itinerary || [];
  const destination = trip?.userSelection?.destination?.label || "";

  if (!itineraryList || itineraryList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
        <h4 className="font-semibold text-gray-700">No Itinerary Details Available</h4>
        <p className="text-xs text-gray-500 mt-1">
          The daily itinerary plan could not be loaded for this trip.
        </p>
      </div>
    );
  }

  return (
    <section>
      <Accordion type="single" collapsible={true} defaultValue="item-1" className="w-full space-y-3">
        {itineraryList.map((itinerary, index) => {
          const activities = itinerary?.activities || [];
          const dayNum = itinerary?.dayNumber || index + 1;
          const theme = itinerary?.theme || 'Exploration & Sights';

          return (
            <AccordionItem
              value={`item-${index + 1}`}
              key={index}
              className="border border-gray-100 rounded-xl px-4 bg-gray-50/50 overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
                    D{dayNum}
                  </span>
                  <div className="text-left">
                    <span className="text-sm font-bold text-gray-900 block">
                      Day {dayNum}: {theme}
                    </span>
                    <span className="text-xs text-gray-500">
                      {activities.length} planned {activities.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-2 pb-4">
                {activities.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {activities.map((activity, i) => (
                      <ActivityCard
                        key={i}
                        activity={activity}
                        destination={destination}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic p-4 text-center">
                    No activities scheduled for this day.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
};

export default Itinerary;
