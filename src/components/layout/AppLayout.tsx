import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { OfflineNotice } from '@/components/ui/OfflineNotice'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function AppLayout() {
  const isOnline = useOnlineStatus()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 pb-16 lg:pb-0 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      {!isOnline && <OfflineNotice />}
    </div>
  )
}
