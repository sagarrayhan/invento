import { Camera, ShieldCheck, Trash2, UserPlus2, Users2 } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AuthUser, User } from '../data/types'
import Photo from './Photo'
import { deleteDbUser, getAllUsers, setDbUser, setImageUrl } from '../data/user'
import CreateUserModal from './CreateUserModal'
import { formatDateDDMMYYYY } from '@/lib/date'

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

export default function Users({ currentUser }: { currentUser: AuthUser }) {
  const [users, setUsers] = useState<User[]>([])
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const canCreateUsers = currentUser.designation === 'Sr. Manager'

  const groupedUsers = useMemo(() => {
    const sortedByDesignation = [...users].sort((a, b) => {
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
    return sortedByDesignation
  }, [users])
  const adminUsers = groupedUsers.filter((user) => user.designation === 'Sr. Manager')
  const nonAdminUsers = groupedUsers.filter((user) => user.designation !== 'Sr. Manager')
  const currentUserIsAdmin = currentUser.designation === 'Sr. Manager'

  useEffect(() => {
    const unsubs = getAllUsers(setUsers)
    return () => unsubs()
  }, [])

  const handleCreateUser = async (value: User) => {
    if (!canCreateUsers) return
    await setDbUser(value)
  }

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <div className='surface p-5 flex items-center justify-between gap-3 anim-enter'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-xl neu-inset text-slate-700 flex items-center justify-center'>
            <Users2 size={18} />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-slate-900'>Users</h1>
            <p className='text-sm text-slate-500'>Manage access and profile images for your team.</p>
          </div>
        </div>
        {canCreateUsers ? (
          <button type='button' onClick={() => setOpenCreateModal(true)} className='btn-primary'>
            <UserPlus2 size={15} />
            Create User
          </button>
        ) : null}
      </div>

      <div className='max-h-[calc(100vh-230px)] overflow-y-auto pr-1 space-y-5 rounded-3xl bg-[var(--surface)] p-1'>
        {adminUsers.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {adminUsers.map((user, index) => (
              <UsersCard
                key={user.id}
                user={user}
                onDelete={deleteDbUser}
                currentUser={currentUser}
                isAdmin
                currentUserIsAdmin={currentUserIsAdmin}
                delayMs={80 + index * 40}
              />
            ))}
          </div>
        ) : null}

        {nonAdminUsers.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {nonAdminUsers.map((user, index) => (
              <UsersCard
                key={user.id}
                user={user}
                onDelete={deleteDbUser}
                currentUser={currentUser}
                isAdmin={false}
                currentUserIsAdmin={currentUserIsAdmin}
                delayMs={120 + index * 30}
              />
            ))}
          </div>
        ) : null}
        </div>

      {canCreateUsers ? (
        <CreateUserModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      ) : null}
    </div>
  )
}

function UsersCard({
  user,
  onDelete,
  currentUser,
  isAdmin,
  currentUserIsAdmin,
  delayMs = 0,
}: {
  user: User
  onDelete: (uid: string) => Promise<void>
  currentUser: AuthUser
  isAdmin: boolean
  currentUserIsAdmin: boolean
  delayMs?: number
}) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const isCurrentUser = user.id === currentUser.id
  const canEditPhoto = isCurrentUser || currentUserIsAdmin

  const handleDelete = async () => {
    if (isCurrentUser) return
    const ok = window.confirm(`Delete user ${user.name} (${user.id})?`)
    if (!ok) return
    try {
      setDeleting(true)
      await onDelete(user.id)
    } finally {
      setDeleting(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'invento')

    const res = await fetch('https://api.cloudinary.com/v1_1/dj4jjjefd/image/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setUploading(false)
    setImageUrl(data.secure_url, user.id)
  }

  return (
    <article className={`surface p-5 relative anim-enter hover-lift ${isAdmin ? 'pt-10' : ''}`} style={{ animationDelay: `${delayMs}ms` }}>
      {isAdmin ? (
        <p
          className='absolute right-3 top-3 inline-flex size-14 flex-col items-center justify-center rounded-full neu-inset text-slate-600 text-[9px] leading-none font-semibold'
          title='Admin'
        >
          <ShieldCheck size={13} />
          <span className='mt-1'>Admin</span>
        </p>
      ) : null}
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Photo url={preview || user.imageUrl} size={68} />
            {canEditPhoto ? (
              <>
                <button
                  type='button'
                  onClick={uploading ? undefined : () => fileRef.current?.click()}
                  className='absolute -bottom-1 -right-1 size-7 rounded-full bg-[#eff2f6] border border-slate-200/80 shadow-sm flex items-center justify-center'
                  title='Change image'
                >
                  <Camera size={13} />
                </button>
                <input type='file' ref={fileRef} onChange={handleFileChange} className='hidden' accept='image/*' />
              </>
            ) : null}
          </div>
          <div>
            <h2 className='font-semibold text-slate-800'>{user.name}</h2>
            <p className='text-xs text-slate-500 mt-0.5'>{user.id}</p>
            <p className='inline-flex mt-2 rounded-full border border-slate-200/80 bg-[#f0f2f6] text-slate-600 px-2.5 py-1 text-xs font-medium shadow-inner'>
              {user.designation}
            </p>
            {uploading ? <p className='text-xs text-slate-500 mt-1'>Uploading image...</p> : null}
          </div>
        </div>
        {
          currentUser.designation == "Sr. Manager" && <button
            type='button'
            onClick={handleDelete}
            disabled={deleting || isCurrentUser || currentUser.designation != "Sr. Manager"}
            className='size-9 rounded-xl border border-slate-200/80 bg-[#f0f2f6] text-slate-600 hover:bg-[#e8ebf0] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
            title={isCurrentUser ? 'Logged-in user cannot be deleted' : 'Delete user'}
          >
            <Trash2 size={15} />
          </button>
        }
      </div>
      <div className='mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between'>
        <span>Joined</span>
        <span className='font-medium text-slate-700'>{formatDateDDMMYYYY(user.joinedAt)}</span>
      </div>
    </article>
  )
}

