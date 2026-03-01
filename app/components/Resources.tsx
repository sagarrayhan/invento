import React, { useEffect, useMemo, useState } from 'react'
import { Send, UploadCloud } from 'lucide-react'
import { getInventoryCodes, replaceInventoryCodes } from '../data/user'

export default function Resources() {
  const [rawCodes, setRawCodes] = useState('')
  const [existingCodes, setExistingCodes] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubs = getInventoryCodes((codes) => setExistingCodes(codes))
    return () => unsubs()
  }, [])

  const parsedCodes = useMemo(() => {
    const cleaned = rawCodes
      .split(/[,\n]+/)
      .map((code) => String(code).trim())
      .filter(Boolean)
    return Array.from(new Set(cleaned))
  }, [rawCodes])

  const handleSend = async () => {
    setError('')
    setMessage('')

    if (parsedCodes.length === 0) {
      setError('Please enter at least one code.')
      return
    }

    try {
      setSending(true)
      await replaceInventoryCodes(parsedCodes)
      setRawCodes('')
      setMessage(`Saved ${parsedCodes.length} codes to /inventory/codes.`)
    } catch {
      setError('Failed to upload codes. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <section className='surface p-5 flex items-center gap-3'>
        <div className='size-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center'>
          <UploadCloud size={18} />
        </div>
        <div>
          <h1 className='text-xl font-semibold text-slate-900'>Resources</h1>
          <p className='text-sm text-slate-500'>Upload and replace inventory resources.</p>
        </div>
      </section>

      <section className='surface p-5 space-y-4'>
        <div>
          <h2 className='text-base font-semibold text-slate-800'>Upload Codes</h2>
          <p className='text-sm text-slate-500 mt-1'>
            Enter comma-separated tile codes like `SPH6601A, CPGVT4401A`. Sending will replace previous values.
          </p>
        </div>

        <textarea
          className='input min-h-44'
          value={rawCodes}
          onChange={(e) => setRawCodes(e.target.value)}
          placeholder='SPH6601A, CPGVT4401A'
        />

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <p className='text-sm text-slate-600'>
            Ready to send: <span className='font-semibold text-slate-800'>{parsedCodes.length}</span> codes
          </p>
          <button type='button' onClick={handleSend} className='btn-primary' disabled={sending}>
            <Send size={14} />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>

        {message ? <p className='text-sm text-emerald-600'>{message}</p> : null}
        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      </section>

      <section className='surface p-5'>
        <h3 className='text-base font-semibold text-slate-800 mb-3'>Current Codes in DB</h3>
        {existingCodes.length === 0 ? (
          <p className='text-sm text-slate-500'>No codes found in /inventory/codes.</p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {existingCodes.map((code) => (
              <span
                key={code}
                className='inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium'
              >
                {code}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
