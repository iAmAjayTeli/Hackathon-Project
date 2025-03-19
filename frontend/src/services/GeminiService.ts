import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIInsight {
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response text as JSON
      const insights: AIInsight[] = JSON.parse(text);
      
      // Validate the response format
      if (!Array.isArray(insights) || insights.length !== 3) {
        throw new Error('Invalid response format from Gemini API');
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }
}

// Initialize the service with your API key
export const geminiService = new GeminiService(import.meta.env.VITE_GEMINI_API_KEY || ''); 