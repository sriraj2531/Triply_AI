import React, { useState } from 'react'
import { Plane, Plus, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import LoginDialog from './LoginDialog'
import { googleLogout } from '@react-oauth/google'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Header = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"))
  const navigate = useNavigate()
  const handleLogout = () => {
    googleLogout()
    localStorage.removeItem("user")
    navigate('/')
  }
  return (
    <header className='bg-white border-b border-gray-200 px-6 py-3 flexBetween absolute top-0 left-0 right-0 w-full z-50'>
      {/* Logo */}
      <Link to={'/'} className='flex items-center gap-x-2 cursor-pointer '>
        <div className='bg-destructive p-1.5 rounded-lg '>
          <Plane className='w-6 h-6 text-white' />
        </div>
        <span className='hidden sm:flex font-bold text-xl capitalize'>Triply</span>
      </Link>
      {/* Button and Profile */}
      <div className='flex gap-x-4 sm:gap-x-8'>
        <Button onClick={() => navigate('/create-trip')} variant='outline' className={'mt-1 border-destructive bg-transparent'}>
          <Plus />
          Create Trip
        </Button>
        <div className='flex mt-1'>
          {user ? <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <img src={user?.picture} alt="userProfile" height={37} width={37} className='rounded-full ' />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                {/* </DropdownMenuGroup> */}
                <DropdownMenuSeparator />
                {/* <DropdownMenuGroup> */}
                  <DropdownMenuItem onClick={() => navigate('./my-trips')}>My Trips</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>LogOut</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> :
            <Button variant='destructive' onClick={() => setOpenDialog(true)} className={"px-5!"}>
              <User />
              Login
            </Button>
          }
          <LoginDialog open={openDialog} onClose={() => setOpenDialog(false)} />
        </div>
      </div>
    </header>
  )
}

export default Header