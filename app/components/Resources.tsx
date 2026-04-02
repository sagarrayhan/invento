import { useEffect, useMemo, useState } from 'react'
import { Send, UploadCloud } from 'lucide-react'
import { getInventoryCodes, replaceInventoryCodes } from '../data/user'
import type { InventoryCode } from '../data/types'

export default function Resources() {
  const [rawCodes, setRawCodes] = useState('')
  const [existingCodes, setExistingCodes] = useState<InventoryCode[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const unsubs = getInventoryCodes((codes) => setExistingCodes(codes))
    return () => unsubs()
  }, [])

  const parsedCodes = useMemo(() => {
    return rawCodes
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const tabParts = line.split(/\t+/).map((part) => part.trim()).filter(Boolean)
        if (tabParts.length >= 2) {
          return { code: tabParts[0], size: tabParts.slice(1).join(' ') }
        }

        const commaParts = line.split(',').map((part) => part.trim()).filter(Boolean)
        if (commaParts.length >= 2) {
          return { code: commaParts[0], size: commaParts.slice(1).join(' ') }
        }

        const spaceParts = line.split(/\s+/).map((part) => part.trim()).filter(Boolean)
        if (spaceParts.length >= 2) {
          return { code: spaceParts[0], size: spaceParts.slice(1).join(' ') }
        }

        return { code: line, size: '' }
      })
      .filter((item) => item.code.length > 0)

  }, [rawCodes])

  const handleSend = async () => {
    setError('')
    setMessage('')

    if (parsedCodes.length === 0) {
      setError('Please enter at least one code.')
      return
    }

    if (parsedCodes.some((item) => item.size.length === 0)) {
      setError('Each row must include both code and size.')
      return
    }

    try {
      setSending(true)
      await replaceInventoryCodes(parsedCodes)
      setRawCodes('')
      setMessage(`Saved ${parsedCodes.length} code-size rows to /inventory/codes.`)
    } catch {
      setError('Failed to upload codes. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <section className='surface p-5 flex items-center gap-3'>
        <div className='size-10 rounded-xl neu-inset text-slate-700 flex items-center justify-center'>
          <UploadCloud size={18} />
        </div>
        <div>
          <h1 className='text-xl font-semibold text-slate-900'>Resources</h1>
          <p className='text-sm text-slate-500'>Upload and replace inventory resources.</p>
        </div>
      </section>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <section className='surface p-5 space-y-4'>
          <div>
            <h2 className='text-base font-semibold text-slate-800'>Upload Codes</h2>
            <p className='text-sm text-slate-500 mt-1'>
              Paste one row per line with code and size (example: `MW2300 20x30`, `MW2300,20x30`, or from spreadsheet with two columns).
            </p>
          </div>

          <textarea
            className='input min-h-44'
            value={rawCodes}
            onChange={(e) => setRawCodes(e.target.value)}
            placeholder={'MW2300\t20x30\nMW2300BK\t20x30'}
          />

          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm text-slate-600'>
              Ready to send: <span className='font-semibold text-slate-800'>{parsedCodes.length}</span> rows
            </p>
            <button type='button' onClick={handleSend} className='btn-primary' disabled={sending}>
              <Send size={14} />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>

          {message ? <p className='text-sm text-slate-600'>{message}</p> : null}
          {error ? <p className='text-sm text-slate-600'>{error}</p> : null}
        </section>

        <section className='surface p-5'>
          <h3 className='text-base font-semibold text-slate-800 mb-3'>Current Codes in DB</h3>
          {existingCodes.length === 0 ? (
            <p className='text-sm text-slate-500'>No codes found in /inventory/codes.</p>
          ) : (
            <div className='max-h-[440px] overflow-y-auto pr-1'>
              <div className='flex flex-wrap gap-2'>
                {existingCodes.map((item, index) => (
                  <span
                    key={`${item.code}-${item.size}-${index}`}
                    className='inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium'
                  >
                    {item.code}{item.size ? ` (${item.size})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
