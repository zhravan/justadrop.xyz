interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 sm:w-12 sm:h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`inline-block ${sizeClasses[size]} border-drop-600 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4`} />
      {text && (
        <p className="text-sm sm:text-base text-slate-600 font-medium">{text}</p>
      )}
    </div>
  )
}


