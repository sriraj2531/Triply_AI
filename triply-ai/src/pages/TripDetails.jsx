import React, { useEffect, useState } from 'react'
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Calendar } from 'lucide-react';
import Itinerary from '../components/shared/Itinerary';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import HotelCard from '../components/shared/HotelCard';
import TripStats from '../components/shared/TripStats';
import { getPlacePhoto } from '../services/placePhotoApi';

const TripDetails = () => {
  const { tripId } = useParams()
  const [trip, setTrip] = useState([])
  const [placePhoto, setPlacePhoto] = useState("")
  const navigate = useNavigate()

  const fetchTripData = async () => {
    const docRef = doc(db, "trips-ai", tripId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("Document data:", docSnap.data());
      setTrip(docSnap.data())
    } else {
      console.log("No such document!");
    }
  }

  useEffect(() => {
    if (tripId) {
      fetchTripData()
    }
  }, [tripId])

  useEffect(() => {
    if(!trip?.userSelection?.destination?.label){
      return
    }

    const loadPhoto = async () => {
      const photoUrl = await getPlacePhoto(trip?.userSelection?.destination?.label)
      setPlacePhoto(photoUrl)
    }
    loadPhoto()
  },[trip])


  return trip && (
    <div>
      <div className='min-h-screen bg-background'>
        <div className='relative h-88 md:h-111 bg-gray-900 overflow-hidden'>
          <img src={placePhoto?placePhoto:'/private.png'} alt="" className='w-full h-full object-cover object-center' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transport to-transparent ' />

          <div className='max-padd-container absolute bottom-0 left-0 right-0 text-white'>
            <button onClick={() => navigate('/create-trip')} className='flex items-center gap-2 mb-4 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/30 transition-colors'>
              <FaArrowLeftLong /> Plan Another Trip
            </button>
            <h1 className='mb-2'>{trip?.userSelection?.destination?.value?.terms[0].value}</h1>
            <p className='max-w-2xl mb-10 text-gray-300'>{trip?.tripData?.tripNote?.split('.')[0]}</p>
          </div>
        </div>

        <div className='max-padd-container py-12 '>
          <div className='relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8'>

            {/* Left Column -> Itinerary Card Container */}
            <div className='lg:col-span-2'>
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>

                {/* Header Title with Icon */}
                <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-indigo-600' />
                  Your Daily Plan
                </h2>

                {/* Itinerary Component placed directly below title */}
                <Itinerary trip={trip} />

              </div>
            </div>

            {/* Right Column -> Hotels & Trip Summary */}
            <div className='space-y-6'>
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 3000,
                  }),
                ]}
              >
                <CarouselContent>
                  {trip?.tripData?.hotelsOptions.map((hotel, index) => (
                    <CarouselItem key={index}>
                      <HotelCard hotel={hotel} />
                    </CarouselItem>
                  ))}

                </CarouselContent>
              </Carousel>
              <TripStats trip={trip}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripDetails