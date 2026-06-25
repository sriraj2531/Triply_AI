import React from 'react'
import {Button} from '../ui/button'
import { FaArrowRightLong } from "react-icons/fa6";
import {Heart, IndianRupee, Plane} from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate()
  return (
    <section className='min-h-screen relative overflow-hidden bg-linear-to-br from-indigo-50 to-blue-100 flexCenter py-22'>
        {/* Decorative Blocks */}
        <div className='absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30'/>
        <div className='absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30'/>
        <div className='absolute -bottom-32 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30'/>
        {/* Container */}
        <div className='relative z-10 max-w-4xl mx-auto px-4 text-center'>
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full mb-6 border-white/50 shadow-sm">
                <span className='relative flex h-3 w-3'>
                    <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 '/>
                    <span className='relative inline-flex rounded-full h-3 w-3 bg-indigo-500'/>
                </span>
                <span className='text-sm font-medium text-indigo-900 '>AI-Powered Travel Agent v2.0</span>
            </div>
            <h1 className='text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600 mb-6 tracking-tight leading-tight'>Design Your Dream Getaway in Seconds</h1>
            <p className='text-xl text-gray-600 mb-10 max-w-2xl mx-auto'>Tell Us where You want to go, and let our AI craft the perfect itinery tailored to your budget interests</p>
            <Button onClick={()=>navigate('/create-trip')} className={'group relative inline-flexcenter justify-center px-8! py-8! text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-xl'}>
                Start Planning!
                <FaArrowRightLong className='ml-2 w-5! h-5! group-hover:translate-x-1 transition-transform '/>
            </Button>
            <div className='mt-12 grid grid-cols-3 gap-4 text-gray-500 text-sm '>
                <div className='flex flex-col items-center'>
                    <div className='p-3 bg-white rounded-2xl shadow-sm mb-2 text-indigo-600 '>
                        <Plane size={24} />
                    </div>
                    <span>Smart Routes</span>
                </div>
                <div className='flex flex-col items-center'>
                    <div className='p-3 bg-white rounded-2xl shadow-sm mb-2 text-indigo-600 '>
                        <IndianRupee size={24} />
                    </div>
                    <span>Budget Control</span>
                </div>
                <div className='flex flex-col items-center'>
                    <div className='p-3 bg-white rounded-2xl shadow-sm mb-2 text-indigo-600 '>
                        <Heart size={24} />
                    </div>
                    <span>Personalized</span>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Hero