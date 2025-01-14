'use client';

interface BookingStepsProps {
  currentStep: 'category' | 'service' | 'details';
}

const steps = [
  { id: 'category', name: 'Category' },
  { id: 'service', name: 'Service' },
  { id: 'details', name: 'Details' },
];

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li 
            key={step.id} 
            className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} ${
              index !== 0 ? 'pl-8 sm:pl-20' : ''
            }`}
          >
            {index !== steps.length - 1 && (
              <div 
                className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2"
                style={{ 
                  background: `linear-gradient(to right, ${
                    index < currentStepIndex ? '#4F46E5' : '#E5E7EB'
                  } 50%, ${
                    index + 1 <= currentStepIndex ? '#4F46E5' : '#E5E7EB'
                  } 50%)` 
                }}
              />
            )}
            <div className="relative flex items-center justify-center">
              <span 
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStepIndex 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {index + 1}
              </span>
              <span className="absolute -bottom-6 text-xs font-medium text-gray-500">
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 