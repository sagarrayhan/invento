'use client'



import { Radio, Send, Users } from 'lucide-react'
import { Icon } from 'next/dist/lib/metadata/types/metadata-types'
import React from 'react'

export default function Dashboard() {
    return (
        <div className='p-4 w-full'>
            <h1 className='heading-lg mb-4'>Dashboard</h1>
            <div className='grid grid-cols-3 gap-2 w-full'>
                <Card title='Live Users' icon={<Radio />} quantity={5} />
                <Card title='Submits' icon={<Send />} quantity={3} />
                <Card title='Total Users' icon={<Users />} quantity={8} />
            </div>
        </div>
    )
}

function Card({ title, icon, quantity }: { title: string, icon: React.ReactNode, quantity: number }) {
    return (
        <div>
            <div className='card'>
                <div className='flex justify-between'>
                    <h1>{title}</h1>
                    {icon}
                </div>
                <h1 className='heading-xl'>{quantity}</h1>
            </div>
        </div>
    )
}


