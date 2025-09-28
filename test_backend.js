// Simple test to check backend connectivity
const testBackend = async () => {
    console.log('Testing backend connectivity...');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch('http://localhost:5000/api/health');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        // Test random problem endpoint
        const problemResponse = await fetch('http://localhost:5000/api/problems/random');
        const problemData = await problemResponse.json();
        console.log('Random problem:', problemData);
        
        // Test stats endpoint
        const statsResponse = await fetch('http://localhost:5000/api/stats');
        const statsData = await statsResponse.json();
        console.log('Stats:', statsData);
        
    } catch (error) {
        console.error('Backend test failed:', error);
    }
};

// Run the test
testBackend();