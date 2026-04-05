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
    <aside className='w-67.5 shrink-0 h-full overflow-hidden border-r border-slate-200/70 bg-[#e9ecf0]/80 backdrop-blur-xl p-5 md:p-6 grid grid-rows-[auto_1fr_auto] gap-6 min-h-0'>
      <div className='flex items-center gap-3'>
        <div className='size-11 rounded-2xl neu-soft text-slate-700 flex items-center justify-center'>
          <Icon className='size-5' />
        </div>
        <div>
          <p className='font-semibold text-slate-800 leading-none'>{company.name}</p>
          <p className='text-xs text-slate-500 mt-1'>{company.motto}</p>
        </div>
      </div>

      <nav className='space-y-1.5 overflow-y-auto pr-1 min-h-0'>
          {sideNave.map((item) => {
            const NavIcon = item.icon
            const active = selected === item.title

            return (
              <button
                key={item.title}
                type='button'
                onClick={() => onSelect(item.title)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition bg-transparent shadow-none ${active
                    ? "border border-slate-200/80 bg-[#e7ebf1] text-slate-800 shadow-inner hover:bg-[#e7ebf1] hover:shadow-inner"
                    : "text-slate-600 hover:border hover:border-slate-200/80 hover:bg-[#edf0f4] hover:shadow-sm active:shadow-inner"
                  }`}
              >
                <NavIcon className='size-4.5' />
                <span className='text-sm font-medium'>{item.title}</span>
              </button>
            )
          })}
      </nav>

      <div className='space-y-4'>
        <div className='rounded-2xl neu-inset p-3 flex items-center gap-3'>
          <div className='rounded-full p-1 neu-inset'>
            <Photo url={currentUser.imageUrl} size={42} />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-slate-800 truncate'>{currentUser.name}</p>
            <p className='text-xs text-slate-500 truncate'>{currentUser.id}</p>
          </div>
        </div>
        <button type='button' onClick={onLogout} className='btn-secondary w-full'>
          <LogOut size={14} />
          Logout
        </button>
        <p className='text-[11px] tracking-wide text-slate-500 text-center leading-relaxed'>
          All rights reserved.
          <br />
          Coders Cottage (SR) &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}

