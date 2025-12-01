import { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 sm:py-16 md:py-20 ${className}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 mb-4 sm:mb-6">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2 px-4">{title}</h3>
      <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 px-4">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="border-2 border-drop-300 hover:bg-drop-50 text-drop-700 font-semibold"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}


