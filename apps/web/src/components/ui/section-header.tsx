import { ReactNode } from 'react'

interface SectionHeaderProps {
  badge?: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ badge, title, description, className = '' }: SectionHeaderProps) {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {badge && (
        <div className="inline-block px-4 py-2 bg-drop-100 rounded-full text-sm font-bold text-drop-700 mb-4">
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      {description && (
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}


