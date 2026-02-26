import React, { useState } from 'react'
import { Briefcase, CalendarDays, Eye, EyeOff, KeyRound, UserRound, X } from 'lucide-react'
import { User } from '../data/types'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: User) => Promise<void>
}

export default function CreateUserModal({ open, onClose, onSubmit }: CreateUserModalProps) {
  const [form, setForm] = useState<User>({
    id: '',
    designation: 'Manager',
    joinedAt: '',
    password: '',
    name: '',
    imageUrl: '',
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!form.id.trim() || !form.name.trim() || !form.designation.trim() || !form.joinedAt.trim() || !form.password.trim()) {
      setError('Please fill all fields.')
      return
    }

    try {
      setSubmitting(true)
      await onSubmit({
        id: form.id.trim(),
        designation: form.designation.trim(),
        joinedAt: form.joinedAt.trim(),
        password: form.password,
        name: form.name.trim(),
        imageUrl: '',
      })
      setForm({
        id: '',
        designation: 'Manager',
        joinedAt: '',
        password: '',
        name: '',
        imageUrl: '',
      })
      onClose()
    } catch {
      setError('Unable to create user. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-slate-500/25 backdrop-blur-sm flex items-center justify-center p-4'>
      <form onSubmit={handleSubmit} className='w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-500/15'>
        <div className='flex items-start justify-between mb-5'>
          <div>
            <h2 className='text-xl font-semibold text-slate-900'>Create User</h2>
            <p className='text-sm text-slate-500 mt-1'>Add credentials and joining details.</p>
          </div>
          <button type='button' onClick={onClose} className='size-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500'>
            <X size={16} />
          </button>
        </div>

        <div className='space-y-3'>
          <Field icon={<UserRound size={16} />}><input type='text' placeholder='User ID' value={form.id} onChange={(e) => setForm((prev) => ({ ...prev, id: e.target.value }))} className='input pl-10' /></Field>
          <Field icon={<UserRound size={16} />}><input type='text' placeholder='User Name' value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className='input pl-10' /></Field>
          <Field icon={<Briefcase size={16} />}>
            <select value={form.designation} onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))} className='input pl-10 appearance-none'>
              <option value='Manager'>Manager</option>
              <option value='Executive'>Executive</option>
              <option value='Officer'>Officer</option>
            </select>
          </Field>
          <Field icon={<CalendarDays size={16} />}><input type='date' value={form.joinedAt} onChange={(e) => setForm((prev) => ({ ...prev, joinedAt: e.target.value }))} className='input pl-10' /></Field>
          <Field icon={<KeyRound size={16} />}>
            <input type={showPassword ? 'text' : 'password'} placeholder='Password' value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} className='input pl-10 pr-10' />
            <button type='button' onClick={() => setShowPassword((prev) => !prev)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700'>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </Field>
        </div>

        {error ? <p className='text-sm text-rose-500 mt-3'>{error}</p> : null}

        <div className='mt-5 flex justify-end gap-2'>
          <button type='button' onClick={onClose} disabled={submitting} className='btn-secondary'>
            Cancel
          </button>
          <button type='submit' disabled={submitting} className='btn-primary'>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='relative'>
      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>{icon}</span>
      {children}
    </div>
  )
}
