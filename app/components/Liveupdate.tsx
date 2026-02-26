import React, { useEffect, useState } from 'react'
import { Activity, Boxes } from 'lucide-react'
import Photo from './Photo'
import { getLiveData } from '../data/tiles'
import { Tile, User } from '../data/types'
import { getLiveUsers } from '../data/user'

export default function Liveupdate() {
  const [live, setLive] = useState<Tile[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [activeUserId, setActiveUserId] = useState('')

  useEffect(() => {
    const unSubUsers = getLiveUsers(setUsers)
    return () => unSubUsers()
  }, [])

  useEffect(() => {
    if (!activeUserId) {
      return
    }

    const unSubLive = getLiveData(activeUserId, setLive)
    return () => unSubLive()
  }, [activeUserId])

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <header className='surface p-5 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-slate-900'>Live Update</h1>
          <p className='text-sm text-slate-500'>Monitor user movement and active tile changes in realtime.</p>
        </div>
        <div className='inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-medium'>
          <Activity size={14} className='animate-pulse' />
          Live
        </div>
      </header>

      <section className='surface p-4'>
        <h2 className='text-sm font-semibold text-slate-700 mb-3'>Active Users</h2>
        <div className='flex flex-wrap gap-2.5'>
          {users.length === 0 ? (
            <p className='text-sm text-slate-500'>No users currently active.</p>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                type='button'
                onClick={() => {
                  setActiveUserId(user.id)
                  setSelectedCode(null)
                }}
                className={`px-3 py-2 rounded-2xl border transition flex items-center gap-2 ${
                  user.id === activeUserId
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Photo url={user.imageUrl} size={38} />
                <div className='text-left'>
                  <p className='text-sm font-medium leading-none'>{user.name}</p>
                  <p className={`text-xs mt-1 ${user.id === activeUserId ? 'text-slate-300' : 'text-slate-500'}`}>{user.id}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className='surface p-4'>
        <div className='flex items-center gap-2 mb-3 text-slate-800'>
          <Boxes size={16} />
          <h2 className='text-sm font-semibold'>Live Tile Stream</h2>
        </div>

        {!activeUserId ? (
          <p className='text-sm text-slate-500'>Select a user to view live updates.</p>
        ) : live.length === 0 ? (
          <p className='text-sm text-slate-500'>No active tiles for this user.</p>
        ) : (
          <div className='space-y-2'>
            <HeaderRow />
            {live.map((item) => {
              const expanded = selectedCode === item.code
              return (
                <div key={item.id} className='rounded-xl border border-slate-200 bg-white overflow-hidden'>
                  <button
                    type='button'
                    onClick={() => setSelectedCode(expanded ? null : item.code)}
                    className='w-full px-3 py-2 text-left hover:bg-slate-50'
                  >
                    <LiveItem code={item.code} history='-' qty={String(item.quantity)} />
                  </button>
                  {expanded ? (
                    <div className='border-t border-slate-100 bg-slate-50 px-3 py-2 space-y-1.5'>
                      <HeaderRow muted />
                      {item.items?.map((g) => (
                        <div key={g.grid} className='rounded-lg border border-slate-200 bg-white px-2.5 py-1.5'>
                          <LiveItem code={g.grid} history={g.history} qty={g.quantity} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function HeaderRow({ muted = false }: { muted?: boolean }) {
  return (
    <div className={`grid grid-cols-3 text-xs font-semibold px-3 ${muted ? 'text-slate-500' : 'text-slate-700'}`}>
      <p>Code</p>
      <p className='text-center'>History</p>
      <p className='text-right'>Qty</p>
    </div>
  )
}

function LiveItem({ code, history, qty }: { code: string; history: string; qty: string }) {
  return (
    <div className='grid grid-cols-3 text-sm text-slate-700'>
      <p>{code}</p>
      <p className='text-center truncate'>{history}</p>
      <p className='text-right font-medium'>{qty}</p>
    </div>
  )
}
