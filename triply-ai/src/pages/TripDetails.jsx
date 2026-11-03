import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../services/firebaseConfig';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Calendar, AlertCircle, Home as HomeIcon, Hotel, Map, List } from 'lucide-react';
import Itinerary from '../components/shared/Itinerary';
import DestinationInfo from '../components/shared/DestinationInfo';
import TripMap from '../components/shared/TripMap';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import HotelCard from '../components/shared/HotelCard';
import TripStats from '../components/shared/TripStats';
import { getPlacePhoto } from '../services/placePhotoApi';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const TripDetails = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [placePhoto, setPlacePhoto] = useState("");
  /** 'list' | 'map' – controls itinerary view toggle */
  const [itineraryView, setItineraryView] = useState('list');
  const navigate = useNavigate();

  useEffect(() => {
    if (!tripId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchTripData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "trips-ai", tripId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip(docSnap.data());
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching trip details:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripId]);

  useEffect(() => {
    const destinationLabel = trip?.userSelection?.destination?.label;
    if (!destinationLabel) return;

    let isMounted = true;
    const loadPhoto = async () => {
      const photoUrl = await getPlacePhoto(destinationLabel);
      if (isMounted && photoUrl) {
        setPlacePhoto(photoUrl);
      }
    };

    loadPhoto();
    return () => {
      isMounted = false;
    };
  }, [trip]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="relative h-80 md:h-96 bg-gray-200 animate-pulse">
          <div className="max-padd-container absolute bottom-8 left-0 right-0 space-y-3">
            <Skeleton className="h-6 w-36 bg-gray-300 rounded-full" />
            <Skeleton className="h-10 w-72 bg-gray-300 rounded-lg" />
            <Skeleton className="h-4 w-96 max-w-full bg-gray-300 rounded-md" />
          </div>
        </div>

        <div className="max-padd-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-48 rounded-lg" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found / error state ────────────────────────────────────────────────
  if (notFound || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
        <p className="text-gray-600 max-w-md mb-6 text-sm">
          The requested trip does not exist or may have been deleted. You can create a new travel plan anytime.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <HomeIcon className="w-4 h-4" /> Go Home
          </Button>
          <Button
            onClick={() => navigate('/create-trip')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            Create a New Trip
          </Button>
        </div>
      </div>
    );
  }

  const destinationLabel = trip?.userSelection?.destination?.label || 'Destination';
  const destinationCity =
    trip?.userSelection?.destination?.value?.terms?.[0]?.value ||
    destinationLabel.split(',')[0];
  const tripNoteIntro = trip?.tripData?.tripNote
    ? trip.tripData.tripNote.split('.')[0] + '.'
    : 'Custom tailored AI travel itinerary.';
  const hotels = trip?.tripData?.hotelsOptions || [];

  return (
    <div className='min-h-screen bg-gray-50/30'>
      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div className='relative h-88 md:h-112 bg-gray-900 overflow-hidden'>
        <img
          src={placePhoto || '/private.png'}
          alt={`Scenic view of ${destinationCity}`}
          className='w-full h-full object-cover object-center brightness-90'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent' />

        <div className='max-padd-container absolute bottom-0 left-0 right-0 pb-10 text-white'>
          <button
            onClick={() => navigate('/create-trip')}
            className='inline-flex items-center gap-2 mb-4 text-xs font-medium bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full hover:bg-white/30 transition-all cursor-pointer'
          >
            <FaArrowLeftLong /> Plan Another Trip
          </button>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 drop-shadow-sm'>
            {destinationCity}
          </h1>
          <p className='max-w-2xl text-sm sm:text-base text-gray-200 drop-shadow-sm leading-relaxed'>
            {tripNoteIntro}
          </p>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className='max-padd-container py-10 md:py-14 space-y-10'>

        {/* Destination Information, Climate Strip & Practical Guide */}
        {trip?.tripData?.destinationInfo && (
          <DestinationInfo
            destinationInfo={trip.tripData.destinationInfo}
            userSelection={trip.userSelection}
          />
        )}

        <div className='relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8'>

          {/* ── Left Column: Daily Itinerary + Map toggle ─────────────── */}
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-100 space-y-6'>

              {/* Header with List / Map toggle */}
              <div className='flex items-center justify-between pb-4 border-b border-gray-100'>
                <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2.5'>
                  <Calendar className='h-5 w-5 text-indigo-600' />
                  Your Daily Itinerary
                </h2>

                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setItineraryView('list')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      itineraryView === 'list'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                  <button
                    onClick={() => setItineraryView('map')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      itineraryView === 'map'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" /> Map
                  </button>
                </div>
              </div>

              {/* Days Planned badge */}
              <div className="flex items-center gap-2 -mt-4">
                <span className='text-xs text-gray-500 font-medium'>
                  {trip?.userSelection?.noOfDays || 1} Days Planned
                </span>
              </div>

              {/* Conditional view */}
              {itineraryView === 'list' ? (
                <Itinerary trip={trip} />
              ) : (
                <TripMap trip={trip} />
              )}
            </div>
          </div>

          {/* ── Right Column: Hotel Options & Trip Stats ──────────────── */}
          <div className='space-y-6'>
            {/* Hotels Recommendation Carousel */}
            <div className='bg-white p-6 rounded-3xl shadow-xs border border-gray-100 space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
                  <Hotel className='w-4 h-4 text-indigo-600' />
                  Where to Stay
                </h3>
                <span className='text-xs text-gray-400'>
                  {hotels.length} curated stays
                </span>
              </div>

              {hotels.length > 0 ? (
                <Carousel
                  plugins={[
                    Autoplay({
                      delay: 4000,
                      stopOnInteraction: true,
                    }),
                  ]}
                  className="w-full"
                >
                  <CarouselContent>
                    {hotels.map((hotel, index) => (
                      <CarouselItem key={index}>
                        <HotelCard hotel={hotel} destination={destinationCity} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <p className='text-xs text-gray-500 italic p-4 text-center bg-gray-50 rounded-xl'>
                  No hotel suggestions were returned for this trip.
                </p>
              )}
            </div>

            {/* Trip Overview Stats */}
            <TripStats trip={trip} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default TripDetails;
