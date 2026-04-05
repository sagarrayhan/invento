
import Image from 'next/image'

export default function Photo({ url, size }: { url: string, size: number }) {
  return (
    <div
      className='relative shrink-0 overflow-hidden rounded-full shadow-sm bg-[var(--surface-soft)]'
      style={{ width: size, height: size }}
    >
      <Image
        className='h-full w-full object-cover'
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
    </div>
  )
}
