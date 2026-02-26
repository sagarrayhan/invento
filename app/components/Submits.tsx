import React, { useEffect, useState } from 'react'
import { getAllSubmittedData, getSubmittedData, removeFromSubmit } from '../data/tiles'
import { SubmittedItems, Tile, User } from '../data/types'
import { Download, HardDriveDownload, Send, Trash } from 'lucide-react'
import Photo from './Photo'
import { exportAll, tilesToExcel } from '@/lib/excel'
import { getDbUser, getSubmittedUsers } from '../data/user'

export default function Submits() {
  const [ids, setUsers] = useState<string[]>([])
  var allTiles: Tile[] | null = null

  useEffect(() => {
    const unsubs = getSubmittedUsers(setUsers)
    return unsubs
  }, [])

  useEffect(() => {
    if (ids.length === 0) return

    const fetchTiles = async () => {
      allTiles = await getAllSubmittedData(ids)
    }
    fetchTiles()

  }, [ids])

  return (
    <div className='p-16 w-full'>
      <div className=' flex flex-col gap-8'>
        <div className=' w-full shadow-sm p-2 rounded-sm border border-gray-100 bg-white flex gap-4 items-center'>
          <Send className=' size-8' />
          <div>
            <h1 className='heading-lg'>Submits</h1>
            <p className="text-sm text-gray-500">Manage and download your submitted lists</p>
          </div>
        </div>

        <div className=' grid grid-cols-2 gap-8'>
          {
            ids.map(u => (
              <SubmitCard key={u} id={u} />
            ))
          }
        </div>
      </div>

    </div>
  )
}



function SubmitCard({ id }: { id: string }) {

  const [items, setItems] = useState<SubmittedItems[]>()
  const [user, setUser] = useState<User | null>()

  useEffect(() => {
    const unsubs = getSubmittedData(id, setItems)
    async function getUser() {
      const dbUser = await getDbUser(id)
      setUser(dbUser)
    }
    getUser()
    return unsubs
  }, [])
  return (
    <div className="p-6 shadow-sm border border-gray-100 bg-white">

      {/* Profile Section */}
      <div className="flex items-center gap-3 mb-6">
        <Photo url={user?.imageUrl? user.imageUrl : ""} size={50} />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.id}</p>
        </div>
      </div>

      {/* Lists */}
      <div className="space-y-4">
        {items?.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 border border-gray-100"
          >
            {/* Left Side */}
            <div>
              <h3 className="font-medium text-gray-800">
                List {index + 1}
              </h3>
              <p className="text-xs text-gray-400">
                ID: {user?.name}
              </p>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-green-50 transition">
                <HardDriveDownload
                  color="green"
                  size={20}
                  className="hover:scale-110 transition cursor-pointer"
                  onClick={() => {
                    tilesToExcel(item)
                  }}
                />
              </button>

              <button className="p-2 rounded-lg hover:bg-red-50 transition">
                <Trash
                  onClick={() => removeFromSubmit(id, item.key)}
                  color="red"
                  size={20}
                  className="hover:scale-110 transition cursor-pointer"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}