import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Scissors,
  CalendarCheck,
  DollarSign,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/services', icon: Scissors, label: 'Services' },
  { to: '/visits', icon: CalendarCheck, label: 'Visits' },
  { to: '/expenses', icon: DollarSign, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
      <div className="flex items-center overflow-x-auto py-1 px-1 gap-0">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium transition-colors rounded-lg min-w-[60px] flex-shrink-0',
                isActive ? 'text-pink-600' : 'text-gray-400',
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
