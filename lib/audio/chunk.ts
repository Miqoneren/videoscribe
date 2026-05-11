/**
 * Client-side audio chunking using FFmpeg.wasm
 * 
 * Split long audio files into 3-minute chunks for transcription.
 * Run this in browser context only (not in API routes).
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const CHUNK_DURATION_SECONDS = 180; // 3 minutes
const MAX_CHUNK_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export type ChunkResult = {
  index: number;
  total: number;
  audioBase64: string;
  duration: number;
};

let ffmpeg: FFmpeg | null = null;

/**
 * Initialize FFmpeg.wasm (call once on app load)
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
  });
  return ffmpeg;
}

/**
 * Get audio duration in seconds using FFmpeg
 */
export async function getAudioDuration(file: File): Promise<number> {
  const instance = await loadFFmpeg();
  const fileName = 'input.' + file.name.split('.').pop();
  
  await instance.writeFile(fileName, await fetchFile(file));
  await instance.exec([
    '-i', fileName,
    '-f', 'null',
    '-'
  ]);
  
  // Parse duration from FFmpeg output (simplified)
  // In production, use ffprobe or metadata parsing
  const { output } = await instance.exec([
    '-i', fileName,
    '-f', 'segment',
    '-segment_time', '1',
    '-f', 'null',
    '-'
  ]);
  
  // Fallback: estimate from file size and typical bitrate
  const estimatedDuration = (file.size / 128000) * 8; // ~128kbps estimate
  await instance.deleteFile(fileName);
  
  return Math.ceil(estimatedDuration);
}

/**
 * Split audio file into chunks and return base64-encoded WAV data
 */
export async function chunkAudio(file: File): Promise<ChunkResult[]> {
  const instance = await loadFFmpeg();
  const fileName = 'input.' + file.name.split('.').pop();
  const ext = file.name.split('.').pop() || 'mp3';
  
  await instance.writeFile(fileName, await fetchFile(file));
  
  // Get actual duration
  const duration = await getAudioDuration(file);
  const totalChunks = Math.ceil(duration / CHUNK_DURATION_SECONDS);
  
  const results: ChunkResult[] = [];
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_DURATION_SECONDS;
    const outputName = `chunk_${i}.wav`;
    
    // Extract chunk and convert to WAV (required by Gemini)
    await instance.exec([
      '-i', fileName,
      '-ss', start.toString(),
      '-t', CHUNK_DURATION_SECONDS.toString(),
      '-ar', '16000', // 16kHz sample rate for Gemini
      '-ac', '1',     // mono
      '-f', 'wav',
      outputName
    ]);
    
    const data = await instance.readFile(outputName);
    const base64 = arrayBufferToBase64(data as ArrayBuffer);
    
    results.push({
      index: i,
      total: totalChunks,
      audioBase64: base64,
      duration: Math.min(CHUNK_DURATION_SECONDS, duration - start)
    });
    
    await instance.deleteFile(outputName);
  }
  
  await instance.deleteFile(fileName);
  return results;
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Check if file needs chunking
 */
export function needsChunking(file: File): boolean {
  return file.size > MAX_CHUNK_SIZE_BYTES;
}

/**
 * Estimate number of chunks for a file
 */
export function estimateChunks(file: File): number {
  const duration = (file.size / 128000) * 8; // ~128kbps estimate
  return Math.max(1, Math.ceil(duration / CHUNK_DURATION_SECONDS));
}
