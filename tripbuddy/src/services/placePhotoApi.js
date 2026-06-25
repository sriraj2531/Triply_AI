import axios from "axios"

const BASE_URL = "https://places.googleapis.com/v1/places:searchText"
const placeApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

const config = {
    headers:{
        "Content-Type": "application/json",
        'X-Goog-Api-Key': placeApiKey,
        'X-Goog-FieldMask': [
            "places.photos",
            "places.displayName",
            "places.id"
        ] 
    }
}

export const getPlaceDetails = async (data) => axios.post(BASE_URL,data,config)

//Reusable Photo Helper
export const getPlacePhoto = async (textQuery) => {
    if(!textQuery) return null
    const res = await getPlaceDetails({textQuery})
    const photoName = res?.data?.places[0]?.photos[0]?.name;
    if(!photoName){
        return null
    }
    return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1080&maxWidthPx=1920&key=${placeApiKey}`
}