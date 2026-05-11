/**
 * POST /api/analyze
 * 
 * Server-side analysis endpoint.
 * Takes transcript text + analysis type + output language, returns generated analysis.
 * 
 * CRITICAL: Transcript language is NEVER translated.
 * Only the analysis output is in the user's selected language.
 * 
 * Request body:
 * {
 *   transcript: string,           // Source transcript (original language)
 *   type: 'summary' | 'brief' | 'action_items' | 'key_decisions' | 'meeting_minutes',
 *   outputLanguage: 'hy' | 'en' | 'ru',  // Target language for analysis output
 *   transcriptId?: string         // Optional: for persistence
 * }
 * 
 * Response:
 * {
 *   content: string,              // Generated analysis in outputLanguage
 *   type: string,
 *   outputLanguage: string,
 *   transcriptId?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAnalysis } from '@/lib/gemini/client';
import { getAnalysisPrompt } from '@/lib/analyses/prompts';

export const runtime = 'nodejs';
export const maxDuration = 45; // 45 seconds for analysis generation

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { transcript, type, outputLanguage, transcriptId } = body;

    // Validate required fields
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'transcript is required' },
        { status: 400 }
      );
    }

    if (!type || !['summary', 'brief', 'action_items', 'key_decisions', 'meeting_minutes'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be one of: summary, brief, action_items, key_decisions, meeting_minutes' },
        { status: 400 }
      );
    }

    if (!outputLanguage || !['hy', 'en', 'ru'].includes(outputLanguage)) {
      return NextResponse.json(
        { error: 'outputLanguage must be one of: hy, en, ru' },
        { status: 400 }
      );
    }

    // Get the appropriate prompt for this type + language
    const prompt = getAnalysisPrompt(type as AnalysisType, outputLanguage);
    if (!prompt) {
      return NextResponse.json(
        { error: `Prompt not found for type=${type}, language=${outputLanguage}` },
        { status: 500 }
      );
    }

    // Generate analysis via Gemini
    const content = await generateAnalysis(transcript, prompt);

    return NextResponse.json({
      content,
      type,
      outputLanguage,
      transcriptId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[/api/analyze] Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        return NextResponse.json(
          { error: 'Server configuration error: missing API key' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Analysis generation failed. Please try again.' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Type definition for analysis types
export type AnalysisType = 'summary' | 'brief' | 'action_items' | 'key_decisions' | 'meeting_minutes';
