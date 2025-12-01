import { LoadingSpinner } from './loading-spinner'

interface PageLoadingProps {
  text?: string
}

/**
 * Full-page loading state used for auth checks and initial page loads
 */
export function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-drop-50 to-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600">{text}</p>
      </div>
    </main>
  )
}

