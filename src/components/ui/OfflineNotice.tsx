import { WifiOff } from 'lucide-react'

export function OfflineNotice() {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm">
      <WifiOff className="h-4 w-4" />
      You are offline. Some data may not be available.
    </div>
  )
}
