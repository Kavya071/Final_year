import { useState, useEffect, useCallback } from 'react';
import mongoDBService from '../services/mongoDBService';

/**
 * Custom hook for managing DSA problems from MongoDB
 */
export const useDSAProblems = () => {
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('unknown');

  // Check backend health status
  const checkBackendHealth = useCallback(async () => {
    try {
      const health = await mongoDBService.healthCheck();
      setBackendStatus(health.status === 'OK' ? 'connected' : 'error');
      return health.status === 'OK';
    } catch (error) {
      setBackendStatus('disconnected');
      return false;
    }
  }, []);

  // Load all problems
  const loadProblems = useCallback(async (difficulty = null) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (difficulty) {
        response = await mongoDBService.getProblemsByDifficulty(difficulty);
      } else {
        response = await mongoDBService.getAllProblems();
      }
      
      setProblems(response.data || []);
    } catch (err) {
      setError(`Failed to load problems: ${err.message}`);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load a random problem
  const loadRandomProblem = useCallback(async (difficulty = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mongoDBService.getRandomProblem(difficulty);
      setCurrentProblem(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to load random problem: ${err.message}`);
      setCurrentProblem(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await mongoDBService.getStatistics();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to load statistics: ${err.message}`);
      setStats(null);
      return null;
    }
  }, []);

  // Generate test problems
  const generateTestProblems = useCallback(async (count = 5, difficulty = null, sessionId = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mongoDBService.getTestProblems(count, difficulty, sessionId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(`Failed to generate test problems: ${err.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single test problem with MCQ
  const getTestProblem = useCallback(async (difficulty = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mongoDBService.getTestProblem(difficulty);
      
      if (response.success) {
        setCurrentProblem(response.data);
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      setError(`Failed to get test problem: ${err.message}`);
      setCurrentProblem(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize backend connection on mount
  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  return {
    // State
    problems,
    currentProblem,
    stats,
    loading,
    error,
    backendStatus,
    
    // Actions
    loadProblems,
    loadRandomProblem,
    loadStats,
    generateTestProblems,
    getTestProblem,
    checkBackendHealth,
    
    // Utilities
    clearError: () => setError(null),
    clearProblems: () => setProblems([]),
    clearCurrentProblem: () => setCurrentProblem(null)
  };
};

/**
 * Custom hook for adaptive test management with difficulty progression
 */
export const useTestManager = () => {
  const [testProblems, setTestProblems] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [testConfig, setTestConfig] = useState({
    count: 10,
    startDifficulty: 'Easy',
    timeLimit: 30 // minutes
  });
  
  // Adaptive scoring state
  const [currentDifficulty, setCurrentDifficulty] = useState('Easy');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [maxDifficultyReached, setMaxDifficultyReached] = useState('Easy');
  const [scoreHistory, setScoreHistory] = useState([]);
  const [adaptiveStats, setAdaptiveStats] = useState({
    totalScore: 0,
    correctCount: 0,
    wrongCount: 0,
    difficultyProgression: ['Easy']
  });

  const { generateTestProblems, loading, error } = useDSAProblems();

  // Difficulty levels in order
  const difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert'];
  
  // Get next difficulty level
  const getNextDifficulty = useCallback((current) => {
    const currentIndex = difficultyLevels.indexOf(current);
    return currentIndex < difficultyLevels.length - 1 ? difficultyLevels[currentIndex + 1] : current;
  }, []);

  // Check if difficulty should be increased (2 consecutive correct)
  const shouldIncreaseDifficulty = useCallback((consecutiveCount, difficulty) => {
    return consecutiveCount >= 2 && getNextDifficulty(difficulty) !== difficulty;
  }, [getNextDifficulty]);

  // Get previous difficulty level for moving down
  const getPreviousDifficulty = useCallback((current) => {
    const currentIndex = difficultyLevels.indexOf(current);
    return currentIndex > 0 ? difficultyLevels[currentIndex - 1] : current;
  }, []);

  // Generate single problem for current difficulty
  const generateSingleProblem = useCallback(async (difficulty) => {
    const problems = await generateTestProblems(1, difficulty, sessionId);
    return problems[0] || null;
  }, [generateTestProblems, sessionId]);

  // Create a new session for question tracking
  const createSession = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
        return data.session_id;
      }
    } catch (error) {
      console.warn('Failed to create session:', error);
    }
    return null;
  }, []);

  // Start adaptive test
  const startTest = useCallback(async (config = testConfig) => {
    setTestConfig(config);
    setTestStarted(true);
    setTestCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    
    // Create a new session for question tracking
    const newSessionId = await createSession();
    
    // Initialize adaptive state
    const startDiff = config.startDifficulty || 'Easy';
    setCurrentDifficulty(startDiff);
    setMaxDifficultyReached(startDiff);
    setConsecutiveCorrect(0);
    setScoreHistory([]);
    setAdaptiveStats({
      totalScore: 0,
      correctCount: 0,
      wrongCount: 0,
      difficultyProgression: [startDiff]
    });
    
    // Start with first problem only - we'll generate more as needed
    const firstProblem = await generateSingleProblem(startDiff);
    setTestProblems(firstProblem ? [firstProblem] : []);
    
    return firstProblem !== null;
  }, [generateSingleProblem, testConfig, createSession]);

  // Answer a question with dynamic adaptive logic
  const answerQuestion = useCallback(async (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));

    const currentProblem = testProblems[questionIndex];
    // Fix: Compare selected answer text with correct answer text
    const selectedAnswerText = currentProblem.mcq.options[answerIndex];
    const correctAnswerText = currentProblem.mcq.correctAnswer;
    const isCorrect = selectedAnswerText === correctAnswerText;
    const scoreChange = isCorrect ? 1 : -1;
    
    console.log(`Question ${questionIndex}: Selected "${selectedAnswerText}", Correct "${correctAnswerText}", IsCorrect: ${isCorrect}`);
    
    // Update score history
    setScoreHistory(prev => [...prev, {
      questionIndex,
      isCorrect,
      scoreChange,
      difficulty: currentDifficulty,
      timestamp: new Date()
    }]);

    // Update adaptive stats
    setAdaptiveStats(prev => ({
      ...prev,
      totalScore: prev.totalScore + scoreChange,
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      wrongCount: prev.wrongCount + (isCorrect ? 0 : 1)
    }));

    let newDifficulty = currentDifficulty;
    let newConsecutiveCount = consecutiveCorrect;

    if (isCorrect) {
      // Increment consecutive correct count
      newConsecutiveCount = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutiveCount);
      
      // Check if we should increase difficulty (2 consecutive correct)
      if (shouldIncreaseDifficulty(newConsecutiveCount, currentDifficulty)) {
        newDifficulty = getNextDifficulty(currentDifficulty);
        setCurrentDifficulty(newDifficulty);
        setMaxDifficultyReached(prev => {
          const maxIndex = difficultyLevels.indexOf(prev);
          const newIndex = difficultyLevels.indexOf(newDifficulty);
          return newIndex > maxIndex ? newDifficulty : prev;
        });
        setConsecutiveCorrect(0); // Reset consecutive count
        newConsecutiveCount = 0;
        
        // Update difficulty progression
        setAdaptiveStats(prev => ({
          ...prev,
          difficultyProgression: [...prev.difficultyProgression, newDifficulty]
        }));
        
        console.log(`🎉 Difficulty increased to ${newDifficulty} after 2 consecutive correct answers!`);
      }
    } else {
      // Wrong answer - reset consecutive count and potentially decrease difficulty
      setConsecutiveCorrect(0);
      newConsecutiveCount = 0;
      
      // Decrease difficulty if not already at Easy
      if (currentDifficulty !== 'Easy') {
        newDifficulty = getPreviousDifficulty(currentDifficulty);
        setCurrentDifficulty(newDifficulty);
        
        // Update difficulty progression
        setAdaptiveStats(prev => ({
          ...prev,
          difficultyProgression: [...prev.difficultyProgression, newDifficulty]
        }));
        
        console.log(`📉 Difficulty decreased to ${newDifficulty} after wrong answer`);
      } else {
        console.log(`📌 Staying at Easy difficulty after wrong answer`);
      }
    }

    // Generate next problem with the (potentially new) difficulty
    const nextProblem = await generateSingleProblem(newDifficulty);
    if (nextProblem) {
      setTestProblems(prev => [...prev, nextProblem]);
      console.log(`📝 Generated next question at ${newDifficulty} difficulty. Total questions: ${testProblems.length + 1}`);
    } else {
      console.error('Failed to generate next question');
    }

  }, [testProblems, currentDifficulty, consecutiveCorrect, shouldIncreaseDifficulty, getNextDifficulty, getPreviousDifficulty, generateSingleProblem, difficultyLevels]);

  // Navigate to next question
  const nextQuestion = useCallback(() => {
    const totalAnswered = Object.keys(answers).length;
    
    // Move to next question if available, otherwise wait for it to be generated
    if (currentQuestionIndex < testProblems.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (totalAnswered < testConfig.count) {
      // Move to the newly generated question
      setCurrentQuestionIndex(testProblems.length - 1);
    } else {
      // We've answered enough questions, complete the test
      setTestCompleted(true);
    }
  }, [currentQuestionIndex, testProblems.length, answers, testConfig.count]);

  // Navigate to previous question
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Submit test with adaptive scoring
  const submitTest = useCallback(() => {
    setTestCompleted(true);
    
    // Calculate final adaptive results
    const finalResults = {
      ...adaptiveStats,
      totalQuestions: Object.keys(answers).length,
      maxDifficultyReached,
      finalDifficulty: currentDifficulty,
      scoreHistory,
      difficultyProgression: adaptiveStats.difficultyProgression,
      averageScore: adaptiveStats.totalScore / Math.max(Object.keys(answers).length, 1),
      successRate: (adaptiveStats.correctCount / Math.max(Object.keys(answers).length, 1)) * 100,
      answers,
      problems: testProblems
    };
    
    return finalResults;
  }, [adaptiveStats, maxDifficultyReached, currentDifficulty, scoreHistory, answers, testProblems]);

  // Reset test state
  const resetTest = useCallback(() => {
    setTestProblems([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentDifficulty('Easy');
    setMaxDifficultyReached('Easy');
    setConsecutiveCorrect(0);
    setScoreHistory([]);
    setAdaptiveStats({
      totalScore: 0,
      correctCount: 0,
      wrongCount: 0,
      difficultyProgression: ['Easy']
    });
  }, []);

  // Get current question
  const currentQuestion = testProblems[currentQuestionIndex] || null;

  return {
    // Test state
    testProblems,
    currentQuestion,
    currentQuestionIndex,
    answers,
    testStarted,
    testCompleted,
    testConfig,
    loading,
    error,
    
    // Adaptive state
    currentDifficulty,
    maxDifficultyReached,
    consecutiveCorrect,
    adaptiveStats,
    scoreHistory,
    
    // Test actions
    startTest,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitTest,
    resetTest,
    setTestConfig,
    
    // Computed values
    progress: testConfig.count > 0 ? ((currentQuestionIndex + 1) / testConfig.count) * 100 : 0,
    isLastQuestion: (currentQuestionIndex + 1) >= testConfig.count,
    isFirstQuestion: currentQuestionIndex === 0,
    answeredQuestions: Object.keys(answers).length,
    totalQuestions: testConfig.count, // Show planned total, not current array length
    currentScore: adaptiveStats.totalScore,
    correctAnswers: adaptiveStats.correctCount,
    wrongAnswers: adaptiveStats.wrongCount
  };
};

export default useDSAProblems;