import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ActivityCard from './ActivityCard'

const Itinerary = ({trip}) => {
  return (
    <section>
      <Accordion type="single" collapsible="true" defaultValue={"item-1"}>
        {trip?.tripData?.itinerary.map((itinerary, index) => (
          <AccordionItem value={`item-${index+1}`} key={index} className='border-gray-900'>
            <AccordionTrigger className='flex items-start justify-start text-[16px] font-bold'>Day: {itinerary.dayNumber} : {itinerary.theme} </AccordionTrigger>
            <AccordionContent>
              {/* timeline */}
              <div className='mt-4'>
                {/* Item-Activity */}
                {itinerary.activities?.map((activity,i) => (
                  <ActivityCard key={i} activity={activity}/>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export default Itinerary