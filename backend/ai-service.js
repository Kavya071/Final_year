// AI Service for Dynamic MCQ Generation using Ollama
const axios = require('axios');

class AIService {
    constructor() {
        this.ollamaUrl = 'http://localhost:11434/api/generate';
        this.model = 'llama3.1:8b'; // Free local model
    }

    async generateMCQ(problem) {
        const prompt = this.createPrompt(problem);
        
        try {
            const response = await axios.post(this.ollamaUrl, {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            });

            const aiResponse = response.data.response;
            return this.parseMCQFromResponse(aiResponse);
        } catch (error) {
            console.error('AI generation failed:', error.message);
            return this.getFallbackMCQ(problem);
        }
    }

    createPrompt(problem) {
        const title = problem.title || problem.name || 'Unknown Problem';
        const description = problem.description || 'No description available';
        const difficulty = problem.difficulty_category || 'Medium';

        return `
Generate a multiple-choice question for this coding problem:

**Problem:** ${title}
**Difficulty:** ${difficulty}
**Description:** ${description.substring(0, 500)}...

Create a technical MCQ that tests algorithmic understanding. Format your response as JSON:

{
  "question": "What is the optimal approach for this problem?",
  "options": [
    "Option A with specific algorithm",
    "Option B with different approach", 
    "Option C with alternative method",
    "Option D with incorrect approach"
  ],
  "correct_answer": "Option A with specific algorithm",
  "explanation": "Detailed explanation of why this approach is correct and others are wrong."
}

Focus on:
- Time/space complexity analysis
- Specific algorithms (DP, Greedy, Graph, etc.)
- Implementation details
- Common pitfalls

Generate a challenging but fair question for ${difficulty} level.
`;
    }

    parseMCQFromResponse(aiResponse) {
        try {
            // Try to extract JSON from AI response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const mcqData = JSON.parse(jsonMatch[0]);
                
                // Validate required fields
                if (mcqData.question && mcqData.options && mcqData.correct_answer) {
                    return {
                        success: true,
                        mcq: {
                            question: mcqData.question,
                            options: mcqData.options,
                            correctAnswer: mcqData.correct_answer,
                            explanation: mcqData.explanation || 'No explanation provided',
                            generator: 'AI-Ollama',
                            metadata: { 
                                type: 'ai_generated',
                                model: this.model 
                            }
                        }
                    };
                }
            }
            
            // If parsing fails, return error
            throw new Error('Invalid AI response format');
            
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            return {
                success: false,
                error: 'Failed to parse AI response',
                fallback: true
            };
        }
    }

    getFallbackMCQ(problem) {
        // Fallback to rule-based system if AI fails
        const title = problem.title || problem.name || 'Unknown Problem';
        const difficulty = problem.difficulty_category || 'Medium';
        
        return {
            success: true,
            mcq: {
                question: `For "${title}" (${difficulty}), what's the most important consideration when selecting an algorithm?`,
                options: [
                    'Time and space complexity given the constraints',
                    'Code readability and simplicity',
                    'Personal preference and familiarity',
                    'Using the latest programming language features'
                ],
                correctAnswer: 'Time and space complexity given the constraints',
                explanation: 'Algorithm selection should prioritize efficiency within the given constraints to ensure optimal performance.',
                generator: 'Fallback-RuleBased',
                metadata: { 
                    type: 'fallback',
                    reason: 'AI unavailable'
                }
            }
        };
    }

    // Alternative: Use Hugging Face API (also free with limits)
    async generateMCQWithHuggingFace(problem) {
        const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
        const HF_TOKEN = 'YOUR_FREE_HF_TOKEN'; // Get from huggingface.co
        
        const prompt = this.createPrompt(problem);
        
        try {
            const response = await axios.post(HF_API_URL, {
                inputs: prompt,
            }, {
                headers: {
                    'Authorization': `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return this.parseMCQFromResponse(response.data[0].generated_text);
        } catch (error) {
            console.error('Hugging Face API failed:', error);
            return this.getFallbackMCQ(problem);
        }
    }
}

module.exports = AIService;