interface ProgressStepsProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index < currentStep
                  ? 'bg-indigo-600 text-white'
                  : index === currentStep
                  ? 'bg-indigo-200 text-indigo-800'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-around mt-2">
        {steps.map((step, index) => (
          <span
            key={step}
            className={`text-sm ${
              index === currentStep ? 'text-indigo-600 font-medium' : 'text-gray-500'
            }`}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
} 