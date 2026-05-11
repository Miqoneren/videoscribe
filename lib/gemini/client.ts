import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = "Transcribe the following audio accurately. Do not translate. Output only the transcript.";
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: audioBase64,
        mimeType: mimeType,
      },
    },
  ]);

  const response = await result.response;
  return response.text();
}
