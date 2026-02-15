import Groq from 'groq-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let groq = null;

function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

/**
 * Analyze well log data using AI
 * @param {Array} data - Well data with depth and measurements
 * @param {Array} curves - Selected curve names
 * @param {number} startDepth - Start depth
 * @param {number} endDepth - End depth
 * @returns {string} AI interpretation
 */
export async function analyzeWellData(data, curves, startDepth, endDepth) {
  // Prepare data summary for AI
  const dataSummary = prepareDataSummary(data, curves);
  
  const prompt = `You are a geologist analyzing well log data. 

Depth Range: ${startDepth} to ${endDepth} feet
Curves Analyzed: ${curves.join(', ')}

Data Summary:
${dataSummary}

Please provide:
1. Overall interpretation of the formation
2. Key observations from the data
3. Any anomalies or interesting patterns
4. Potential rock types or formations indicated

Keep the analysis concise and professional.`;

  const client = getGroqClient();
  
  const completion = await client.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0].message.content;
}

/**
 * Chat with AI about well data
 * @param {string} message - User message
 * @param {Object} well - Well information
 * @param {Array} data - Sample well data
 * @param {Array} conversationHistory - Previous messages
 * @returns {string} AI response
 */
export async function chatWithAI(message, well, data, conversationHistory = []) {
  const client = getGroqClient();
  
  // Build context about the well
  const context = `You are a helpful geologist assistant. You're discussing well log data.

Well Information:
- Name: ${well.name}
- Location: ${well.location || 'Unknown'}
- Depth Range: ${well.start_depth} to ${well.stop_depth} feet
- Total Data Points: ${data.length}

Available curves in this well: ${Object.keys(data[0]?.data || {}).join(', ')}

Answer questions about the well data, formations, and provide geological insights. Be conversational and helpful.`;

  // Build messages array
  const messages = [
    { role: 'system', content: context },
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  const completion = await client.chat.completions.create({
    messages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 512,
  });

  return completion.choices[0].message.content;
}

/**
 * Prepare data summary for AI analysis
 */
function prepareDataSummary(data, curves) {
  const summary = [];
  
  curves.forEach(curve => {
    const values = data.map(row => row.data[curve]).filter(v => v !== null && v !== -9999);
    
    if (values.length === 0) return;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    summary.push(`${curve}: Min=${min.toFixed(2)}, Max=${max.toFixed(2)}, Avg=${avg.toFixed(2)}`);
  });
  
  return summary.join('\n');
}
