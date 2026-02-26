import { LogOut } from "lucide-react"
import { company, sideNave } from "../data/local"
import { AuthUser } from "../data/types"
import Photo from "./Photo"

interface SideNavProps {
  onSelect: (text: string) => void
  selected: string
  currentUser: AuthUser
  onLogout: () => void
}

export default function SideNav({ onSelect, selected, currentUser, onLogout }: SideNavProps) {
  const Icon = company.logo

  return (
    <aside className='w-[270px] shrink-0 border-r border-slate-200/80 bg-white/75 backdrop-blur-xl p-5 md:p-6 flex flex-col justify-between'>
      <div className='space-y-8'>
        <div className='flex items-center gap-3'>
          <div className='size-11 rounded-2xl bg-slate-700 text-white flex items-center justify-center shadow-md shadow-slate-700/20'>
            <Icon className='size-5' />
          </div>
          <div>
            <p className='font-semibold text-slate-800 leading-none'>{company.name}</p>
            <p className='text-xs text-slate-500 mt-1'>{company.motto}</p>
          </div>
        </div>

        <nav className='space-y-1.5'>
          {sideNave.map((item) => {
            const NavIcon = item.icon
            const active = selected === item.title

            return (
              <button
                key={item.title}
                type='button'
                onClick={() => onSelect(item.title)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition ${
                  active
                    ? "bg-slate-700 text-white shadow-md shadow-slate-700/20"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <NavIcon className='size-4.5' />
                <span className='text-sm font-medium'>{item.title}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className='space-y-4'>
        <div className='rounded-2xl border border-slate-200/80 bg-white p-3 flex items-center gap-3'>
          <Photo url={currentUser.imageUrl} size={42} />
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-slate-800 truncate'>{currentUser.name}</p>
            <p className='text-xs text-slate-500 truncate'>{currentUser.id}</p>
          </div>
        </div>
        <button type='button' onClick={onLogout} className='btn-secondary w-full'>
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  )
}
