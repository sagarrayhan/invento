'use client'
import React, { useEffect, useState } from 'react'
import SideNav from './components/SideNav'
import Dashboard from './components/Dashboard'
import Liveupdate from './components/Liveupdate'
import Submits from './components/Submits'
import Users from './components/Users'
import Login from './components/Login'
import { AuthUser } from './data/types'

export default function Page() {
  const [selected, setSelected] = useState('Dashboard')
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { method: 'GET' })
        if (!res.ok) {
          setCurrentUser(null)
          return
        }
        const data = await res.json()
        setCurrentUser(data.user as AuthUser)
      } finally {
        setCheckingSession(false)
      }
    }

    restoreSession()
  }, [])
  
  if (checkingSession) {
    return null
  }

  const renderContent = () => {
    if (!currentUser) return null
    switch (selected) {
      case 'Live Update':
        return <Liveupdate />
      case 'Submits':
        return <Submits />
      case 'Users':
        return <Users currentUser={currentUser} />
      case 'Dashboard':
      default:
        return <Dashboard />
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setCurrentUser(null)
    setSelected('Dashboard')
  }


  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />
  }

  return (
    <div className='app-shell'>
      <div className='surface flex w-full min-h-[calc(100vh-2rem)] overflow-hidden'>
      <SideNav
        onSelect={setSelected}
        selected={selected}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <div className='flex-1 p-3 md:p-4 overflow-auto'>{renderContent()}</div>
      </div>
    </div>
  )
}
