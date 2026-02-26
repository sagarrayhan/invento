'use client'

import { Activity, Send, Users, UserCheck } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { getAllUsers, getLiveUsers, getSubmittedUsers } from '../data/user'
import { User } from '../data/types'
import Photo from './Photo'

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [liveUsers, setLiveUsers] = useState<User[]>([])
  const [submittedBy, setSubmittedBy] = useState<string[]>([])

  useEffect(() => {
    const unsubAllUsers = getAllUsers((all) => setUsers(all))
    const unsubLiveUsers = getLiveUsers((live) => setLiveUsers(live))
    const unsubSubmittedUsers = getSubmittedUsers((ids) => setSubmittedBy(ids))

    return () => {
      unsubAllUsers()
      unsubLiveUsers()
      unsubSubmittedUsers()
    }
  }, [])

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        const left = Date.parse(a.joinedAt)
        const right = Date.parse(b.joinedAt)
        if (Number.isNaN(left) || Number.isNaN(right)) return 0
        return right - left
      })
      .slice(0, 5)
  }, [users])

  return (
    <div className='p-4 md:p-6 w-full space-y-5'>
      <div className='space-y-1'>
        <h1 className='heading-lg'>Dashboard</h1>
        <p className='text-sm text-slate-500'>Realtime overview of users, activity, and submit progress.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full'>
        <MetricCard title='Total Users' value={users.length} icon={<Users />} tone='blue' />
        <MetricCard title='Live Users' value={liveUsers.length} icon={<Activity />} tone='green' />
        <MetricCard title='Submitted Users' value={submittedBy.length} icon={<Send />} tone='amber' />
        <MetricCard title='Offline Users' value={Math.max(users.length - liveUsers.length, 0)} icon={<UserCheck />} tone='slate' />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <section className='surface p-4'>
          <h2 className='text-base font-semibold text-slate-800 mb-3'>Live Now</h2>
          {liveUsers.length === 0 ? (
            <p className='text-sm text-slate-500'>No active users right now.</p>
          ) : (
            <div className='space-y-2'>
              {liveUsers.map((u) => (
                <UserRow key={u.id} user={u} subtitle={u.designation} />
              ))}
            </div>
          )}
        </section>

        <section className='surface p-4'>
          <h2 className='text-base font-semibold text-slate-800 mb-3'>Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className='text-sm text-slate-500'>No users found.</p>
          ) : (
            <div className='space-y-2'>
              {recentUsers.map((u) => (
                <UserRow key={u.id} user={u} subtitle={`Joined: ${u.joinedAt}`} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string
  value: number
  icon: React.ReactNode
  tone: 'blue' | 'green' | 'amber' | 'slate'
}) {
  const toneClasses: Record<typeof tone, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className='surface p-4'>
      <div className='flex items-start justify-between'>
        <p className='text-sm text-slate-500'>{title}</p>
        <div className={`p-2 rounded-xl ${toneClasses[tone]}`}>{icon}</div>
      </div>
      <p className='mt-3 text-3xl font-semibold text-slate-900'>{value}</p>
    </div>
  )
}

function UserRow({ user, subtitle }: { user: User; subtitle: string }) {
  return (
    <div className='flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2'>
      <div className='flex items-center gap-3'>
        <Photo url={user.imageUrl} size={36} />
        <div>
          <p className='text-sm font-medium text-slate-800'>{user.name}</p>
          <p className='text-xs text-slate-500'>{subtitle}</p>
        </div>
      </div>
      <p className='text-xs text-slate-400'>{user.id}</p>
    </div>
  )
}
