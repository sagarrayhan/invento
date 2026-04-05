import React, { useEffect, useState } from 'react'
import { Download, HardDriveDownload, Loader2, Send, Trash2 } from 'lucide-react'
import { clearAllSubmittedData, getAllSubmittedData, getSubmittedData, removeFromSubmit } from '../data/tiles'
import { AuthUser, SubmittedItems, User } from '../data/types'
import Photo from './Photo'
import { donwloadDetailed, downloadTotal, tilesToExcel } from '@/lib/excel'
import { getAllUsers, getDbUser, getSubmittedUsers } from '../data/user'
import { formatDateTimeDDMMYYYY } from '@/lib/date'

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

function sortUsersForSequence(users: User[]) {
  return [...users].sort((a, b) => {
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
}

export default function Submits({ currentUser }: { currentUser: AuthUser }) {
  const [ids, setUsers] = useState<string[]>([])
  const [totalQty, setTotalQty] = useState(0)
  const [hasSubmittedRows, setHasSubmittedRows] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [downloadingDetailed, setDownloadingDetailed] = useState(false)
  const [downloadingTotal, setDownloadingTotal] = useState(false)
  const [cleaningAll, setCleaningAll] = useState(false)
  const [adminId, setAdminId] = useState('')
  const canDeleteSubmits = Boolean(adminId) && currentUser.id === adminId

  useEffect(() => {
    const unsubs = getSubmittedUsers((u) => setUsers(u))
    return unsubs
  }, [])

  useEffect(() => {
    const unsubs = getAllUsers((allUsers) => {
      const sorted = sortUsersForSequence(allUsers)
      setAdminId(sorted[0]?.id || '')
    })

    return () => unsubs()
  }, [])

  useEffect(() => {
    if (ids.length === 0) {
      setTotalQty(0)
      setHasSubmittedRows(false)
      return
    }

    let cancelled = false
    const loadSummary = async () => {
      setLoadingSummary(true)
      try {
        const allSubmitted = await getAllSubmittedData(ids)
        if (cancelled) {
          return
        }

        let nextTotal = 0
        let rowCount = 0
        allSubmitted.forEach((tiles) => {
          tiles.forEach((tile) => {
            tile.items.forEach((item) => {
              nextTotal += Number(item.quantity || 0)
              rowCount += 1
            })
          })
        })

        setTotalQty(nextTotal)
        setHasSubmittedRows(rowCount > 0)
      } finally {
        if (!cancelled) {
          setLoadingSummary(false)
        }
      }
    }

    loadSummary()
    return () => {
      cancelled = true
    }
  }, [ids])

  const handleDownloadDetailed = async () => {
    if (downloadingDetailed) return
    setDownloadingDetailed(true)
    try {
      await donwloadDetailed(ids)
    } finally {
      setDownloadingDetailed(false)
    }
  }

  const handleDownloadTotal = async () => {
    if (downloadingTotal) return
    setDownloadingTotal(true)
    try {
      await downloadTotal(ids)
    } finally {
      setDownloadingTotal(false)
    }
  }

  const handleCleanAllSubmits = async () => {
    if (!canDeleteSubmits || cleaningAll) return
    const ok = window.confirm('Are you sure you want to remove all submitted data? This action cannot be undone.')
    if (!ok) return
    setCleaningAll(true)
    try {
      await clearAllSubmittedData()
    } finally {
      setCleaningAll(false)
    }
  }

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <section className='surface p-5 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-xl neu-inset text-slate-700 flex items-center justify-center'>
            <Send size={18} />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-slate-900'>Submits</h1>
            <p className='text-sm text-slate-500'>Review and export submitted inventory lists.</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-sm text-slate-600'>
            <span className='font-semibold text-slate-800'>{totalQty}</span> total quantity
          </div>
          <button
            type='button'
            onClick={handleDownloadDetailed}
            className='btn-secondary'
            disabled={loadingSummary || !hasSubmittedRows || downloadingDetailed}
            title='Download all merged submits'
          >
            {downloadingDetailed ? <Loader2 size={14} className='animate-spin' /> : <Download size={14} />}
            {loadingSummary ? 'Preparing...' : downloadingDetailed ? 'Downloading...' : 'Download (details)'}
          </button>
          <button
            type='button'
            onClick={handleDownloadTotal}
            className='btn-secondary'
            disabled={loadingSummary || !hasSubmittedRows || downloadingTotal}
            title='Download all merged submits'
          >
            {downloadingTotal ? <Loader2 size={14} className='animate-spin' /> : <Download size={14} />}
            {loadingSummary ? 'Preparing...' : downloadingTotal ? 'Downloading...' : 'Download'}
          </button>
          {canDeleteSubmits ? (
            <button
              type='button'
              onClick={handleCleanAllSubmits}
              className='btn-secondary text-rose-600 border-rose-200 hover:bg-rose-50'
              disabled={cleaningAll || loadingSummary || !hasSubmittedRows}
              title='Remove all submitted data'
            >
              {cleaningAll ? <Loader2 size={14} className='animate-spin' /> : <Trash2 size={14} />}
              {cleaningAll ? 'Cleaning...' : 'Clean'}
            </button>
          ) : null}
        </div>
      </section>

      {ids.length === 0 ? (
        <section className='surface p-8 text-center text-slate-500'>No submitted users found.</section>
      ) : (
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-4'>
          {ids.map((u) => (
            <SubmitCard key={u} id={u} canDeleteSubmits={canDeleteSubmits} />
          ))}
        </div>
      )}
    </div>
  )
}

function SubmitCard({ id, canDeleteSubmits }: { id: string; canDeleteSubmits: boolean }) {
  const [items, setItems] = useState<SubmittedItems[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  useEffect(() => {
    const unsubs = getSubmittedData(id, setItems)
    const fetchUser = async () => {
      const dbUser = await getDbUser(id)
      setUser(dbUser)
    }
    fetchUser()
    return () => unsubs()
  }, [id])

  const handleDeleteSubmit = async (submitKey: string) => {
    if (!canDeleteSubmits) {
      window.alert('Only Admin can delete submitted data.')
      return
    }
    const ok = window.confirm('Are you sure you want to delete this submitted list?')
    if (!ok) return
    await removeFromSubmit(id, submitKey)
  }

  const handleDownloadSubmit = async (item: SubmittedItems) => {
    if (downloadingKey) return
    setDownloadingKey(item.key)
    try {
      await tilesToExcel(item)
    } finally {
      setDownloadingKey(null)
    }
  }

  const handleDownloadAllForUser = async () => {
    if (downloadingAll || items.length === 0) return
    setDownloadingAll(true)
    try {
      await donwloadDetailed([id])
    } finally {
      setDownloadingAll(false)
    }
  }

  return (
    <article className='surface p-5'>
      <div className='flex items-start justify-between gap-3 mb-5'>
        <div className='flex items-center gap-3'>
          <Photo url={user?.imageUrl || ''} size={46} />
          <div>
            <h2 className='text-base font-semibold text-slate-800'>{user?.name || 'Unknown User'}</h2>
            <p className='text-xs text-slate-500'>{user?.id || id}</p>
          </div>
        </div>
        <button
          type='button'
          className='size-9 rounded-lg border border-slate-200/80 bg-[#f0f2f6] text-slate-600 hover:bg-[#e8ebf0] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed'
          onClick={handleDownloadAllForUser}
          title='Download all submitted items for this user'
          disabled={items.length === 0 || downloadingAll}
        >
          {downloadingAll ? <Loader2 size={16} className='animate-spin' /> : <Download size={16} />}
        </button>
      </div>

      {items.length === 0 ? (
        <p className='text-sm text-slate-500'>No lists submitted.</p>
      ) : (
        <div className='space-y-2.5'>
          {items.map((item, index) => {
            const submittedAt = item.items[0]?.createdAt;
            let submittedText = '';
            if (submittedAt) {
              submittedText = formatDateTimeDDMMYYYY(submittedAt);
            }
            return (
              <div key={item.key} className='rounded-xl neu-inset p-3.5 flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-slate-800'>List {index + 1}</h3>
                  {submittedText && (
                    <span className='text-xs text-slate-400 text-right leading-tight'>
                      {(() => {
                        const [datePart, timePart] = submittedText.split(' ')
                        return (
                          <>
                            Date: {datePart}
                            <br />
                            {timePart || ''}
                          </>
                        )
                      })()}
                    </span>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-xs text-slate-500'>{item.items.length} rows</p>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      className='size-9 rounded-lg border border-slate-200/80 bg-[#f0f2f6] text-slate-600 hover:bg-[#e8ebf0] flex items-center justify-center'
                      onClick={() => handleDownloadSubmit(item)}
                      title='Download Excel'
                      disabled={downloadingKey === item.key}
                    >
                      {downloadingKey === item.key ? <Loader2 size={16} className='animate-spin' /> : <HardDriveDownload size={16} />}
                    </button>
                    {canDeleteSubmits ? (
                      <button type='button' className='size-9 rounded-lg border border-slate-200/80 bg-[#f0f2f6] text-slate-600 hover:bg-[#e8ebf0] flex items-center justify-center' onClick={() => handleDeleteSubmit(item.key)} title='Delete submit'>
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  )
}

