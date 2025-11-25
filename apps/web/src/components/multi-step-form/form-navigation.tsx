import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isSubmitting?: boolean
  canGoNext?: boolean
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isSubmitting = false,
  canGoNext = true,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-8 border-t border-slate-200">
      {!isFirstStep ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
      ) : (
        <div />
      )}

      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting || !canGoNext}
        className="bg-drop-500 hover:bg-drop-600 font-semibold"
      >
        {isSubmitting ? (
          'Processing...'
        ) : isLastStep ? (
          'Submit'
        ) : (
          <>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  )
}
