import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../contexts/ProfileContext';
import Step1LearningStyle from './Step1LearningStyle';
import Step2ChooseCoach from './Step2ChooseCoach';
import Step3Schedule from './Step3Schedule';
import Step4Confirm from './Step4Confirm';
import './OnboardingPage.css';

const TOTAL_STEPS = 4;

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    learning_style: null,
    coach_id: null,
    study_schedule: {
      days: [],
      time: '21:00',
      duration_minutes: 10
    }
  });

  const { completeOnboarding } = useProfile();
  const navigate = useNavigate();

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding(formData);
      navigate('/studio');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1LearningStyle
            selectedStyle={formData.learning_style}
            onSelect={(style) => {
              updateFormData({ learning_style: style });
              nextStep();
            }}
          />
        );
      case 2:
        return (
          <Step2ChooseCoach
            selectedCoach={formData.coach_id}
            onSelect={(coach) => {
              updateFormData({ coach_id: coach });
              nextStep();
            }}
            onBack={previousStep}
          />
        );
      case 3:
        return (
          <Step3Schedule
            schedule={formData.study_schedule}
            onUpdate={(schedule) => {
              updateFormData({ study_schedule: schedule });
              nextStep();
            }}
            onBack={previousStep}
          />
        );
      case 4:
        return (
          <Step4Confirm
            formData={formData}
            onConfirm={handleComplete}
            onBack={previousStep}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            Step {currentStep} of {TOTAL_STEPS}
          </div>
        </div>

        {/* Step Content */}
        <div className="onboarding-content">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
