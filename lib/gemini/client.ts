/**
 * Server-only Gemini API client wrapper
 * 
 * NEVER import this file into client components.
 * Only use in app/api/* route handlers or server components.
 */

import { GoogleGenAI } from '@google/genai';

// Singleton pattern — one client per server instance
let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

export type TranscriptionOptions = {
  model?: string;
  language?: string;
  prompt?: string;
};

/**
 * Transcribe audio data using Gemini
 * @param audioBase64 - Base64-encoded audio (WAV/MP3)
 * @param options - Transcription configuration
 * @returns Promise<string> - Transcribed text
 */
export async function transcribeAudio(
  audioBase64: string,
  options: TranscriptionOptions = {}
): Promise<string> {
  const client = getGeminiClient();
  const model = options.model || process.env.GEMINI_TRANSCRIPTION_MODEL || 'gemini-3-flash-preview';
  
  const defaultPrompt = `You are a professional transcriptionist. Transcribe the following audio accurately, preserving speaker turns if detectable. Do not summarize, do not translate. Output ONLY the transcript text.`;
  const prompt = options.prompt || defaultPrompt;

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: audioBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty transcription');
  }
  return text.trim();
}

export type AnalysisOptions = {
  model?: string;
  temperature?: number;
};

/**
 * Generate analysis from transcript text using Gemini
 * @param transcript - The source transcript text
 * @param prompt - The analysis prompt (from lib/analyses/prompts)
 * @param options - Analysis configuration
 * @returns Promise<string> - Generated analysis
 */
export async function generateAnalysis(
  transcript: string,
  prompt: string,
  options: AnalysisOptions = {}
): Promise<string> {
  const client = getGeminiClient();
  const model = options.model || process.env.GEMINI_ANALYSIS_MODEL || 'gemini-3.1-pro-preview';

  const response = await client.models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [{ text: `${prompt}\n\nTRANSCRIPT:\n${transcript}` }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      topP: 0.95,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty analysis');
  }
  return text.trim();
}
