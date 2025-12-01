import { LucideIcon } from 'lucide-react'

interface WhyChooseCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function WhyChooseCard({ icon: Icon, title, description, className = '' }: WhyChooseCardProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
      <p className="text-base text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}


