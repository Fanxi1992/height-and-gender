
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep, totalSteps }) => {
  const dots = [];

  for (let i = 1; i <= totalSteps; i++) {
    dots.push(
      <div
        key={i}
        className={`${
          i === currentStep ? 'progress-dot-active bg-app-blue' : 'progress-dot bg-gray-400'
        }`}
      />
    );
  }

  return <div className="progress-container">{dots}</div>;
};

export default ProgressIndicator;
