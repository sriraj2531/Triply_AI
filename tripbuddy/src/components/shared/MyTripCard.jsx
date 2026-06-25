import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlacePhoto } from '../../services/placePhotoApi'
import { Banknote, Clock, MapPin,Users } from 'lucide-react'

const MyTripCard = ({ trip }) => {
    const [placePhoto, setPlacePhoto] = useState("")
    useEffect(() => {
        if (!trip?.userSelection?.destination?.label) {
            return
        }

        const loadPhoto = async () => {
            const photoUrl = await getPlacePhoto(trip?.userSelection?.destination?.label)
            setPlacePhoto(photoUrl)
        }
        loadPhoto()
    }, [trip])

    return (
        <Link to={'/trips/' + trip.id} className='bg-white rounded-2xl shadow-sm border border-gray-100 p-3 overflow-hidden'>
            <div className='h-40 relative '>
                <img src={placePhoto ? placePhoto : '/private.png'} alt={trip?.userSelection?.destination?.label} className="w-full h-full object-cover rounded-lg"/>
            </div>
            <div className='border-gray-500'>
                <h4 className='text-lg my-2 line-clamp-1'>
                    🗺️ {trip?.userSelection?.destination?.label}
                </h4>
                <div className='space-y-3 '>
                    <div className='flexBetween border-b border-gray-100'>
                        <div className='flex items-center gap-3 text-sm'>
                            <Banknote className='h-4 w-4' />
                            <h6>Budget</h6>
                        </div>
                        <p>{trip?.userSelection?.budget}</p>
                    </div>
                    <div className='flex justify-between items-center border-b border-gray-100'>
                        <div className='flex items-center gap-2 text-sm'>
                            <Users className='h-4 w-4' />
                            <h6>Traveler</h6>
                        </div>
                        <p>{trip?.userSelection?.traveler}</p>
                    </div>
                    <div className='flex justify-between items-center border-b border-gray-100'>
                        <div className='flex items-center gap-2 text-sm'>
                            <Clock className='h-4 w-4' />
                            <h6>No of Days</h6>
                        </div>
                        <p>{trip?.userSelection?.noOfDays}</p>
                    </div>
                    <div className='flex flex-col gap-2 py-2'>
                        <div className='flex items-center gap-2 text-sm'>
                            <MapPin className='h-4 w-4' />
                            <h6>Location:</h6>
                            <p>{trip?.userSelection?.destination?.label}</p>
                        </div>
                        <p className='text-s text-gray-600 bg-gray-100 p-3 rounded-lg leading-relaxed line-clamp-6'>{trip?.tripData?.tripNote}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default MyTripCard