import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from './card'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: string
  bgColor?: string
  className?: string
}

export function StatCard({ icon: Icon, label, value, color = 'text-drop-600', bgColor = 'bg-drop-100', className = '' }: StatCardProps) {
  return (
    <Card className={`border border-slate-200 sm:border-2 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow ${className}`}>
      <CardContent className="p-3 sm:p-4 md:p-6 text-center">
        <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full ${bgColor} mb-2 sm:mb-3`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${color}`} />
        </div>
        <div className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 mb-0.5 sm:mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-medium leading-tight">
          {label}
        </div>
      </CardContent>
    </Card>
  )
}


