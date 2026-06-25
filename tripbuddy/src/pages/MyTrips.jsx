import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../services/firebaseConfig';
import {useNavigate} from 'react-router-dom'
import { Skeleton } from "@/components/ui/skeleton"
import MyTripCard from '../components/shared/MyTripCard';

const MyTrips = () => {
    const [userTrips, setUserTrips] = useState([])



    const navigate = useNavigate()

    const getUserTrips = async () => {
        const user = JSON.parse(localStorage.getItem("user"))
        if (!user) {
            return navigate('/')
        }

        const q = query(collection(db, "trips-ai"), where("userEmail", "==", user?.email));

        try {
            const querySnapshot = await getDocs(q);
            // Map Everything into one array first  
            const allTrips = querySnapshot.docs.map((doc) => ({
                id: doc.id, // Always keep the ID!
                ...doc.data(),
                // doc.data() is never undefined for query doc snapshots
            }));
            setUserTrips(allTrips);
        } catch (error) {
            console.log("Error Fetching the Trips",error)
        }
    }
    useEffect(() => {
        getUserTrips()
    },[])
    return (
        <div className='max-padd-container py-22 xl:py-28'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {userTrips?.length > 0 ? userTrips?.map((trip,index) => (
                    <MyTripCard key={index} trip={trip}/>
                )) : 
                [1,2,3,4].map((index) => (
                    <div key={index} className='flex flex-col space-y-3'>
                        <Skeleton className="h-122 w-77 rounded-xl bg-white" />
                    </div>
                ))
                }
            </div>
        </div>
    )
}

export default MyTrips