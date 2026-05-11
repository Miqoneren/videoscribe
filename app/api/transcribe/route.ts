/**
 * POST /api/transcribe
 * 
 * Server-side transcription endpoint.
 * Accepts base64 audio chunk, returns transcribed text.
 * 
 * Request body:
 * {
 *   audioBase64: string,      // Base64-encoded WAV audio
 *   chunkIndex?: number,      // For progress tracking
 *   totalChunks?: number,     // For progress tracking
 *   detectedLanguage?: string // Optional hint for Gemini
 * }
 * 
 * Response:
 * {
 *   text: string,             // Transcribed text for this chunk
 *   chunkIndex: number,
 *   totalChunks: number,
 *   detectedLanguage?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/gemini/client';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max for transcription

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { audioBase64, chunkIndex = 0, totalChunks = 1, detectedLanguage } = body;

    // Validate input
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return NextResponse.json(
        { error: 'audioBase64 is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate base64 format (basic check)
    if (!/^[A-Za-z0-9+/=]+$/.test(audioBase64)) {
      return NextResponse.json(
        { error: 'Invalid base64 audio data' },
        { status: 400 }
      );
    }

    // Call Gemini for transcription
    const text = await transcribeAudio(audioBase64, {
      language: detectedLanguage,
    });

    return NextResponse.json({
      text,
      chunkIndex,
      totalChunks,
      detectedLanguage,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[/api/transcribe] Error:', error);

    // Handle Gemini API errors gracefully
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
      { error: 'Transcription failed. Please try again.' },
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
