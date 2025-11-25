import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-10">
          <div
            className="h-full bg-drop-500 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = step.number < currentStep
          const isCurrent = step.number === currentStep
          const isFuture = step.number > currentStep

          return (
            <div key={step.number} className="flex flex-col items-center relative flex-1">
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${isCompleted ? 'bg-drop-500 text-white' : ''}
                  ${isCurrent ? 'bg-drop-500 text-white ring-4 ring-drop-100' : ''}
                  ${isFuture ? 'bg-white border-2 border-slate-200 text-slate-400' : ''}
                `}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
              </div>

              {/* Step Title */}
              <div
                className={`
                  mt-2 text-xs md:text-sm font-medium text-center px-2
                  ${isCurrent ? 'text-drop-600 font-semibold' : ''}
                  ${isCompleted ? 'text-slate-700' : ''}
                  ${isFuture ? 'text-slate-400' : ''}
                `}
              >
                {step.title}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
