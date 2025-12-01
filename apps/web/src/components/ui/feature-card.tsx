import { LucideIcon } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from './card'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon: Icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <Card className={`relative border-2 hover:border-drop-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white group ${className}`}>
      <CardHeader className="space-y-4 p-6">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#1e293b]">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed text-[#64748b]">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}


