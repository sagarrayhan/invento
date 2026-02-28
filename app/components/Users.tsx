import { Camera, Trash2, UserPlus2, Users2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { AuthUser, User } from '../data/types'
import Photo from './Photo'
import { deleteDbUser, getAllUsers, setDbUser, setImageUrl } from '../data/user'
import CreateUserModal from './CreateUserModal'

export default function Users({ currentUser }: { currentUser: AuthUser }) {
  const [users, setUsers] = useState<User[]>([])
  const [openCreateModal, setOpenCreateModal] = useState(false)

  useEffect(() => {
    const unsubs = getAllUsers(setUsers)
    return () => unsubs()
  }, [])

  const handleCreateUser = async (value: User) => {
    await setDbUser(value)
  }

  return (
    <div className='w-full p-4 md:p-6 space-y-5'>
      <div className='surface p-5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='size-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center'>
            <Users2 size={18} />
          </div>
          <div>
            <h1 className='text-xl font-semibold text-slate-900'>Users</h1>
            <p className='text-sm text-slate-500'>Manage access and profile images for your team.</p>
          </div>
        </div>
        <button type='button' onClick={() => setOpenCreateModal(true)} className='btn-primary'>
          <UserPlus2 size={15} />
          Create User
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4'>
        {users.map((user) => (
          <UsersCard key={user.id} user={user} onDelete={deleteDbUser} currentUser={currentUser} />
        ))}
      </div>

      <CreateUserModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  )
}

function UsersCard({
  user,
  onDelete,
  currentUser,
}: {
  user: User
  onDelete: (uid: string) => Promise<void>
  currentUser: AuthUser
}) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const isCurrentUser = user.id === currentUser.id

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
    <article className='surface p-5'>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <Photo url={preview || user.imageUrl} size={68} />
            <button
              type='button'
              onClick={uploading ? undefined : () => fileRef.current?.click()}
              className='absolute -bottom-1 -right-1 size-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center'
              title='Change image'
            >
              <Camera size={13} />
            </button>
            <input type='file' ref={fileRef} onChange={handleFileChange} className='hidden' accept='image/*' />
          </div>
          <div>
            <h2 className='font-semibold text-slate-800'>{user.name}</h2>
            <p className='text-xs text-slate-500 mt-0.5'>{user.id}</p>
            <p className='inline-flex mt-2 rounded-full bg-sky-50 text-sky-700 px-2.5 py-1 text-xs font-medium'>
              {user.designation}
            </p>
            {uploading ? <p className='text-xs text-sky-600 mt-1'>Uploading image...</p> : null}
          </div>
        </div>
        {
          currentUser.designation == "Sr. Manager" && <button
            type='button'
            onClick={handleDelete}
            disabled={deleting || isCurrentUser || currentUser.designation != "Sr. Manager"}
            className='size-9 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
            title={isCurrentUser ? 'Logged-in user cannot be deleted' : 'Delete user'}
          >
            <Trash2 size={15} />
          </button>
        }
      </div>
      <div className='mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between'>
        <span>Joined</span>
        <span className='font-medium text-slate-700'>{user.joinedAt}</span>
      </div>
    </article>
  )
}
