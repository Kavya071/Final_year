import React, { useState, useEffect } from 'react';
import './CandidateTest.css';
import { useTestManager } from './hooks/useDSAProblems';

const CandidateTest = ({ onNavigate }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const [testInitialized, setTestInitialized] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const {
    testProblems,
    currentQuestion,
    currentQuestionIndex,
    answers,
    testStarted,
    testCompleted,
    loading,
    error,
    startTest,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    submitTest,
    resetTest,
    progress,
    isLastQuestion,
    answeredQuestions,
    totalQuestions,
    // Adaptive scoring properties
    currentDifficulty,
    maxDifficultyReached,
    consecutiveCorrect,
    adaptiveStats,
    currentScore,
    correctAnswers,
    wrongAnswers
  } = useTestManager();

  // Initialize test on component mount
  useEffect(() => {
    const initializeTest = async () => {
      if (!testInitialized && !testStarted) {
        setTestInitialized(true);
        const testConfig = {
          count: 12, // 12 questions for dynamic adaptive test
          startDifficulty: 'Easy', // Start with Easy
          timeLimit: 45 // 45 minutes
        };
        
        const success = await startTest(testConfig);
        if (!success) {
          console.error('Failed to initialize dynamic adaptive test');
        }
      }
    };
    
    initializeTest();
  }, [testInitialized, testStarted, startTest]);

  // Update selected answer when question changes
  useEffect(() => {
    const currentAnswer = answers[currentQuestionIndex];
    setSelectedAnswer(currentAnswer !== undefined ? currentAnswer : null);
  }, [currentQuestionIndex, answers]);

  // Timer countdown effect
  useEffect(() => {
    if (!testStarted || testCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleEndSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer !== null) {
      // Process the answer with dynamic adaptive logic
      await answerQuestion(currentQuestionIndex, selectedAnswer);
      
      const totalAnswered = answeredQuestions + 1;
      
      if (totalAnswered >= 12) { // Complete test after 12 questions
        handleCompleteTest();
      } else {
        // Wait a moment for next question to be generated, then move
        setTimeout(() => {
          nextQuestion();
          setSelectedAnswer(null);
        }, 100);
      }
    }
  };

  const handleCompleteTest = () => {
    const results = submitTest();
    setTestResults(results);
  };

  const handleEndSession = () => {
    const confirmEnd = window.confirm('Are you sure you want to end the test session?');
    if (confirmEnd) {
      if (!testCompleted) {
        const results = submitTest();
        setTestResults(results);
      }
      // Navigate back to dashboard
      if (onNavigate) {
        onNavigate('dashboard');
      }
    }
  };

  const handleBackToHome = () => {
    const confirmLeave = window.confirm('Are you sure you want to leave the test? Your progress will be lost.');
    if (confirmLeave && onNavigate) {
      resetTest();
      onNavigate('dashboard');
    }
  };

  // Loading state
  if (loading || !testStarted) {
    return (
      <div className="test-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading DSA problems from database...</p>
          {error && <p className="error-message">Error: {error}</p>}
        </div>
      </div>
    );
  }

  // Test completed state with adaptive results
  if (testCompleted && testResults) {
    return (
      <div className="test-container">
        <div className="results-container">
          <h1>🎉 Adaptive Test Completed!</h1>
          <div className="results-summary">
            <div className="score-section">
              <h2>Your Final Score: {testResults.totalScore}</h2>
              <p className="score-breakdown">
                ✅ Correct: {testResults.correctCount} (+{testResults.correctCount} points)<br/>
                ❌ Wrong: {testResults.wrongCount} (-{testResults.wrongCount} points)
              </p>
            </div>
            
            <div className="difficulty-section">
              <h3>🏆 Max Difficulty Reached: <span className={`difficulty-badge ${testResults.maxDifficultyReached.toLowerCase()}`}>{testResults.maxDifficultyReached}</span></h3>
              <p>Started at: Easy → Progressed to: {testResults.maxDifficultyReached}</p>
              {testResults.difficultyProgression && (
                <div className="progression-path">
                  <strong>Difficulty Progression:</strong>
                  <div className="progression-badges">
                    {testResults.difficultyProgression.map((diff, index) => (
                      <span key={index} className={`difficulty-badge ${diff.toLowerCase()}`}>
                        {diff}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="stats-section">
              <h3>📊 Performance Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Questions:</span>
                  <span className="stat-value">{testResults.totalQuestions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Success Rate:</span>
                  <span className="stat-value">{Math.round(testResults.successRate)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Final Difficulty:</span>
                  <span className={`stat-value difficulty-${testResults.finalDifficulty?.toLowerCase()}`}>
                    {testResults.finalDifficulty}
                  </span>
                </div>
              </div>
            </div>
            
            <button onClick={() => onNavigate('dashboard')} className="back-dashboard-btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="test-container">
        <div className="error-container">
          <h2>Unable to Load Test</h2>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
          <button onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // No current question available or waiting for next question
  if (!currentQuestion) {
    // Check if we're in the middle of a test and waiting for next question
    if (testStarted && !testCompleted && answeredQuestions < 12) {
      return (
        <div className="test-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating next question based on your performance...</p>
            <p>Current difficulty: {currentDifficulty}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="test-container">
        <div className="error-container">
          <h2>No Questions Available</h2>
          <p>Unable to load test questions. Please try again.</p>
          <button onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="test-container">
      <header className="test-header">
        <h1 className="test-title">Dynamic Adaptive DSA Test</h1>
        <div className="header-actions">
          <button className="back-home-btn" onClick={handleBackToHome}>
            <i className="fas fa-home"></i> Home
          </button>
          <button className="end-session-btn" onClick={handleEndSession}>
            End Session
          </button>
        </div>
      </header>

      <main className="test-main-content">
        <section className="question-area">
          <div className="question-bubble">
            <div className="problem-info">
              <h3>Problem: {currentQuestion.problem.title}</h3>
              <span className={`difficulty-badge ${currentQuestion.problem.difficulty_category.toLowerCase()}`}>
                {currentQuestion.problem.difficulty_category}
              </span>
            </div>
            <p className="question-text">
              {currentQuestion.mcq.question}
            </p>
          </div>
          
          <div className="answer-options">
            {currentQuestion.mcq.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                onClick={() => handleOptionSelect(index)}
              >
                {option}
              </button>
            ))}
          </div>
          
          <div className="actions-bar">
            <button 
              className="prev-btn" 
              disabled={currentQuestionIndex === 0}
              onClick={previousQuestion}
            >
              Previous
            </button>
            <button 
              className="submit-btn" 
              disabled={selectedAnswer === null}
              onClick={handleSubmitAnswer}
            >
              {isLastQuestion ? 'Complete Test' : 'Next Question'}
            </button>
          </div>
        </section>

        <aside className="session-panel">
          <h2 className="panel-title">Dynamic Adaptive Test</h2>
          
          <div className="info-block timer-block">
            <span className="info-label">Time Remaining</span>
            <span className={`info-value ${timeRemaining < 300 ? 'time-warning' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className="info-block progress-block">
            <span className="info-label">Progress</span>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="info-value">
              Question {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>

          <div className="info-block score-block">
            <span className="info-label">Current Score</span>
            <span className={`info-value ${currentScore >= 0 ? 'positive-score' : 'negative-score'}`}>
              {currentScore > 0 ? '+' : ''}{currentScore}
            </span>
          </div>

          <div className="info-block stats-block">
            <span className="info-label">Answered</span>
            <span className="info-value">
              ✅ {correctAnswers} | ❌ {wrongAnswers}
            </span>
          </div>

          <div className="info-block difficulty-block">
            <span className="info-label">Current Difficulty</span>
            <span className={`info-value difficulty-${currentDifficulty?.toLowerCase()}`}>
              {currentDifficulty}
            </span>
          </div>

          <div className="info-block consecutive-block">
            <span className="info-label">Consecutive Correct</span>
            <span className="info-value">{consecutiveCorrect}</span>
            {consecutiveCorrect >= 1 && currentDifficulty !== 'Expert' && (
              <small className="progress-hint">
                2 needed for next level
              </small>
            )}
          </div>

          <div className="info-block max-difficulty-block">
            <span className="info-label">Max Difficulty Reached</span>
            <span className={`info-value difficulty-${maxDifficultyReached?.toLowerCase()}`}>
              {maxDifficultyReached}
            </span>
          </div>

          <div className="info-block source-block">
            <span className="info-label">Source</span>
            <span className="info-value">Enhanced AI MCQ</span>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default CandidateTest;