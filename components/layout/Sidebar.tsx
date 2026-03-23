'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, CreditCard, Bell,
  Brain, Activity, Settings, LogOut, ShieldAlert,
  Gift
} from 'lucide-react'
import { api } from '@/lib/api'

const nav = [
  { href: '/',              icon: LayoutDashboard, label: 'Overview'      },
  { href: '/users',         icon: Users,           label: 'Users'         },
  { href: '/subscriptions', icon: CreditCard,      label: 'Subscriptions' },
  { href: '/notifications', icon: Bell,            label: 'Broadcasts'    },
  { href: '/ai-usage',      icon: Brain,           label: 'AI Usage'      },
  { href: '/referrals',     icon: Gift,            label: 'Referrals'     },
  { href: '/health',        icon: Activity,        label: 'App Health'    },
  { href: '/content',       icon: ShieldAlert,     label: 'Content'       },
  { href: '/settings',      icon: Settings,        label: 'Settings'      },
]

export function Sidebar() {
  const path   = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await api.adminLogout()
    } catch {
      
    }
    // Clear the admin_token cookie by setting it expired
    document.cookie = 'admin_token=; Max-Age=0; path=/'
    router.push('/login')
  }

  return (
    <aside className="w-60 flex-shrink-0 border-r border-white/8 flex flex-col bg-[#0d0d0d]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-accent/20">
              <img
                src="/AppIcon.png"
                alt="3TABZ"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-white leading-tight">
                3TAB<span className="text-accent">Z</span>
              </span>
              <span className="text-[10px] text-[#666] tracking-wider">ADMIN PORTAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm',
                active
                  ? 'bg-accent/12 text-accent border-l-2 border-accent -ml-px pl-[11px] font-medium'
                  : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="px-3 py-2 mb-1">
          <div className="text-sm text-white font-medium">Admin</div>
          <div className="text-xs text-[#888]">3TABZ Platform</div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 text-sm text-[#888] hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={14} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
