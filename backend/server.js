const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = "mongodb+srv://bhardwajkavya099_db_user:Gfq88i5GvO3WzcRG@cluster0.jx5vysg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = 'prepai_db';
const COLLECTION_NAME = 'dsa_problems';

let db = null;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

// Advanced MCQ Generator with session-based variety and intelligent pattern detection
function generateIntelligentMCQ(problem, sessionId = null) {
    const title = problem.title || problem.name || 'Unknown Problem';
    const problemName = (problem.name || problem.title || '').toLowerCase();
    const difficulty = problem.difficulty_category || 'Medium';
    
    // Generate unique seed that ensures different questions for same problem across sessions
    const baseSeed = hashCode(problemName + title);
    const sessionSeed = sessionId ? hashCode(sessionId) : 0;
    const randomSalt = Math.floor(Math.random() * 1000); // Add true randomness
    const combinedSeed = baseSeed + sessionSeed + randomSalt;
    
    // All possible question variants for maximum variety
    const allQuestionTypes = [];
    
    // === SPECIFIC PROBLEM PATTERN DETECTION ===
    
    // Chandu problems - relationship/optimization themes
    if (problemName.includes('chandu')) {
        allQuestionTypes.push({
            question: `"${title}": Chandu faces a scheduling problem with N time slots (1 ≤ N ≤ 5000) and M events (1 ≤ M ≤ 10000). Each event has start time, end time, and priority. He wants to maximize total priority of non-overlapping events. Which approach works best?`,
            options: ['Weighted Activity Selection (DP)', 'Sort by priority only', 'Greedy by start time', 'Random selection'],
            correctAnswer: 'Weighted Activity Selection (DP)',
            explanation: 'Weighted activity selection requires DP when priorities are involved. Sort by end time, then use DP to find optimal subset.',
            metadata: { type: 'scheduling', variant: 'A' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}", Chandu needs to form optimal pairs from 2N people (1 ≤ N ≤ 1000). Each person has compatibility scores with others (1 ≤ score ≤ 100). Find maximum total compatibility. Time limit: 2 seconds. What's needed?`,
            options: ['Maximum Weight Perfect Matching', 'Simple pairing by index', 'Sort by individual scores', 'Random pairing'],
            correctAnswer: 'Maximum Weight Perfect Matching',
            explanation: 'Perfect matching in weighted graphs. Use Hungarian algorithm O(N³) or min-cost max-flow for optimal pairing.',
            metadata: { type: 'matching', variant: 'B' }
        });
        
        allQuestionTypes.push({
            question: `"${title}": Chandu arranges T dates (1 ≤ T ≤ 50), each with start Si, end Ei (1 ≤ Si < Ei ≤ 1440). Maximize non-overlapping dates. What's the greedy strategy?`,
            options: ['Sort by end time, select greedily', 'Sort by start time', 'Sort by duration', 'Select randomly'],
            correctAnswer: 'Sort by end time, select greedily',
            explanation: 'Activity selection: always pick the activity that finishes earliest among remaining choices.',
            metadata: { type: 'greedy', variant: 'C' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}", Chandu has N gifts (1 ≤ N ≤ 1000) with values V[i] and weights W[i]. His bag capacity is C. Maximize gift value. This is which problem type?`,
            options: ['0/1 Knapsack Problem', 'Fractional Knapsack', 'Subset Sum', 'Coin Change'],
            correctAnswer: '0/1 Knapsack Problem',
            explanation: 'Cannot take fractional gifts, so it\'s 0/1 knapsack. Use DP with states dp[item][capacity].',
            metadata: { type: 'knapsack', variant: 'D' }
        });
        
        allQuestionTypes.push({
            question: `"${title}": Chandu wants to distribute N items among K people fairly. Each item has value V[i]. Goal: minimize the maximum sum any person gets. What technique?`,
            options: ['Binary search on answer', 'Dynamic programming', 'Greedy assignment', 'Sort items only'],
            correctAnswer: 'Binary search on answer',
            explanation: 'Classic load balancing problem. Binary search on the maximum load, then greedily check if assignment is possible.',
            metadata: { type: 'binary_search', variant: 'E' }
        });
    }
    
    // Appu problems - farm/grid themes with much more variety
    if (problemName.includes('appu')) {
        allQuestionTypes.push({
            question: `"${title}": Appu's farm is a grid of R×C cells (1 ≤ R,C ≤ 300). Each cell has value V[i][j] (-1000 ≤ V[i][j] ≤ 1000). He can choose any rectangular subregion. Goal: maximize sum of chosen region. Which technique?`,
            options: ['2D Kadane Algorithm', 'Check every possible rectangle', 'Greedy largest values first', 'Dynamic programming on rows'],
            correctAnswer: '2D Kadane Algorithm',
            explanation: '2D maximum subarray problem. Fix top and bottom rows, then apply 1D Kadane on column sums. O(R²C) complexity.',
            metadata: { type: 'grid_optimization', variant: 'A' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}", Appu plants crops in N fields (1 ≤ N ≤ 1000). Field i gives profit P[i] but requires investment I[i]. He has budget B (1 ≤ B ≤ 10⁶). Maximize profit within budget. This is?`,
            options: ['0/1 Knapsack Problem', 'Fractional Knapsack', 'Simple sorting', 'Greedy by profit'],
            correctAnswer: '0/1 Knapsack Problem',
            explanation: 'Cannot partially invest in fields, so it\'s 0/1 knapsack. Use DP: dp[i][w] = max profit using first i items with weight ≤ w.',
            metadata: { type: 'optimization', variant: 'B' }
        });
        
        allQuestionTypes.push({
            question: `"${title}": Appu has grid with obstacles. He starts at (0,0) and wants to reach (R-1,C-1). Can only move right or down. How many distinct paths exist?`,
            options: ['Dynamic Programming paths[i][j]', 'BFS to count paths', 'DFS with backtracking', 'Mathematical formula only'],
            correctAnswer: 'Dynamic Programming paths[i][j]',
            explanation: 'Classic path counting: paths[i][j] = paths[i-1][j] + paths[i][j-1] if cell is free, 0 if obstacle.',
            metadata: { type: 'path_counting', variant: 'C' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}", Appu wants to water N plants arranged in a line. Each plant needs water[i] amount. He has a watering can of capacity C. How many trips to refill are needed minimum?`,
            options: ['Greedy: water until can is empty', 'Dynamic programming on segments', 'Binary search on trips', 'Sort plants by water needed'],
            correctAnswer: 'Greedy: water until can is empty',
            explanation: 'Greedy approach: water plants in order, refill when can cannot water the next plant. This minimizes refill trips.',
            metadata: { type: 'greedy_watering', variant: 'D' }
        });
        
        allQuestionTypes.push({
            question: `"${title}": Appu's farm has N plots, each with yield Y[i] and cost C[i]. He can choose at most K plots. Maximize total yield - total cost. What approach?`,
            options: ['Sort by (yield - cost), pick top K', 'Dynamic programming with K constraint', 'Greedy by yield only', 'Try all combinations'],
            correctAnswer: 'Sort by (yield - cost), pick top K',
            explanation: 'Since we want to maximize (total yield - total cost), sort plots by individual (yield - cost) and pick top K.',
            metadata: { type: 'profit_optimization', variant: 'E' }
        });
    }
    
    // MUCH MORE GENERIC PATTERNS WITH VARIETY
    
    // For any problem with "minimum" or "maximum" in name
    if (problemName.includes('minimum') || problemName.includes('maximum') || problemName.includes('min') || problemName.includes('max')) {
        allQuestionTypes.push({
            question: `"${title}": This optimization problem likely involves finding the best solution among many possibilities. When dealing with optimization problems in competitive programming, what's typically the first step?`,
            options: ['Identify if it\'s greedy or DP', 'Start coding immediately', 'Use brute force always', 'Apply sorting first'],
            correctAnswer: 'Identify if it\'s greedy or DP',
            explanation: 'Optimization problems are usually either greedy (locally optimal choices work) or DP (need to consider multiple subproblems).',
            metadata: { type: 'optimization_strategy', variant: 'A' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}", you need to find an optimal value. The constraints suggest N ≤ 10⁵. What time complexity should you target?`,
            options: ['O(N) or O(N log N)', 'O(N²) is acceptable', 'O(N³) works fine', 'Complexity doesn\'t matter'],
            correctAnswer: 'O(N) or O(N log N)',
            explanation: 'For N ≤ 10⁵, aim for O(N) or O(N log N). O(N²) = 10¹⁰ operations may timeout in competitive programming.',
            metadata: { type: 'complexity_analysis', variant: 'B' }
        });
    }
    
    // Problems with numbers/digits
    if (problemName.includes('integer') || problemName.includes('number') || problemName.includes('digit')) {
        allQuestionTypes.push({
            question: `"${title}": This appears to be a number theory or digit manipulation problem. Such problems often require which mathematical concept?`,
            options: ['Modular arithmetic and digit extraction', 'Only basic addition', 'String processing mainly', 'Graph algorithms'],
            correctAnswer: 'Modular arithmetic and digit extraction',
            explanation: 'Number problems frequently use modular arithmetic for large numbers and digit extraction techniques.',
            metadata: { type: 'number_theory', variant: 'A' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}", if you need to process large integers (up to 10¹⁸), what should you be careful about?`,
            options: ['Integer overflow and precision', 'Only memory usage', 'Just time complexity', 'Variable naming'],
            correctAnswer: 'Integer overflow and precision',
            explanation: 'Large integers require careful handling of overflow. Use long long in C++ or appropriate data types.',
            metadata: { type: 'large_numbers', variant: 'B' }
        });
    }
    
    // Add many more generic patterns...
    
    // === DIFFICULTY-BASED EXPERT AND ADVANCED QUESTIONS ===
    
    if (difficulty === 'Expert') {
        allQuestionTypes.push({
            question: `"${title}" (Expert): Expert problems often involve advanced mathematical insights. For problems like "Cycle Sort", what's the key approach?`,
            options: ['Deep mathematical analysis and proof techniques', 'Trial and error with optimizations', 'Using complex data structures only', 'Implementing multiple algorithms'],
            correctAnswer: 'Deep mathematical analysis and proof techniques',
            explanation: 'Expert problems require rigorous mathematical thinking and ability to prove solution correctness.',
            metadata: { type: 'expert_mathematical', variant: 'A' }
        });
        
        allQuestionTypes.push({
            question: `"${title}" (Expert): This advanced problem likely requires optimal complexity with tight constraints. What distinguishes Expert-level solutions?`,
            options: ['Elegant algorithms with mathematical insights', 'Complex implementation with many edge cases', 'Using the latest language features', 'Longest possible code with all optimizations'],
            correctAnswer: 'Elegant algorithms with mathematical insights',
            explanation: 'Expert problems demand both optimal time complexity and deep understanding of underlying mathematical structures.',
            metadata: { type: 'expert_elegance', variant: 'B' }
        });
        
        allQuestionTypes.push({
            question: `In "${title}" (Expert): Advanced competitive programming requires synthesis of multiple concepts. What's most critical for Expert problems?`,
            options: ['Combining algorithms with mathematical theory', 'Fast implementation speed', 'Memorizing solution templates', 'Using advanced IDEs'],
            correctAnswer: 'Combining algorithms with mathematical theory',
            explanation: 'Expert problems test ability to synthesize algorithmic techniques with mathematical insights.',
            metadata: { type: 'expert_synthesis', variant: 'C' }
        });
    }
    
    if (difficulty === 'Hard') {
        allQuestionTypes.push({
            question: `"${title}" (Hard): Hard problems typically have N ≤ 10⁵ with strict time limits. Which complexity is usually required?`,
            options: ['O(N log N) or O(N√N) maximum', 'O(N²) is generally acceptable', 'O(N³) with constant optimization', 'Exponential with heavy pruning'],
            correctAnswer: 'O(N log N) or O(N√N) maximum',
            explanation: 'Hard problems with large N require efficient algorithms. O(N²) = 10¹⁰ operations typically exceeds time limits.',
            metadata: { type: 'hard_complexity', variant: 'A' }
        });
        
        allQuestionTypes.push({
            question: `"${title}" (Hard): This problem likely involves advanced techniques like segment trees, DP optimization, or graph algorithms. Success depends on?`,
            options: ['Recognizing which advanced pattern applies', 'Implementing the first reasonable approach', 'Using the most complex available algorithm', 'Trying multiple random strategies'],
            correctAnswer: 'Recognizing which advanced pattern applies',
            explanation: 'Hard problems require pattern recognition to identify the specific advanced algorithmic technique needed.',
            metadata: { type: 'hard_recognition', variant: 'B' }
        });
    }
    
    if (difficulty === 'Medium') {
        allQuestionTypes.push({
            question: `"${title}" (Medium): Medium problems balance algorithmic knowledge with implementation skill. What's typically the focus?`,
            options: ['Standard algorithms with careful edge case handling', 'Advanced mathematical proofs', 'Complex data structures in all cases', 'Approximation algorithms'],
            correctAnswer: 'Standard algorithms with careful edge case handling',
            explanation: 'Medium problems test your ability to correctly implement known algorithms and handle various edge cases.',
            metadata: { type: 'medium_implementation', variant: 'A' }
        });
    }
    
    if (difficulty === 'Easy') {
        allQuestionTypes.push({
            question: `"${title}" (Easy): Easy problems focus on basic algorithmic thinking. With typical N ≤ 1000, what complexity is usually acceptable?`,
            options: ['O(N²) implementations are often intended', 'Must always be O(N log N)', 'O(N³) is the target complexity', 'Only O(N) solutions are accepted'],
            correctAnswer: 'O(N²) implementations are often intended',
            explanation: 'Easy problems with small constraints often expect and accept O(N²) solutions to test basic algorithm implementation.',
            metadata: { type: 'easy_approach', variant: 'A' }
        });
    }
    
    // Default variety pool - MUCH LARGER
    const defaultQuestions = [
        {
            question: `"${title}" (${difficulty}): This problem requires algorithmic thinking. What's the most systematic approach to tackle any competitive programming problem?`,
            options: ['Read constraints, identify pattern, choose algorithm', 'Guess the solution type', 'Start with brute force always', 'Copy similar solutions'],
            correctAnswer: 'Read constraints, identify pattern, choose algorithm',
            explanation: 'Success in competitive programming comes from systematic analysis: understand constraints → identify pattern → select appropriate algorithm.',
            metadata: { type: 'systematic_approach', variant: 'A' }
        },
        {
            question: `For "${title}" (${difficulty}), the key to efficient solution is understanding the problem constraints. What do constraints primarily help determine?`,
            options: ['Required time and space complexity', 'Programming language choice', 'Variable names to use', 'Output format'],
            correctAnswer: 'Required time and space complexity',
            explanation: 'Constraints tell you the input size, which determines what algorithms are feasible within time and memory limits.',
            metadata: { type: 'constraint_analysis', variant: 'B' }
        },
        {
            question: `"${title}" (${difficulty}): When approaching this problem, what should influence your algorithm choice most?`,
            options: ['Input size and time limits', 'Personal coding style', 'Shortest code possible', 'Most complex algorithm'],
            correctAnswer: 'Input size and time limits',
            explanation: 'Algorithm selection should primarily be based on whether it can handle the input size within time limits.',
            metadata: { type: 'algorithm_selection', variant: 'C' }
        },
        {
            question: `In "${title}" (${difficulty}), if the solution times out, what's the most likely issue?`,
            options: ['Algorithm complexity too high for constraints', 'Wrong programming language', 'Too many variables', 'Incorrect output format'],
            correctAnswer: 'Algorithm complexity too high for constraints',
            explanation: 'Timeouts usually indicate that the algorithm\'s time complexity is too high for the given input constraints.',
            metadata: { type: 'debugging_timeout', variant: 'D' }
        },
        {
            question: `"${title}" (${difficulty}): This problem type typically requires which fundamental skill in competitive programming?`,
            options: ['Pattern recognition and algorithm mapping', 'Advanced mathematics only', 'Complex data structures only', 'Memorizing code templates'],
            correctAnswer: 'Pattern recognition and algorithm mapping',
            explanation: 'Success comes from recognizing which standard algorithmic pattern fits the problem and applying the appropriate solution.',
            metadata: { type: 'pattern_recognition', variant: 'E' }
        },
        {
            question: `For "${title}" (${difficulty}), what's the best strategy when you're unsure about the optimal approach?`,
            options: ['Analyze examples and edge cases', 'Implement the first idea', 'Skip to next problem', 'Use random approach'],
            correctAnswer: 'Analyze examples and edge cases',
            explanation: 'Working through examples and edge cases helps understand the problem pattern and guides algorithm selection.',
            metadata: { type: 'problem_solving', variant: 'F' }
        }
    ];
    
    // Add default questions to the pool
    allQuestionTypes.push(...defaultQuestions);
    
    // === IMPROVED SELECTION LOGIC WITH PATTERN PRIORITY ===
    
    // Prioritize specific patterns over generic questions
    let availableQuestions = [];
    
    // First, collect all pattern-specific questions (exclude generic fallbacks)
    if (problemName.includes('chandu') || problemName.includes('appu') || 
        problemName.includes('bracket') || problemName.includes('brck') ||
        problemName.includes('trip') || problemName.includes('tree') ||
        problemName.includes('minimum') || problemName.includes('maximum')) {
        
        // Find pattern-specific questions only
        availableQuestions = allQuestionTypes.filter(q => 
            q.metadata.type !== 'systematic_approach' &&
            q.metadata.type !== 'constraint_analysis' &&
            q.metadata.type !== 'algorithm_selection' &&
            q.metadata.type !== 'debugging_timeout' &&
            q.metadata.type !== 'pattern_recognition' &&
            q.metadata.type !== 'problem_solving'
        );
    }
    
    // If no specific patterns found, use all questions
    if (availableQuestions.length === 0) {
        availableQuestions = allQuestionTypes;
    }
    
    // Use improved seed with true randomness for variety
    const selectedIndex = Math.abs(combinedSeed) % availableQuestions.length;
    const selectedQuestion = availableQuestions[selectedIndex];
    
    // Add some session-specific information to the metadata
    selectedQuestion.metadata.sessionId = sessionId;
    selectedQuestion.metadata.selectionSeed = combinedSeed;
    selectedQuestion.metadata.availableCount = availableQuestions.length;
    
    return selectedQuestion;
}

