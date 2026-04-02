'use client'

import { Activity, Send, Users, UserCheck } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { getAllUsers, getLiveUsers, getSubmittedUsers } from '../data/user'
import { User } from '../data/types'
import Photo from './Photo'

const designationOrder = [
  'Sr. Manager',
  'Manager',
  'Dep. Manager',
  'Ass. Manager',
  'Sr. Executive',
  'Executive',
  'Jr. Executive',
  'Sr. Officer',
  'Officer',
  'Jr. Officer',
]

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

  const submittedUsers = useMemo(() => {
    const userById = new Map(users.map((user) => [user.id, user]))

    return submittedBy
      .map((uid) => userById.get(uid))
      .filter((user): user is User => Boolean(user))
      .sort((a, b) => {
        const desigA = a.designation?.trim() || 'Unspecified'
        const desigB = b.designation?.trim() || 'Unspecified'
        const indexA = designationOrder.indexOf(desigA)
        const indexB = designationOrder.indexOf(desigB)
        const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA
        const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB

        if (safeA !== safeB) {
          return safeA - safeB
        }

        return a.name.localeCompare(b.name)
      })
  }, [users, submittedBy])

  return (
    <div className='p-4 md:p-6 w-full space-y-5'>
      <div className='space-y-1 anim-enter'>
        <h1 className='heading-lg'>Dashboard</h1>
        <p className='text-sm text-slate-500'>Realtime overview of users, activity, and submit progress.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full'>
        <MetricCard title='Total Users' value={users.length} icon={<Users />} tone='blue' delayMs={40} />
        <MetricCard title='Live Users' value={liveUsers.length} icon={<Activity />} tone='green' delayMs={90} />
        <MetricCard title='Submitted Users' value={submittedBy.length} icon={<Send />} tone='amber' delayMs={140} />
        <MetricCard title='Offline Users' value={Math.max(users.length - liveUsers.length, 0)} icon={<UserCheck />} tone='slate' delayMs={190} />
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
        <section className='surface p-4 anim-enter' style={{ animationDelay: '220ms' }}>
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

        <section className='surface p-4 anim-enter' style={{ animationDelay: '260ms' }}>
          <h2 className='text-base font-semibold text-slate-800 mb-3'>Submitted Users</h2>
          {submittedUsers.length === 0 ? (
            <p className='text-sm text-slate-500'>No submitted users found.</p>
          ) : (
            <div className='space-y-2 max-h-[360px] overflow-y-auto pr-1'>
              {submittedUsers.map((u) => (
                <UserRow key={u.id} user={u} subtitle={u.designation} />
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
  delayMs = 0,
}: {
  title: string
  value: number
  icon: React.ReactNode
  tone: 'blue' | 'green' | 'amber' | 'slate'
  delayMs?: number
}) {
  const toneClasses: Record<typeof tone, string> = {
    blue: 'neu-inset text-slate-700',
    green: 'neu-inset text-slate-700',
    amber: 'neu-inset text-slate-700',
    slate: 'neu-inset text-slate-700',
  }

  return (
    <div className='surface p-4 anim-enter hover-lift' style={{ animationDelay: `${delayMs}ms` }}>
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
    <div className='flex items-center justify-between rounded-xl neu-inset px-3 py-2'>
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

