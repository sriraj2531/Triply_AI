import { Banknote, Clock, Info, MapPin, Users } from 'lucide-react'
import React from 'react'

const TripStats = ({trip}) => {
  return trip && (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'>
      <h4 className='text-gray-900 mb-4 flex items-center gap-2'>
        <Info className='h-4 w-4 text-indigo-600'/>
        TripOverview
      </h4>
      <div className='space-y-3'>
        <div className='flex justify-between items-center border-b border-gray-100'>
          <div className='flex items-center gap-2 text-sm'>
            <Banknote className='h-4 w-4'/>
            <h6>Budget</h6>
          </div>
          <p>{trip?.userSelection?.budget}</p>
        </div>
        <div className='flex justify-between items-center border-b border-gray-100'>
          <div className='flex items-center gap-2 text-sm'>
            <Users className='h-4 w-4'/>
            <h6>Traveler</h6>
          </div>
          <p>{trip?.userSelection?.traveler}</p>
        </div>
        <div className='flex justify-between items-center border-b border-gray-100'>
          <div className='flex items-center gap-2 text-sm'>
            <Clock className='h-4 w-4'/>
            <h6>No of Days</h6>
          </div>
          <p>{trip?.userSelection?.noOfDays}</p>
        </div>
        <div className='flex flex-col gap-2 py-2'>
          <div className='flex items-center gap-2 text-sm'>
            <MapPin className='h-4 w-4'/>
            <h6>Location:</h6>
            <p>{trip?.userSelection?.destination?.label}</p>
          </div>
          <p className='text-s text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed'>{trip?.tripData?.tripNote}</p>
        </div>
      </div>
    </div>
  )
}

export default TripStats