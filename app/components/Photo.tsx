
import React from 'react'
import Image from 'next/image'

export default function Photo({ url, size }: { url: string, size: number }) {
  return (
    <Image
      className='rounded-full object-cover ring-2 ring-white shadow-sm bg-slate-100'
      src={url || '/user.png'}
      width={size}
      height={size}
      alt='Image'
    />
  )
}
