import { createContext, useContext, useState, useCallback } from 'react';
import lessonsSeed from '../sampleData/lessons_seed.json';

const LessonContext = createContext();

export const LessonProvider = ({ children }) => {
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const loadTodaysLesson = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock API - return first lesson from seed data
      // Later this will be actual API call: await fetch('/api/lessons/today')
      const lesson = lessonsSeed.lessons[0]; // food-polite-01
      setCurrentLesson(lesson);
      setCurrentStepIndex(0);
      setStepResults({});
      console.log('Loaded lesson:', lesson);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentLesson && currentStepIndex < currentLesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentLesson, currentStepIndex]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const recordStepResult = useCallback((stepIndex, result) => {
    setStepResults(prev => ({
      ...prev,
      [stepIndex]: result
    }));
  }, []);

  const completeLesson = useCallback(async () => {
    try {
      const totalScore = Object.values(stepResults).reduce((sum, r) => sum + (r.score || 0), 0);
      const avgScore = totalScore / Object.keys(stepResults).length;

      console.log('Lesson completed:', {
        lesson_id: currentLesson.lesson_id,
        step_results: stepResults,
        overall_score: avgScore
      });

      // Mock API call - later will be actual POST to /api/lessons/complete
      // await fetch('/api/lessons/complete', { method: 'POST', body: JSON.stringify(...) })

      return { success: true, score: avgScore };
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      throw error;
    }
  }, [stepResults, currentLesson]);

  const currentStep = currentLesson?.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentLesson ? currentStepIndex === currentLesson.steps.length - 1 : false;
  const progress = currentLesson ? ((currentStepIndex + 1) / currentLesson.steps.length) * 100 : 0;

  return (
    <LessonContext.Provider value={{
      currentLesson,
      currentStep,
      currentStepIndex,
      stepResults,
      isLoading,
      isFirstStep,
      isLastStep,
      progress,
      loadTodaysLesson,
      nextStep,
      previousStep,
      recordStepResult,
      completeLesson
    }}>
      {children}
    </LessonContext.Provider>
  );
};

export const useLesson = () => {
  const context = useContext(LessonContext);
  if (!context) {
    throw new Error('useLesson must be used within LessonProvider');
  }
  return context;
};
