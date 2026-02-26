import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, HardDriveDownload, Send, Trash2 } from 'lucide-react'
import { getAllSubmittedData, getSubmittedData, removeFromSubmit } from '../data/tiles'
import { SubmittedItems, Tile, User } from '../data/types'
import Photo from './Photo'
import { mergedTilesToExcel, tilesToExcel } from '@/lib/excel'
import { getDbUser, getSubmittedUsers } from '../data/user'

export default function Submits() {
  const [ids, setUsers] = useState<string[]>([])
  const [allTiles, setAllTiles] = useState<Tile[]>([])
  const [loadingAll, setLoadingAll] = useState(false)

  const refreshMergedTiles = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) {
      setAllTiles([])
      return
    }
    setLoadingAll(true)
    try {
      const merged = await getAllSubmittedData(userIds)
      setAllTiles(merged)
    } finally {
      setLoadingAll(false)
    }
  }, [])

  useEffect(() => {
    const unsubs = getSubmittedUsers((nextIds) => {
      setUsers(nextIds)
      if (nextIds.length === 0) {
        setAllTiles([])
      }
    })
    return () => unsubs()
  }, [])

  useEffect(() => {
    if (ids.length === 0) {
      return
    }
    refreshMergedTiles(ids)
  }, [ids, refreshMergedTiles])

  const totalQty = useMemo(() => allTiles.reduce((sum, t) => sum + Number(t.quantity || 0), 0), [allTiles])

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <section className='surface p-5 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center'>
            <Send size={18} />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-slate-900'>Submits</h1>
            <p className='text-sm text-slate-500'>Review and export submitted inventory lists.</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-sm text-slate-600'>
            <span className='font-semibold text-slate-800'>{allTiles.length}</span> merged tiles,{' '}
            <span className='font-semibold text-slate-800'>{totalQty}</span> total quantity
          </div>
          <button
            type='button'
            className='btn-secondary'
            disabled={loadingAll || allTiles.length === 0}
            onClick={() => mergedTilesToExcel(allTiles)}
            title='Download all merged submits'
          >
            <Download size={14} />
            {loadingAll ? 'Preparing...' : 'Download All'}
          </button>
        </div>
      </section>

      {ids.length === 0 ? (
        <section className='surface p-8 text-center text-slate-500'>No submitted users found.</section>
      ) : (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {ids.map((u) => (
            <SubmitCard key={u} id={u} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmitCard({ id }: { id: string }) {
  const [items, setItems] = useState<SubmittedItems[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubs = getSubmittedData(id, setItems)
    const fetchUser = async () => {
      const dbUser = await getDbUser(id)
      setUser(dbUser)
    }
    fetchUser()
    return () => unsubs()
  }, [id])

  return (
    <article className='surface p-5'>
      <div className='flex items-center gap-3 mb-5'>
        <Photo url={user?.imageUrl || ''} size={46} />
        <div>
          <h2 className='text-base font-semibold text-slate-800'>{user?.name || 'Unknown User'}</h2>
          <p className='text-xs text-slate-500'>{user?.id || id}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className='text-sm text-slate-500'>No lists submitted.</p>
      ) : (
        <div className='space-y-2.5'>
          {items.map((item, index) => (
            <div key={item.key} className='rounded-xl border border-slate-200 bg-white p-3.5 flex items-center justify-between gap-3'>
              <div>
                <h3 className='text-sm font-semibold text-slate-800'>List {index + 1}</h3>
                <p className='text-xs text-slate-500 mt-1'>{item.items.length} rows</p>
              </div>
              <div className='flex items-center gap-2'>
                <button type='button' className='size-9 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center' onClick={() => tilesToExcel(item)} title='Download Excel'>
                  <HardDriveDownload size={16} />
                </button>
                <button type='button' className='size-9 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center' onClick={() => removeFromSubmit(id, item.key)} title='Delete submit'>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
