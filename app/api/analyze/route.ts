import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { transcript, type, language } = await req.json();

    if (!transcript || !type || !language) {
      return NextResponse.json({ error: 'Missing fields: transcript, type, language' }, { status: 400 });
    }

    // We use flash for speed and cost-efficiency on text tasks
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Construct a precise prompt for the LLM
    const prompt = `
      You are an expert meeting assistant.
      Task: Generate a ${type} based on the transcript below.
      Output Language: ${language}.
      
      Rules:
      1. Output ONLY the requested analysis content.
      2. The output must be strictly in ${language}.
      3. Do not include the original transcript in the output.
      4. Format the output clearly with markdown (bullet points, bold text).
      
      Transcript:
      """
      ${transcript}
      """
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ analysis: response.text() });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze' }, { status: 500 });
  }
}