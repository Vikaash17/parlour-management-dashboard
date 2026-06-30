import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Scissors,
  CalendarCheck,
  DollarSign,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/services', icon: Scissors, label: 'Services' },
  { to: '/visits', icon: CalendarCheck, label: 'Visits' },
  { to: '/expenses', icon: DollarSign, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { settings } = useApp()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-pink-500 rounded-xl p-2">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">{settings.businessName}</h1>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </aside>
  )
}
