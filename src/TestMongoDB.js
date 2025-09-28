import React, { useState, useEffect } from 'react';
import { useDSAProblems } from './hooks/useDSAProblems';

const TestMongoDB = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { 
    stats, 
    backendStatus, 
    loadStats, 
    checkBackendHealth, 
    loadRandomProblem, 
    currentProblem,
    error 
  } = useDSAProblems();

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    // Test 1: Backend Health Check
    try {
      const healthCheck = await checkBackendHealth();
      results.healthCheck = {
        success: true,
        status: backendStatus,
        message: 'Backend health check passed'
      };
    } catch (err) {
      results.healthCheck = {
        success: false,
        error: err.message
      };
    }

    // Test 2: Load Stats
    try {
      const statsData = await loadStats();
      results.statsLoad = {
        success: true,
        data: statsData,
        message: 'Stats loaded successfully'
      };
    } catch (err) {
      results.statsLoad = {
        success: false,
        error: err.message
      };
    }

    // Test 3: Load Random Problem
    try {
      const problem = await loadRandomProblem();
      results.randomProblem = {
        success: true,
        data: problem,
        message: 'Random problem loaded successfully'
      };
    } catch (err) {
      results.randomProblem = {
        success: false,
        error: err.message
      };
    }

    setTestResults(results);
    setLoading(false);
  };

  const TestResult = ({ title, result }) => (
    <div className={`test-result ${result?.success ? 'success' : 'error'}`}>
      <h3>{title}</h3>
      <div className="status">
        {result?.success ? '✅ PASS' : '❌ FAIL'}
      </div>
      {result?.message && <p className="message">{result.message}</p>}
      {result?.error && <p className="error-msg">Error: {result.error}</p>}
      {result?.data && (
        <details>
          <summary>View Data</summary>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </details>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>MongoDB Integration Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Connection Status: 
          <span style={{ 
            color: backendStatus === 'connected' ? 'green' : 'red',
            marginLeft: '0.5rem'
          }}>
            {backendStatus === 'connected' ? '🟢 Connected' : 
             backendStatus === 'disconnected' ? '🔴 Disconnected' : 
             backendStatus === 'error' ? '⚠️ Error' : '⚪ Unknown'}
          </span>
        </h2>
        
        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '1rem', 
            borderRadius: '5px',
            marginTop: '1rem' 
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          background: '#007bff',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '2rem'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Tests Again'}
      </button>

      {loading && <div>🔄 Running tests...</div>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        <TestResult 
          title="1. Backend Health Check" 
          result={testResults.healthCheck} 
        />
        <TestResult 
          title="2. Database Statistics" 
          result={testResults.statsLoad} 
        />
        <TestResult 
          title="3. Random Problem Loading" 
          result={testResults.randomProblem} 
        />
      </div>

      {stats && (
        <div style={{ 
          marginTop: '2rem', 
          background: '#e8f5e8', 
          padding: '1.5rem', 
          borderRadius: '8px' 
        }}>
          <h3>Database Overview</h3>
          <p><strong>Total Problems:</strong> {stats.totalProblems}</p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <strong>Easy:</strong> {stats.difficultyDistribution?.Easy || 0}
            </div>
            <div>
              <strong>Medium:</strong> {stats.difficultyDistribution?.Medium || 0}
            </div>
            <div>
              <strong>Hard:</strong> {stats.difficultyDistribution?.Hard || 0}
            </div>
          </div>
        </div>
      )}

      {currentProblem && (
        <div style={{ 
          marginTop: '2rem', 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '8px' 
        }}>
          <h3>Sample Problem</h3>
          <p><strong>Title:</strong> {currentProblem.title}</p>
          <p><strong>Difficulty:</strong> {currentProblem.difficulty_category}</p>
          <p><strong>Source:</strong> DeepMind Code Contests</p>
        </div>
      )}

      <style jsx>{`
        .test-result {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
        }
        
        .test-result.success {
          border-left: 4px solid #28a745;
          background: #f8fff9;
        }
        
        .test-result.error {
          border-left: 4px solid #dc3545;
          background: #fff8f8;
        }
        
        .status {
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        .message {
          color: #28a745;
          margin: 0.5rem 0;
        }
        
        .error-msg {
          color: #dc3545;
          margin: 0.5rem 0;
        }
        
        details {
          margin-top: 1rem;
        }
        
        summary {
          cursor: pointer;
          color: #007bff;
          font-weight: 500;
        }
        
        pre {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default TestMongoDB;