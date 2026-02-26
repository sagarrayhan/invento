import React, { useEffect, useState } from 'react'
import Photo from './Photo'
import { getLiveData } from '../data/tiles'
import { Tile, User } from '../data/types'
import { getLiveUsers } from '../data/user'

export default function Liveupdate() {
    const [live, getLive] = useState<Tile[]>()
    const [users, setUsers] = useState<User[]>()
    const [selected, setSelected] = useState<string | null>(null)
    const [active, setActive] = useState('')
    useEffect(() => {
        const unSubUsers = getLiveUsers(users => setUsers(users))
        if(!active) return
        const unsubs = getLiveData(active, (tiles) => { getLive(tiles) })


        return () => {
            unSubUsers
            unsubs
        }
    }, [active])
    return (
        <div className='p-4 w-full'>
            <div className=' flex items-baseline-last gap-2'>
                <h1 className='heading-lg mb-4'>Live Update </h1>
                <div className=' bg-green-900 size-4 rounded-full animate-ping' />
            </div>
            {/* active Users */}
            <div className='flex gap-3 my-3'>
                {
                    users?.map(user => (
                        <div key={user.id} onClick={()=>setActive(user.id)} className={`${user.id == active? "bg-blue-200" : "bg-blue-50"} flex items-center gap-2  justify-center  p-2 rounded-l-full cursor-pointer`}>
                            <Photo url={user.imageUrl} size={60} />
                            <div>
                                <p className=' font-semibold'>{user.name}</p>
                                <p className=' text-sm'>{user.id}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            {
    active && (
        <div className='bg-blue-300 px-2 py-1 rounded-lg'>
            <div className='px-2 bg-blue-300 py-2'>
                <LiveItem code='Code' history='' qty='Qty' />
            </div>

            {
                !live || live.length === 0 ? (
                    <div className="text-center py-4 text-gray-700 font-semibold">
                        No one online
                    </div>
                ) : (
                    live.map(item => (
                        <div
                            key={item.id}
                            onClick={() =>
                                setSelected(selected === item.code ? null : item.code)
                            }
                            className='bg-blue-200 mb-1 px-2 py-1 rounded-sm cursor-pointer transition-all duration-300'
                        >
                            <div className='mb-1'>
                                <LiveItem
                                    code={item.code}
                                    history=''
                                    qty={item.quantity}
                                />
                            </div>

                            {item.code === selected && (
                                <div className='bg-blue-100 rounded-sm p-1'>
                                    <div className='flex justify-between text-sm font-semibold mb-1'>
                                        <p>Grid</p>
                                        <p>History</p>
                                        <p>Qty</p>
                                    </div>

                                    {item.items?.map(g => (
                                        <div
                                            key={g.grid}
                                            className='text-sm border rounded-sm p-1 my-1'
                                        >
                                            <LiveItem
                                                code={g.grid}
                                                history={g.history}
                                                qty={g.quantity}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )
            }
        </div>
    )
}



        </div>
    )
}

function LiveItem({ code, history, qty }: { code: string, history: string, qty: any }) {
    return (
        <div className='flex justify-between'>
            <p>{code}</p>
            <p>{history}</p>
            <p>{qty}</p>
        </div>
    )
}
