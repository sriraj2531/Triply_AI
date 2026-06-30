import { Calendar, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { BUDGET_OPTIONS, TRAVELER_OPTIONS } from '../assets/data';
import { toast } from 'sonner';
import { generateTripWithAI } from '../services/aiModel';
import LoginDialog from '../components/shared/LoginDialog';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const CreateTrip = () => {
    // Make sure your environment variables are correctly defined in your .env file
    const [openDialog, setOpenDialog] = useState(false);
    const placesApikey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        destination: null,
        noOfDays: '',
        traveller: '',
        budget: '',
    });
    const handleInputChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        }
        else {
            generateTrip()
        }
    }

    const generateTrip = async () => {
        const user = localStorage.getItem("user")
        if (!user) {
            return setOpenDialog(true)
        }


        if (!formData.destination || !formData.noOfDays || !formData.budget || !formData.traveler) {
            return toast.error('Please fill all details.')
        }
        if (formData.noOfDays > 10) {
            return toast.error("AI can currently generate up to 5 days only.")
        }
        setLoading(true)
        // console.log(formData)


        // const DYNAMIC_PROMPT = `Generate a travel plan for Location: ${formData?.destination?.label} for ${formData?.
        //     noOfDays} days for a ${formData?.traveler} traveler on ${formData?.budget} budget.Generate a full itinerary with at least 4 distinct activities per day as per the time constraints and use the accurate time and data for creating the itinery and Return the result strictly as a 
        //     single JSON object using camelCase keys, the travel plan with trip note and must feature hotelsOptions array with atleast 5 hotels, each 
        //     hotel with hotelName, hotelAddress, priceRange, imageUrl, rating, description, and a coordinates, alongside an 
        //     itinerary array of daily plans and For each hotel option, provide a localized priceRange string using the native currency symbol of the destination city. Each day must include a dayNumber, theme, and an activities array, where each 
        //     activity contains activityName, description, imageUrl, ticketPrice, timeRange, timeToTravel and coordinates`;
        const DYNAMIC_PROMPT = `You are an expert AI Travel Planner specializing in highly efficient, geographically optimized itineraries. 
        Generate a comprehensive, zero-redundancy travel plan for Destination: ${formData?.destination?.label}, 
        lasting up to a maximum of 10 days (generate exactly ${formData?.noOfDays} days), tailored for 
        a ${formData?.traveler} traveler on a ${formData?.budget} budget tier.To ensure maximum efficiency, 
        you must scale your suggestions to comprehensively cover 100% of the major landmarks, iconic attractions,
        and famous activities surrounding this locality without ever repeating a location or backtracking. Group all activities geographically by neighborhood or district per day to eliminate overlapping routes and minimize transit times. 
        You must provide exactly 4 distinct activities per day distributed logically across morning, midday, 
        afternoon, and evening slots, using realistic operational time ranges, accurate native coordinate points,
         and precise estimated transit durations ('timeToTravel') between consecutive spots.Crucially, 
        all prices, ticket costs, and hotel budget ranges must be localized to the destination city, 
        dynamically using the exact native currency symbol of that region (such as ₹ for India, $ for the USA, 
        or € for Europe) instead of generic USD.In the trip overview or note section, you must specifically 
        curate a detailed list of the absolute most famous local food items, regional delicacies, and must-try 
        dishes unique to that exact locality.Finally, you must curate an array of at least 10 distinct, 
        highly-rated hotel options that match the specified budget tier, sorting them to feature the options
        with the best traveler review ratings first.`

        try {
            const tripData = await generateTripWithAI(DYNAMIC_PROMPT);
            // console.log("TripData : ", tripData)
            await saveToDB(tripData)
        } catch (error) {
            setLoading(false)
            console.log("AI Error :", error)
            toast.error(error.message?.includes('429') ? "Rate limit hit! Wait 60s." : "Generation Failed");
            if (error.message?.includes("503") || error.toString().includes("demand")) {
                toast.error("AI servers are busy right now. Please click 'Generate Plan' again in a few seconds.");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
    }

    const saveToDB = async (tripdata) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"))
            // Add a new document in collection "cities"
            const docId = Date.now().toString()
            await setDoc(doc(db, "trips-ai", docId), {
                userSelection: formData,
                tripData: tripdata,
                userEmail: user?.email,
                id: docId
            });
            setLoading(false)
            toast.success("Trip Generated !!!")
            navigate("/trips/" + docId)
        } catch (error) {
            setLoading(false)
            // toast.error("Failed to Save to DataBase")
            console.error("Firestore Save Error: ", error); // This tells you EXACTLY why it failed
            setLoading(false)
            toast.error("Failed to Save to DataBase")
        }
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-white flexCenter flex-col p-4'>
                <div className='relative'>
                    <div className='absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25' />
                    <div className='relative bg-white p-4 rounded-full shadow-xl'>
                        <Loader2 className='w-12 h-12 text-indigo-600 animate-spin' />
                    </div>
                </div>
                <h3 className='mt-8 text-gray-900 '>Curating your trip to {formData.destination?.label?.split(',')[0]}...</h3>
                <p className='mt-2 test-gray-500 animate-pulse'>Our AI is finding the best hotels and hidden Gems ...</p>
            </div>
        )
    }

    // Handle selection changes to update your formData state
    const handlePlaceSelect = (place) => {
        setFormData((prev) => ({ ...prev, destination: place }));
    };

    return (
        <div className='max-padd-container flexCenter pt-18 h-screen '>
            {/* Container */}
            <div className='w-full max-w-3xl min-h-[86vh] sm:min-h-[80vh] bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col'>
                {/* Progress Bar */}
                <div className='h-2 bg-indigo-100 w-full '>
                    <div className='h-full bg-indigo-600 transition-all duration-500 ease-out ' style={{ width: `${(step / 3) * 100}%` }} />
                </div>
                <div className='p-5 md:p-12 flex flex-col flex-1'>
                    {/* Steps Indicator */}
                    <div className='flexCenter space-x-2 mb-8'>
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-indigo-600' : step > s ? 'w-2 bg-indigo-600' : 'w-2 bg-gray-200'}`} />
                        ))}
                    </div>
                    <div className='flex-1 flex flex-col pt-2 sm:pt-12'>
                        {/* Step-1 : Destination & Days */}
                        {step === 1 && (
                            <div className='space-y-6 '>
                                <div className='text-center mb-8 '>
                                    <h3 className='mb-2'>Where's Your Next Adventure ?</h3>
                                    <p>Select Your Destination and Duration (max 5 days).</p>
                                </div>
                                <div className="space-y-4">
                                    <label className='text-sm font-medium ml-1'>Destination</label>

                                    {/* FIX: Changed "apikey" to "apiKey" */}
                                    <GooglePlacesAutocomplete
                                        apiKey={placesApikey}
                                        selectProps={{
                                            value: formData.destination,
                                            onChange: (v) => handleInputChange
                                                ('destination', v),
                                            className: 'w-full',
                                            placeholder: 'Search for a city...'
                                        }}
                                    />
                                    <div className='grid grid-cols-1 gap-4 pt-2'>
                                        <label className='text-sm font-medium ml-1'>How Many Days ?</label>
                                        <div className='relative '>
                                            <Calendar className='absolute left-3 top-3 h-5 w-5 text-gray-400' />
                                            <input type='number' min={1} max={5} placeholder='1' value={formData.numOfDays} onChange={(e) => handleInputChange('noOfDays', e.target.value)} className='block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all bg-gray-50' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Second Step */}
                        {step === 2 && (
                            <div className='space-y-8'>
                                <div className='text-center'>
                                    <h3 className='mb-2'>What's Your Budget ?</h3>
                                    <p>We'll find spots that match your wallet</p>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    {BUDGET_OPTIONS.map((opt) => (
                                        <button key={opt.id} onClick={() => handleInputChange('budget', opt.id)}
                                            className={`p-4 rounded-xl border-2 transition-all flexCenter flex-col gap-3 ${formData.budget === opt.id ?
                                                'border-indigo-600 bg-indigo-50 shadow-md scale-105' : 'border-gray-100 hover:border-indigo-200'
                                                }`}>

                                            <div className={`p-3 rounded-full ${formData.budget === opt.id ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                                {opt.icon}
                                            </div>
                                            <h5 className='font-bold'> {opt.label} </h5>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Traveller Type */}
                        {step === 3 && (
                            <div className='space-y-8'>
                                <div className='text-center'>
                                    <h3 className='mb-2'>Who are you Travelling With ?</h3>
                                    <p>Customize your experience based on your group</p>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4'>
                                    {TRAVELER_OPTIONS.map((opt) => (
                                        <button key={opt.id} onClick={() => handleInputChange('traveler', opt.id)}
                                            className={`p-4 rounded-xl border-2 transition-all flexCenter flex-col gap-3 ${formData.traveler === opt.id ?
                                                'border-indigo-600 bg-indigo-50 shadow-md scale-105' : 'border-gray-100 hover:border-indigo-200'
                                                }`}>

                                            <span className={'text-3xl'}>
                                                {opt.icon}
                                            </span>
                                            <div>
                                                <h5 className='font-bold'> {opt.title} </h5>
                                                <p className='opacity-75'>{opt.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className='flexBetween pt-6 border-t border-gray-100'>
                        <button onClick={handleBack} className={`text-gray-500 hover:text-gray-900 font-medium px-4 py-2 ${step === 1 && 'invisible'}`}>
                            Back
                        </button>
                        <button onClick={handleNext} disabled={(step === 1 && (!formData.destination || !formData.noOfDays)) ||
                            (step === 2 && !formData.budget) ||
                            (step === 3 && !formData.traveler)} className={`flex items-center px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${(step === 1 && !formData.destination) || (step === 1 && !formData.noOfDays) || (step === 2 && !formData.budget) || (step === 3 && !formData.traveler) ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
                            {step === 3 ? "Generate Plan" : "Continue"}
                            {step === 3 ? <CheckCircle className="ml-2 w-5 h-5" /> : <ArrowRight className="ml-2 w-5 h-5" />}
                        </button>
                    </div>

                </div>
            </div>
            <LoginDialog open={openDialog} onClose={() => setOpenDialog(false)} onLoginSuccess={generateTrip} />
        </div>
    );
};

export default CreateTrip;