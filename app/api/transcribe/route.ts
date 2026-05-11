import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing in .env.local' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Safety limit for inline base64 uploads
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Please use audio files under 15MB for now.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Audio = Buffer.from(bytes).toString('base64');
    
    // 🔧 FIX: Browsers often mislabel audio as video. Force correct audio MIME types.
    let mimeType = file.type || 'audio/mpeg';
    if (mimeType.startsWith('video/')) {
      mimeType = mimeType.replace('video/', 'audio/');
    }
    if (file.name.endsWith('.m4a')) mimeType = 'audio/mp4';
    if (file.name.endsWith('.mp3')) mimeType = 'audio/mpeg';
    if (file.name.endsWith('.wav')) mimeType = 'audio/wav';
    if (file.name.endsWith('.ogg')) mimeType = 'audio/ogg';
    if (file.name.endsWith('.webm')) mimeType = 'audio/webm';

    console.log(`🎙️ Processing: ${file.name} | Size: ${(file.size / 1024).toFixed(1)}KB | MIME: ${mimeType}`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio,
        },
      },
      'Transcribe the following audio accurately. Do not translate. Output only the transcript.',
    ]);

    const response = await result.response;
    return NextResponse.json({ transcript: response.text() });
  } catch (error: any) {
    console.error('❌ Transcription error:', error);
    return NextResponse.json({ error: error.message || 'Failed to transcribe' }, { status: 500 });
  }
}