// Simple hash function for consistent randomization per problem + session
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'PrepAI Intelligent Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Create session endpoint for adaptive testing
app.post('/api/create-session', (req, res) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`✅ Created session: ${sessionId}`);
    res.json({ 
        success: true,
        session_id: sessionId,
        created_at: new Date().toISOString(),
        status: 'active'
    });
});

// Get all problems
app.get('/api/problems', async (req, res) => {
    try {
        const problems = await db.collection(COLLECTION_NAME).find({}).limit(100).toArray();
        res.json({
            success: true,
            count: problems.length,
            data: problems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch problems',
            error: error.message
        });
    }
});

// INTELLIGENT MCQ GENERATION ENDPOINT - THE MAIN SOLUTION
app.get('/api/intelligent/generate-test', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;
        const difficulty = req.query.difficulty;
        const sessionId = req.query.sessionId || null;
        
        console.log(`🧠 Generating ${count} intelligent MCQs with full problem context...`);
        
        // Get problems from database
        let query = {};
        if (difficulty) {
            query.difficulty_category = difficulty;
        }
        
        const problems = await db.collection(COLLECTION_NAME)
            .find(query)
            .limit(count * 2)
            .toArray();
            
        if (problems.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No problems found in database'
            });
        }
        
        // Generate contextual MCQs with full explanations
        const shuffled = problems.sort(() => 0.5 - Math.random());
        const selectedProblems = shuffled.slice(0, count);
        
        const testProblems = selectedProblems.map((problem, index) => {
            const mcq = generateIntelligentMCQ(problem, sessionId);
            
            return {
                problem: problem,
                mcq: mcq,
                metadata: {
                    difficulty: problem.difficulty_category || 'Medium',
                    problemTitle: problem.title || problem.name || `Problem ${index + 1}`,
                    generatedAt: new Date().toISOString(),
                    index: index,
                    questionType: 'intelligent_contextual',
                    sessionId: sessionId
                }
            };
        });
        
        console.log(`✅ Generated ${testProblems.length} intelligent test problems with full context`);
        
        res.json({
            success: true,
            count: testProblems.length,
            data: testProblems,
            metadata: {
                generatedAt: new Date().toISOString(),
                sessionId: sessionId,
                type: 'intelligent_contextual_test'
            }
        });
        
    } catch (error) {
        console.error('❌ Error generating intelligent test:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate intelligent test',
            error: error.message
        });
    }
});

// Start server
async function startServer() {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 PrepAI Intelligent Backend running on http://localhost:${PORT}`);
        console.log(`📊 Available Endpoints:`);
        console.log(`   GET /api/health - Health check`);
        console.log(`   POST /api/create-session - Create adaptive test session`);
        console.log(`   GET /api/problems - Get all problems`);
        console.log(`   🧠 GET /api/intelligent/generate-test?count=5 - Generate contextual MCQs`);
        console.log(`   🎯 This endpoint generates questions with FULL problem descriptions!`);
    });
}

startServer().catch(console.error);