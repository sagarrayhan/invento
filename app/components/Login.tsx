'use client'
import React, { useState } from 'react'
import { ArrowRight, KeyRound, LoaderCircle, LoaderCircleIcon, UserRound } from 'lucide-react'
import { AuthUser } from '../data/types'
import { Logo } from './Logo'

export default function Login({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [form, setForm] = useState({ id: '', pass: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    if (form.id.trim() === '' || form.pass.trim() === '') {
      setError('Id and password are required.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: form.id.trim(),
          password: form.pass,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Login failed.')
        return
      }
      onLogin(data.user as AuthUser)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='app-shell flex items-center justify-center'>
      <div className='grid lg:grid-cols-[1.05fr_0.95fr] w-full max-w-5xl surface overflow-hidden'>
        <div className='hidden lg:flex flex-col justify-between p-10 bg-slate-700 text-white'>
          <div className='flex items-center gap-3'>
            <Logo className='size-10' />
            <h1 className='text-2xl font-semibold'>Invento</h1>
          </div>
          <div>
            <h2 className='text-4xl font-semibold leading-tight'>Inventory intelligence with live control.</h2>
            <p className='text-slate-200 mt-3'>Track users, live activity, and submit flows from one dashboard.</p>
          </div>
          <p className='text-xs text-slate-300'>Secure access for your team workspace</p>
        </div>

        <div className='p-7 md:p-10 bg-white'>
          <div className='mb-7'>
            <p className='text-xs tracking-[0.18em] uppercase text-slate-400'>Welcome Back</p>
            <h2 className='heading-lg mt-2'>Sign in to continue</h2>
          </div>

          <div className='space-y-4'>
            <div className='relative'>
              <UserRound size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                value={form.id}
                onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))}
                className='input pl-10'
                placeholder='User ID'
              />
            </div>
            <div className='relative'>
              <KeyRound size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                type='password'
                value={form.pass}
                onChange={(e) => setForm((prev) => ({ ...prev, pass: e.target.value }))}
                className='input pl-10'
                placeholder='Password'
              />
            </div>
            <button disabled={loading} onClick={submit} className='btn-primary w-full'>
              {loading ? 'Signing in...' : 'Sign In'}
              {loading? <ArrowRight size={15}/> : <LoaderCircleIcon className=' animate-spin'/>}
            </button>
            <p className='text-sm text-rose-500 min-h-5'>{error}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
