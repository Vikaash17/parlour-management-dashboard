import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No data found',
  description = 'There are no records to display.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-12 w-12 text-gray-300 mb-3" />
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}
