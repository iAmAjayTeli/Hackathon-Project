import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIInsight {
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }
    console.log('GeminiService initialized with API key:', this.apiKey.substring(0, 8) + '...');
    this.testApiConnection();
  }

  private async testApiConnection() {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, this is a test message."
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API test failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`API test failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API test successful:', data);
    } catch (error) {
      console.error('Error testing API connection:', error);
      throw error;
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('Generating response for prompt:', prompt);
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\nPlease format your response with:\n- Clear paragraphs separated by line breaks\n- Bullet points using proper markdown syntax\n- Headers using markdown syntax (e.g., # for main headers)\n- Code blocks when showing technical content`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error generating response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to generate response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Generated response:', data);

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      // Process the response text to ensure proper formatting
      let text = data.candidates[0].content.parts[0].text;
      
      // Replace multiple consecutive newlines with two newlines
      text = text.replace(/\n{3,}/g, '\n\n');
      
      // Ensure bullet points have proper spacing
      text = text.replace(/^\s*\*\s*/gm, '• ');
      
      // Ensure headers have proper spacing
      text = text.replace(/^#+\s*/gm, (match: string) => `\n${match}`);
      
      // Add line breaks before lists
      text = text.replace(/(\n[^•\n]+\n)(•)/g, '$1\n$2');
      
      // Remove any trailing/leading whitespace
      text = text.trim();

      return text;
    } catch (error) {
      console.error('Error in generateResponse:', error);
      throw error;
    }
  }

  async generateInsights(analyticsData: string): Promise<AIInsight[]> {
    try {
      const prompt = `
        You are an AI analytics expert analyzing call center data. Based on the following data, provide 3 key insights.
        For each insight, include:
        1. A clear title
        2. A description of the observation
        3. A specific, actionable recommendation
        4. A confidence score between 0 and 1

        Format each insight as a JSON object with the following structure:
        {
          "title": "string",
          "description": "string",
          "recommendation": "string",
          "confidence": number
        }

        Return an array of exactly 3 such objects.

        Here's the data to analyze:
        ${analyticsData}
      `;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!text) {
        throw new Error('Invalid response format from API');
      }

      const insights: AIInsight[] = JSON.parse(text);
      
      if (!Array.isArray(insights) || insights.length !== 3) {
        throw new Error('Invalid insights format from API');
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [
        {
          title: "Error Loading Insights",
          description: "We encountered an error while generating insights.",
          recommendation: "Please try refreshing the page or try again later.",
          confidence: 1
        },
        {
          title: "Using Cached Data",
          description: "Showing previously cached insights if available.",
          recommendation: "Check your internet connection and API key configuration.",
          confidence: 1
        },
        {
          title: "Support Available",
          description: "Our support team is here to help.",
          recommendation: "Contact support if this issue persists.",
          confidence: 1
        }
      ];
    }
  }

  async getAnalyticsInsight(data: any): Promise<string> {
    const prompt = `
      Analyze this call center data and provide insights in a conversational tone:
      ${JSON.stringify(data)}
      Focus on:
      1. Key trends
      2. Notable patterns
      3. Actionable recommendations
      Keep it concise and friendly.
    `;

    return this.generateResponse(prompt);
  }

  async getEmotionRecommendation(emotion: string): Promise<string> {
    const prompt = `
      Given the detected emotion "${emotion}" in a customer service call,
      provide a brief, helpful recommendation for the agent.
      Include:
      1. A quick explanation of what this emotion might indicate
      2. A practical tip for handling it
      3. A positive note or encouragement
      Keep it concise and supportive.
    `;

    return this.generateResponse(prompt);
  }
}

export const geminiService = new GeminiService(); 