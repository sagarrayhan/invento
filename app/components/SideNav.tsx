import { company, sideNave } from "../data/local"
import Photo from "./Photo"

export default function SideNav({ onSelect }: { onSelect: (text: string) => void }) {

  const Icon = company.logo
  return (
    <div className='flex flex-col justify-between min-h-screen p-6 w-64 bg-white border-r border-slate-200 shadow-sm'>

      {/* TOP SECTION */}
      <div className='flex flex-col gap-8'>

        {/* Company Header */}
        <div className='flex items-center gap-3 min-w-2xl'>
          <div className='text-white p-2 rounded-xl shadow-md hover:scale-110 transition'>
            <Icon className='size-6' />
          </div>
          <div>
            <p className='text-lg font-semibold text-slate-800'>
              {company.name}
            </p>
            <p className='text-xs text-slate-500'>
              {company.motto}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex flex-col gap-1'>
          {sideNave.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                onClick={() => onSelect(item.title)}
                className='group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer 
                         text-slate-600 hover:bg-blue-50 hover:text-blue-600
                         transition-all duration-200'
              >
                <Icon className='size-5 transition-transform duration-200 group-hover:scale-110' />
                <p className='text-sm font-medium'>
                  {item.title}
                </p>
              </div>
            )
          })}
        </div>

      </div>

      {/* BOTTOM SECTION */}
      <div className='flex flex-col gap-4 pt-6 border-t border-slate-200'>

        {/* User Info */}
        <div className='flex items-center gap-3'>
          <Photo url='' size={45} />
          <div className='flex flex-col'>
            <span className='text-sm font-medium text-slate-700'>
              name
            </span>
            <span className='text-xs text-slate-400'>
              id
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button className='w-full py-2 rounded-xl text-sm font-medium
                         bg-slate-100 hover:bg-red-50 hover:text-red-600
                         transition-all duration-200'>
          Logout
        </button>

      </div>

    </div>
  )

}