# 🤖 Ollama Setup for Free AI MCQ Generation

## Step 1: Install Ollama
1. Download from: https://ollama.com/download
2. Install Ollama on your Windows machine
3. Open Command Prompt and run: `ollama --version`

## Step 2: Pull a Coding Model
```bash
# Choose ONE of these models:
ollama pull codellama:7b          # Best for coding (3.8GB)
ollama pull llama3.1:8b          # General purpose (4.7GB)  
ollama pull qwen2.5-coder:7b     # Excellent for coding (4.4GB)
```

## Step 3: Test the Model
```bash
ollama run codellama:7b
# Type: "Generate a coding question about arrays"
# Press Ctrl+D to exit
```

## Step 4: Start Ollama Server
```bash
ollama serve
# This runs on http://localhost:11434
```

## Step 5: Your Backend Will Connect
- No API key needed!
- Completely free
- Works offline
- Fast responses

## Model Recommendations:
- **qwen2.5-coder:7b** - Best for coding questions
- **codellama:7b** - Good for algorithms  
- **llama3.1:8b** - Most versatile

## System Requirements:
- 8GB+ RAM recommended
- 5GB free disk space
- Works on any modern PC