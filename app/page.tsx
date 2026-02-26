'use client'
import React, { useState } from 'react'
import SideNav from './components/SideNav'
import Dashboard from './components/Dashboard'
import Liveupdate from './components/Liveupdate'
import { Logo } from './components/Logo'
import Submits from './components/Submits'
import Users from './components/Users'

export default function page() {
  const [selected, setSelected] = useState("")
  
  return (
    <div className='flex w-full'>
      <SideNav onSelect={setSelected}/>
      <Users/>


    </div>
  )
}
