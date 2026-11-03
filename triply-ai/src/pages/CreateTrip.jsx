import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle,
    ArrowRight,
    Loader2,
    MapPin,
    Users,
    Compass,
    Plane,
    Utensils,
    Sparkles,
    Gauge,
    BedDouble
} from 'lucide-react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import {
    MAX_DAYS,
    BUDGET_OPTIONS,
    TRAVELER_OPTIONS,
    STAY_TYPE_OPTIONS,
    INTEREST_OPTIONS,
    TRANSPORT_OPTIONS,
    PACE_OPTIONS,
    FOOD_OPTIONS,
    MONTH_OPTIONS,
    CURRENCY_OPTIONS
} from '../assets/data';
import { toast } from 'sonner';
import { generateTripWithAI } from '../services/aiModel';
import { groundTripData } from '../services/groundingService';
import { enrichTripWithPlaces } from '../services/placesEnrichmentService';
import LoginDialog from '../components/shared/LoginDialog';
import { doc, setDoc } from "firebase/firestore";
import { db } from '../services/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 4;

const CreateTrip = () => {
    const placesApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    const [openDialog, setOpenDialog] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        destination: null,
        startingCity: '',
        noOfDays: '3',
        travelMonth: 'Flexible',
        traveler: 'Couple',
        numberOfTravelers: 2,
        pace: 'Balanced',
        budget: 'Moderate',
        stayType: 'Hotel',
        currency: 'USD',
        exactBudget: '',
        transport: 'Flight',
        interests: ['nature', 'food'],
        foodPreference: 'Any',
    });

    const handleInputChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDaysChange = (e) => {
        const raw = e.target.value;
        if (raw === '') {
            handleInputChange('noOfDays', '');
            return;
        }
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed)) return;

        if (parsed > MAX_DAYS) {
            handleInputChange('noOfDays', MAX_DAYS);
            toast.info(`Maximum duration is ${MAX_DAYS} days.`);
        } else {
            handleInputChange('noOfDays', parsed);
        }
    };

    const handleDaysBlur = () => {
        if (!formData.noOfDays || Number(formData.noOfDays) < 1) {
            handleInputChange('noOfDays', 1);
        }
    };

    const handleTravelersChange = (e) => {
        const raw = e.target.value;
        if (raw === '') {
            handleInputChange('numberOfTravelers', '');
            return;
        }
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed)) return;

        if (parsed > 50) {
            handleInputChange('numberOfTravelers', 50);
            toast.info('Maximum group size is 50 travelers.');
        } else {
            handleInputChange('numberOfTravelers', parsed);
        }
    };

    const handleTravelersBlur = () => {
        if (!formData.numberOfTravelers || Number(formData.numberOfTravelers) < 1) {
            handleInputChange('numberOfTravelers', 1);
        }
    };

    const handleTravelerTypeSelect = (opt) => {
        setFormData((prev) => ({
            ...prev,
            traveler: opt.id,
            numberOfTravelers: opt.defaultCount || prev.numberOfTravelers || 1,
        }));
    };

    const toggleInterest = (id) => {
        setFormData((prev) => {
            const current = prev.interests || [];
            const exists = current.includes(id);
            const updated = exists
                ? current.filter((item) => item !== id)
                : [...current, id];
            return {
                ...prev,
                interests: updated,
            };
        });
    };

    const canProceed = () => {
        if (step === 1) {
            const days = parseInt(formData.noOfDays, 10);
            return Boolean(formData.destination && days >= 1 && days <= MAX_DAYS);
        }
        if (step === 2) {
            return Boolean(formData.traveler && Number(formData.numberOfTravelers) >= 1 && formData.pace);
        }
        if (step === 3) {
            return Boolean(formData.budget && formData.stayType && formData.transport);
        }
        if (step === 4) {
            return Boolean(formData.interests?.length > 0 && formData.foodPreference);
        }
        return true;
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleNext = () => {
        if (!canProceed()) {
            if (step === 1) toast.error(`Please select a destination and duration (1 to ${MAX_DAYS} days).`);
            else if (step === 4 && formData.interests.length === 0) toast.error('Please choose at least 1 interest.');
            else toast.error('Please complete all required fields.');
            return;
        }

        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        } else {
            generateTrip();
        }
    };

    const generateTrip = async () => {
        const user = localStorage.getItem("user");
        if (!user) {
            return setOpenDialog(true);
        }

        const days = parseInt(formData.noOfDays, 10);
        if (!formData.destination || isNaN(days) || !formData.budget || !formData.traveler) {
            return toast.error('Please fill in all required details.');
        }
        if (days < 1 || days > MAX_DAYS) {
            return toast.error(`AI can currently generate itineraries between 1 and ${MAX_DAYS} days.`);
        }

        setLoading(true);

        const destinationName = formData.destination?.label || 'Destination';
        const travelerCount = Math.max(1, parseInt(formData.numberOfTravelers, 10) || 1);
        const formattedBudget = formData.exactBudget
            ? `${formData.budget} tier (~${formData.currency} ${formData.exactBudget})`
            : `${formData.budget} tier`;

        const targetActivitiesPerDay =
            formData.pace === 'Relaxed' ? '2 to 3' : formData.pace === 'Packed' ? '4 to 5' : '3 to 4';

        const stayTypeDescription =
            formData.stayType === 'Homestay'
                ? 'authentic local homestays, guesthouses, and private villas'
                : formData.stayType === 'Dormitory'
                ? 'backpackers hostels, dormitories, and co-living stays'
                : formData.stayType === 'Boutique'
                ? 'boutique heritage properties, artistic retreats, and character stays'
                : 'hotels and resorts';

        const DYNAMIC_PROMPT = `You are an expert AI Travel Planner specializing in highly efficient, geographically optimized itineraries and rich destination guides.
Generate a realistic, high-quality travel plan and comprehensive destination intelligence strictly matching the following user parameters:

Destination: ${destinationName}
Starting City / Origin: ${formData.startingCity || 'Direct Arrival'}
Duration: Exactly ${days} days (between 1 and ${MAX_DAYS} days)
Travel Timing / Month: ${formData.travelMonth}
Traveler Profile: ${formData.traveler} (${travelerCount} travelers total)
Travel Pace: ${formData.pace} (aim for ${targetActivitiesPerDay} activities per day)
Budget Tier: ${formattedBudget}
Preferred Stay Type: ${formData.stayType} (${stayTypeDescription})
Preferred Transport: ${formData.transport}
User Interests: ${formData.interests.length > 0 ? formData.interests.join(', ') : 'Top historical, cultural, scenic, and culinary highlights'}
Dietary / Food Preference: ${formData.foodPreference}

Core Requirements:
1. Daily Itinerary ('itinerary'):
   - Provide daily plans for exactly ${days} days.
   - For each day, select the top ${targetActivitiesPerDay} sightseeing, cultural, or adventure activities tailored to ${formData.interests.join(', ')} grouped geographically by neighborhood or district to eliminate backtracking and minimize transit times.
   - CRITICAL FOOD & DINING RULE: Do NOT suggest or list hotels as places to eat in the daily itinerary.
   - For each day, explicitly include a dedicated midday Lunch Break slot (around 12:30 PM - 02:00 PM) featuring popular local restaurants, authentic cafes, or street food hubs strictly matching the user's dietary preference (${formData.foodPreference}). Set 'isMealOrBreak' to true for this lunch slot.
   - Use realistic operational time ranges ('timeRange') taking into account opening/closing hours and meal times.
   - Provide realistic transit durations ('timeToTravel') between consecutive activities.
   - For all ticket costs ('ticketPrice'), use the destination's native local currency symbol (or 'Free', and estimated meal cost for lunch).
   - Do NOT include or invent image URLs.
2. Accommodation & Stay Options ('hotelsOptions'):
   - Curate an array of at least 10 distinct, highly-rated accommodations tailored to the user's chosen Stay Type: ${formData.stayType} (${stayTypeDescription}).
   - Strictly match the specified budget tier (${formData.budget}) and traveler type (${formData.traveler}, ${travelerCount} travelers).
   - Prioritize stays with better ratings (e.g. 4.2 to 4.9 stars).
   - In each stay, specify 'foodHighlights' detailing on-site or nearby dining options suited to the user's dietary preference (${formData.foodPreference}), such as complimentary breakfast or proximity to ${formData.foodPreference} restaurants.
   - Use the native local currency symbol in 'priceRange'. Include realistic coordinates and addresses.
3. Destination Intelligence ('destinationInfo'):
   - Provide an engaging overview of the destination.
   - Deliver a 12-month climate guide ('monthlyGuide') with average temperature in °C, rainfall level, crowd level, rating ('Best' | 'Good' | 'Avoid'), and a concise note for each of the 12 calendar months (January to December).
   - Evaluate whether the user's travel month (${formData.travelMonth}) is favorable ('isSelectedMonthGood') and provide practical seasonal advice ('selectedMonthAdvice').
   - Detail how to reach the destination via flight/train/road ('howToReach') and best internal transit options ('localTransport').
   - Recommend authentic local dishes ('foodToTry') strictly respecting the ${formData.foodPreference} preference.
   - List key cultural celebrations/festivals ('festivals') and crucial cultural etiquette/safety tips ('safetyAndEtiquette').
   - Provide a practical packing checklist ('packingTips') tailored to the season and climate.
4. Trip Overview Note ('tripNote'):
   - Summarize the itinerary philosophy and provide key transit and dining recommendations tailored to ${travelerCount} ${formData.traveler} traveler(s).`;

        try {
            const rawTripData = await generateTripWithAI(DYNAMIC_PROMPT);
            // 1. Ground with Wikipedia overview & Open-Meteo climate normals
            const groundedTripData = await groundTripData(rawTripData, destinationName);
            // 2. Enrich hotels & activities with real Google Places data (photos, placeId, coords)
            const enrichedTripData = await enrichTripWithPlaces(groundedTripData, destinationName);
            // 3. Save to Firestore
            await saveToDB(enrichedTripData, {
                ...formData,
                noOfDays: days,
                numberOfTravelers: travelerCount,
            });
        } catch (error) {
            setLoading(false);
            console.error("AI Generation Error:", error);
            const errMsg = error?.message || error?.toString() || '';

            if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota')) {
                toast.error("AI quota or rate limit reached. Please wait a moment and try again.");
            } else if (errMsg.includes('503') || errMsg.toLowerCase().includes('demand') || errMsg.toLowerCase().includes('busy')) {
                toast.error("AI servers are busy right now. Please try again in a few moments.");
            } else if (errMsg.toLowerCase().includes('api_key') || errMsg.toLowerCase().includes('unauthenticated') || errMsg.toLowerCase().includes('key not valid')) {
                toast.error("Invalid Gemini API Key. Please check VITE_GEMINI_API_KEY in your .env.local.");
            } else if (error?.message) {
                toast.error(`Generation Failed: ${error.message}`);
            } else {
                toast.error("Failed to generate plan. Please verify your connection and try again.");
            }
        }
    };

    const saveToDB = async (tripData, resolvedSelection) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const docId = Date.now().toString();

            // Prefer the resolved selection (with clamped days & traveler count) over raw formData
            const selectionToStore = resolvedSelection || formData;

            await setDoc(doc(db, "trips-ai", docId), {
                userSelection: selectionToStore,
                tripData: tripData,
                userEmail: user?.email || 'guest',
                id: docId,
                createdAt: new Date().toISOString()
            });

            setLoading(false);
            toast.success("Trip successfully generated!");
            navigate(`/trips/${docId}`);
        } catch (error) {
            setLoading(false);
            console.error("Firestore Save Error: ", error);
            toast.error("Failed to save trip to database. Please check Firestore permissions.");
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center'>
                <div className='relative mb-8'>
                    <div className='absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-30' />
                    <div className='relative bg-white p-5 rounded-full shadow-xl border border-indigo-50'>
                        <Loader2 className='w-12 h-12 text-indigo-600 animate-spin' />
                    </div>
                </div>
                <h3 className='text-2xl font-bold text-gray-900'>
                    Curating your adventure to {formData.destination?.label?.split(',')[0]}...
                </h3>
                <p className='mt-2.5 text-sm text-gray-500 max-w-md animate-pulse leading-relaxed'>
                    Our AI is crafting a {formData.pace?.toLowerCase()} {formData.noOfDays}-day itinerary with tailored stays, sights, and hidden gems.
                </p>
            </div>
        );
    }

    return (
        <div className='max-padd-container flex items-center justify-center min-h-screen py-24'>
            {/* Modal Card */}
            <div className='w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col'>
                {/* Progress Bar */}
                <div className='h-2 bg-indigo-50 w-full'>
                    <div
                        className='h-full bg-indigo-600 transition-all duration-500 ease-out'
                        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    />
                </div>

                <div className='p-6 sm:p-10 md:p-12 flex flex-col flex-1'>
                    {/* Step Indicators */}
                    <div className='flex items-center justify-center space-x-2 mb-8'>
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    step === s
                                        ? 'w-8 bg-indigo-600'
                                        : step > s
                                        ? 'w-2 bg-indigo-600'
                                        : 'w-2 bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                    <div className='flex-1 flex flex-col'>
                        {/* STEP 1: Destination, Starting City & Timing */}
                        {step === 1 && (
                            <div className='space-y-6'>
                                <div className='text-center mb-6'>
                                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                                        Where's Your Next Adventure?
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        Choose your destination, origin, and trip duration (up to {MAX_DAYS} days).
                                    </p>
                                </div>

                                <div className='space-y-4'>
                                    {/* Destination Autocomplete */}
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5'>
                                            <MapPin className='w-3.5 h-3.5 text-indigo-600' /> Destination City *
                                        </label>
                                        <GooglePlacesAutocomplete
                                            apiKey={placesApiKey}
                                            selectProps={{
                                                value: formData.destination,
                                                onChange: (v) => handleInputChange('destination', v),
                                                className: 'w-full text-sm',
                                                placeholder: 'Search for a city (e.g. Kyoto, Paris, Goa)...'
                                            }}
                                        />
                                    </div>

                                    {/* Starting City */}
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5'>
                                            <Compass className='w-3.5 h-3.5 text-indigo-600' /> Starting From (Origin)
                                        </label>
                                        <input
                                            type='text'
                                            placeholder='e.g. New York, London, Mumbai (Optional)'
                                            value={formData.startingCity}
                                            onChange={(e) => handleInputChange('startingCity', e.target.value)}
                                            className='block w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50'
                                        />
                                    </div>

                                    {/* Days & Month Grid */}
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1'>
                                        <div>
                                            <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5'>
                                                <Calendar className='w-3.5 h-3.5 text-indigo-600' /> How Many Days? *
                                            </label>
                                            <div className='relative'>
                                                <input
                                                    type='number'
                                                    min={1}
                                                    max={MAX_DAYS}
                                                    placeholder='3'
                                                    value={formData.noOfDays}
                                                    onChange={handleDaysChange}
                                                    onBlur={handleDaysBlur}
                                                    className='block w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50'
                                                />
                                                <span className='absolute right-3 top-3 text-xs text-gray-400 font-medium'>
                                                    Max {MAX_DAYS}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5'>
                                                <Calendar className='w-3.5 h-3.5 text-indigo-600' /> Travel Month
                                            </label>
                                            <select
                                                value={formData.travelMonth}
                                                onChange={(e) => handleInputChange('travelMonth', e.target.value)}
                                                className='block w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50'
                                            >
                                                {MONTH_OPTIONS.map((m) => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Travelers, Group Size & Pace */}
                        {step === 2 && (
                            <div className='space-y-6'>
                                <div className='text-center mb-6'>
                                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                                        Who is Traveling?
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        Tailor the activities, lodging, and pace to your group.
                                    </p>
                                </div>

                                {/* Traveler Types */}
                                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                    {TRAVELER_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleTravelerTypeSelect(opt)}
                                            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 cursor-pointer ${
                                                formData.traveler === opt.id
                                                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm scale-102'
                                                    : 'border-gray-100 hover:border-indigo-200 bg-white'
                                            }`}
                                        >
                                            <span className='text-3xl'>{opt.icon}</span>
                                            <div>
                                                <h5 className='font-bold text-xs text-gray-900'>{opt.title}</h5>
                                                <p className='text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-1'>{opt.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Number of Travelers */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1.5'>
                                        <Users className='w-3.5 h-3.5 text-indigo-600' /> Exact Number of Travelers
                                    </label>
                                    <input
                                        type='number'
                                        min={1}
                                        max={50}
                                        placeholder='1'
                                        value={formData.numberOfTravelers}
                                        onChange={handleTravelersChange}
                                        onBlur={handleTravelersBlur}
                                        className='block w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50'
                                    />
                                </div>

                                {/* Pace Selection */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5'>
                                        <Gauge className='w-3.5 h-3.5 text-indigo-600' /> Travel Pace
                                    </label>
                                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                        {PACE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleInputChange('pace', opt.id)}
                                                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                                    formData.pace === opt.id
                                                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                                                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                                                }`}
                                            >
                                                <div className='flex items-center gap-2 mb-1'>
                                                    <span className='text-lg'>{opt.icon}</span>
                                                    <h5 className='font-bold text-xs text-gray-900'>{opt.label}</h5>
                                                </div>
                                                <p className='text-[11px] text-gray-500 leading-snug'>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Budget, Stay Type, Currency & Transport */}
                        {step === 3 && (
                            <div className='space-y-6'>
                                <div className='text-center mb-6'>
                                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                                        Budget, Stay & Transport
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        Tell us your accommodation interest, spending comfort, and transit style.
                                    </p>
                                </div>

                                {/* Budget Tiers */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1'>
                                        Budget Tier *
                                    </label>
                                    <div className='grid grid-cols-3 gap-3'>
                                        {BUDGET_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleInputChange('budget', opt.id)}
                                                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                                                    formData.budget === opt.id
                                                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm scale-102'
                                                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-full ${formData.budget === opt.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {opt.icon}
                                                </div>
                                                <h5 className='font-bold text-xs text-gray-900'>{opt.label}</h5>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stay Type / Accommodation Interest */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5'>
                                        <BedDouble className='w-3.5 h-3.5 text-indigo-600' /> Accommodation Style *
                                    </label>
                                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                        {STAY_TYPE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleInputChange('stayType', opt.id)}
                                                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                                                    formData.stayType === opt.id
                                                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs scale-102'
                                                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                                                }`}
                                            >
                                                <span className='text-2xl block mb-1'>{opt.icon}</span>
                                                <h5 className='font-bold text-xs text-gray-900'>{opt.label}</h5>
                                                <p className='text-[10px] text-gray-500 mt-0.5 line-clamp-1'>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Exact Budget (Optional) + Currency */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1'>
                                        Optional Exact Budget Target
                                    </label>
                                    <div className='grid grid-cols-3 gap-3'>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => handleInputChange('currency', e.target.value)}
                                            className='px-3 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 font-medium'
                                        >
                                            {CURRENCY_OPTIONS.map((c) => (
                                                <option key={c.code} value={c.code}>{c.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type='number'
                                            placeholder='e.g. 1500 (Optional)'
                                            value={formData.exactBudget}
                                            onChange={(e) => handleInputChange('exactBudget', e.target.value)}
                                            className='col-span-2 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50'
                                        />
                                    </div>
                                </div>

                                {/* Preferred Transport */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5'>
                                        <Plane className='w-3.5 h-3.5 text-indigo-600' /> Preferred Mode of Transport *
                                    </label>
                                    <div className='grid grid-cols-3 gap-3'>
                                        {TRANSPORT_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleInputChange('transport', opt.id)}
                                                className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                                                    formData.transport === opt.id
                                                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                                                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                                                }`}
                                            >
                                                <span className='text-2xl block mb-1'>{opt.icon}</span>
                                                <h5 className='font-bold text-xs text-gray-900'>{opt.label}</h5>
                                                <p className='text-[10px] text-gray-500 mt-0.5 line-clamp-1'>{opt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Interests & Food Preferences */}
                        {step === 4 && (
                            <div className='space-y-6'>
                                <div className='text-center mb-6'>
                                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                                        Interests & Food Taste
                                    </h3>
                                    <p className='text-sm text-gray-500'>
                                        Select what excites you most to shape your unique itinerary.
                                    </p>
                                </div>

                                {/* Interests Multi-Select */}
                                <div>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5 ml-1 flex items-center justify-between'>
                                        <span className='flex items-center gap-1.5'>
                                            <Sparkles className='w-3.5 h-3.5 text-indigo-600' /> What are your interests? *
                                        </span>
                                        <span className='text-[11px] text-indigo-600 font-medium lowercase'>
                                            {formData.interests.length} selected
                                        </span>
                                    </label>
                                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                                        {INTEREST_OPTIONS.map((opt) => {
                                            const isSelected = formData.interests.includes(opt.id);
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => toggleInterest(opt.id)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                                        isSelected
                                                            ? 'border-indigo-600 bg-indigo-50/70 shadow-xs text-indigo-900'
                                                            : 'border-gray-100 hover:border-indigo-200 bg-white text-gray-700'
                                                    }`}
                                                >
                                                    <span className='text-xl shrink-0'>{opt.icon}</span>
                                                    <span className='text-xs font-semibold'>{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dietary Preference */}
                                <div className='pt-2'>
                                    <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5'>
                                        <Utensils className='w-3.5 h-3.5 text-indigo-600' /> Dietary / Food Preference *
                                    </label>
                                    <div className='grid grid-cols-3 gap-3'>
                                        {FOOD_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => handleInputChange('foodPreference', opt.id)}
                                                className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                                                    formData.foodPreference === opt.id
                                                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                                                        : 'border-gray-100 hover:border-indigo-200 bg-white'
                                                }`}
                                            >
                                                <span className='text-xl block mb-1'>{opt.icon}</span>
                                                <h5 className='font-bold text-xs text-gray-900'>{opt.label}</h5>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className='flex items-center justify-between pt-8 mt-6 border-t border-gray-100'>
                        <button
                            type="button"
                            onClick={handleBack}
                            className={`text-gray-500 hover:text-gray-900 font-medium px-4 py-2 text-sm transition-colors cursor-pointer ${
                                step === 1 ? 'invisible' : ''
                            }`}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`inline-flex items-center px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md cursor-pointer ${
                                !canProceed()
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                            }`}
                        >
                            {step === TOTAL_STEPS ? "Generate Plan" : "Continue"}
                            {step === TOTAL_STEPS ? (
                                <CheckCircle className="ml-2 w-4 h-4" />
                            ) : (
                                <ArrowRight className="ml-2 w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <LoginDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onLoginSuccess={generateTrip}
            />
        </div>
    );
};

export default CreateTrip;
