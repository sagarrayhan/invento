
import Image from 'next/image'

export default function Photo({ url, size }: { url: string, size: number }) {
  return (
    <Image
      className='rounded-full object-cover shadow-sm bg-[var(--surface-soft)]'
      src={url || '/user.png'}
      width={size}
      height={size}
      alt='Image'
      unoptimized
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement
        if (!target.src.endsWith('/user.png')) {
          target.src = '/user.png'
        }
      }}
    />
  )
}
