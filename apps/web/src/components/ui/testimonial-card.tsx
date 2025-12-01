import { Quote, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader } from './card'

interface TestimonialCardProps {
  rating: number
  text: string
  author: string
  role: string
  initials: string
  className?: string
}

export function TestimonialCard({ rating, text, author, role, initials, className = '' }: TestimonialCardProps) {
  return (
    <Card className={`border-2 relative ${className}`}>
      <Quote className="absolute top-6 right-6 h-12 w-12 text-drop-100" />
      <CardHeader className="space-y-4">
        <div className="flex gap-1">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <CardDescription className="text-base text-slate-700 leading-relaxed">
          {text}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-drop-400 to-drop-600 flex items-center justify-center">
          <span className="text-white font-bold">{initials}</span>
        </div>
        <div>
          <div className="font-bold text-slate-900">{author}</div>
          <div className="text-sm text-slate-600">{role}</div>
        </div>
      </CardContent>
    </Card>
  )
}


