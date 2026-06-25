// Change this:
// import { Button } from '@base-ui/react/button'

// To this (or wherever your shadcn button is located):
import { Button } from "@/components/ui/button"
import { Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPlacePhoto } from "../../services/placePhotoApi"

const HotelCard = ({ hotel }) => {
    const [placePhoto, setPlacePhoto] = useState('')
    useEffect(() => {
        if (!hotel?.hotelName) {
            return
        }

        const loadPhoto = async () => {
            const photoUrl = await getPlacePhoto(hotel?.hotelName)
            setPlacePhoto(photoUrl)
        }
        loadPhoto()
    }, [hotel])



    return hotel && (
        <Link to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.hotelName + "," + hotel?.hotelAddress} traget='_blank'>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer">
                <div className="h-40 bg-gray-200 relative">
                    <img src={placePhoto? placePhoto : '/private.png'} alt={hotel.hotelName} className='h-full w-full object-cover' />
                    <div className='absolute top-3 right-3 bg-white px-2 py-1 rounded-md shadow-sm text-xs font-bold flex items-center'>
                        <Star className='w-3 h-3 text-yellow-400 mr-1 fill-yellow-400' />{hotel.rating}
                    </div>
                </div>
                <div className='p-5'>
                    <span className='text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block'>Where you'll Stay</span>
                    <h5>{hotel.hotelName}</h5>
                    <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">🗺️{hotel.hotelAddress}</p>
                    <p className='text-sm mt-1 mb-2 line-clamp-3'>{hotel.description}</p>
                    <div className='flexBetween mt-auto pt-3'>
                        <div>
                            <h5>{hotel.priceRange.split(' p')[0]}</h5>
                            <span className='text-[10px] text-gray-500 font-normal uppercase'>est per Night</span>
                        </div>
                        <Button variant='destructive'>
                            View Deal
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default HotelCard