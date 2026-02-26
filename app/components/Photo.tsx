
import React from 'react'
import Image from 'next/image'

export default function Photo({ url, size }: { url: string, size: number }) {
  return (

    <Image className=' rounded-full outline-blue-500 outline-2 p-1' src={url ? url : "/user.png"} width={size} height={size} alt='Image' />


  )
}
