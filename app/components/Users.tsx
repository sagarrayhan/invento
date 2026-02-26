import { Pencil, Users2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { User } from '../data/types'
import Photo from './Photo'
import { getAllUsers, setImageUrl } from '../data/user'

export default function Users() {

  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    getAllUsers(setUsers)
  }, [])
  return (
    <div className=' w-full p-16 space-y-8'>
      <div className=' shadow-sm border-gray-100 p-4 flex gap-2'>
        <Users2 />
        <h1>Users</h1>
      </div>
      <div className=' grid grid-cols-3 gap-4'>
        {
          users?.map(user => (
            <UsersCard key={user.id} user={user} />
          ))
        }
      </div>
    </div>

  )
}


function UsersCard({ user }: { user: User }) {
  const [loading, setLoading] = useState(false)
const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const handleClick = () => {
    fileRef.current?.click()   // Open file picker
  }



const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "invento")

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/dj4jjjefd/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    )

    const data = await res.json()
    setLoading(false)

    setImageUrl(data.secure_url, user.id )
}
  return (
    <div className='shadow-sm rounded-2xl border-gray-100'>
      <div className=' flex flex-col items-center gap-2 justify-center p-8 '>
        <div className="relative w-fit">
          <Photo url={preview || user.imageUrl} size={80} />

          <div onClick={handleClick} className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md cursor-pointer">
            <Pencil size={12} />
          </div>
          <input
            type="file"
            ref={fileRef}
            onChange={handleFileChange}
            className=' hidden'
            accept='image/*'

          />
        </div>
        <div className=' flex flex-col justify-center items-center gap-2'>
          <h1 className=' font-semibold opacity-70'>{user.name}</h1>
          <p className=' text-xs bg-blue-50 inline-block p-2 rounded-3xl px-5 text-gray-500'>{user.designation}</p>
        </div>
      </div>
      <div className=' bg-blue-50 rounded-2xl text-sm text-gray-500 p-2 flex items-center justify-between px-4'>
        <p>{`Id: ${user.id}`}</p>
        <p>{`Joined: ${user.joinedAt}`}</p>
      </div>
    </div>

  )

}
