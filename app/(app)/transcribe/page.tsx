/**
 * Transcribe Page — Phase 1 MVP
 * 
 * Minimal UI for uploading audio and viewing progressive transcription.
 * No auth yet — localStorage for demo purposes only.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { chunkAudio, loadFFmpeg } from '@/lib/audio/chunk';

type TranscriptionState = 'idle' | 'uploading' | 'processing' | 'transcribing' | 'complete' | 'error';

export default function TranscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<TranscriptionState>('idle');
  const [progress, setProgress] = useState({ chunk: 0, total: 0, percent: 0 });
  const [transcript, setTranscript] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    // Validate file type
    if (!selected.type.startsWith('audio/') && !selected.type.startsWith('video/')) {
      setError('Please select an audio or video file');
      return;
    }
    
    setFile(selected);
    setError('');
    setTranscript('');
    setProgress({ chunk: 0, total: 0, percent: 0 });
    setState('idle');
  }, []);

  const handleTranscribe = useCallback(async () => {
    if (!file) return;
    
    setState('uploading');
    setError('');
    abortControllerRef.current = new AbortController();
    
    try {
      // Load FFmpeg
      await loadFFmpeg();
      
      // Chunk the audio
      setState('processing');
      const chunks = await chunkAudio(file);
      setProgress({ chunk: 0, total: chunks.length, percent: 0 });
      
      // Transcribe each chunk
      setState('transcribing');
      let fullTranscript = '';
      
      for (let i = 0; i < chunks.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Transcription cancelled');
        }
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: chunks[i].audioBase64,
            chunkIndex: i,
            totalChunks: chunks.length,
          }),
          signal: abortControllerRef.current?.signal,
        });
        
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        fullTranscript += (fullTranscript ? '\n\n' : '') + result.text;
        setTranscript(fullTranscript);
        
        if (result.detectedLanguage && !detectedLanguage) {
          setDetectedLanguage(result.detectedLanguage);
        }
        
        setProgress({
          chunk: i + 1,
          total: chunks.length,
          percent: Math.round(((i + 1) / chunks.length) * 100)
        });
      }
      
      setState('complete');
      
      // Save to localStorage for demo (Phase 3 will use Supabase)
      const transcriptId = crypto.randomUUID();
      localStorage.setItem(`transcript:${transcriptId}`, JSON.stringify({
        id: transcriptId,
        title: file.name,
        text: fullTranscript,
        sourceLanguage: detectedLanguage || 'unknown',
        createdAt: new Date().toISOString(),
      }));
      
    } catch (err) {
      console.error('Transcription error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Transcription cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'Transcription failed');
      }
      setState('error');
    }
  }, [file, detectedLanguage]);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState('idle');
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setTranscript('');
    setProgress({ chunk: 0, total: 0, percent: 0 });
    setError('');
    setDetectedLanguage('');
    setState('idle');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Transcribe Meeting</h1>
          <p className="text-slate-600 mt-1">Upload audio/video to get an accurate transcript</p>
        </header>

        {/* File Upload Section */}
        {state === 'idle' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium text-slate-700">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-slate-500 mt-1">MP3, WAV, M4A, MP4, WebM (max 500MB)</span>
              </label>
            </div>
            {file && (
              <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="text-sm text-slate-700 truncate">{file.name}</span>
                <button
                  onClick={() => setFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
            {file && (
              <button
                onClick={handleTranscribe}
                disabled={!file}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium py-2.5 px-4 rounded-md transition-colors"
              >
                Start Transcription
              </button>
            )}
          </div>
        )}

        {/* Progress Section */}
        {(state === 'uploading' || state === 'processing' || state === 'transcribing') && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-slate-900">
                {state === 'uploading' && 'Preparing file...'}
                {state === 'processing' && 'Splitting audio...'}
                {state === 'transcribing' && 'Transcribing...'}
              </span>
              <span className="text-sm text-slate-500">{progress.percent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {state === 'transcribing' && (
              <p className="text-sm text-slate-600">
                Chunk {progress.chunk} of {progress.total}
              </p>
            )}
            <button
              onClick={handleCancel}
              className="mt-4 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Error Section */}
        {state === 'error' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleReset}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Transcript Section */}
        {(transcript || state === 'complete') && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Transcript</h2>
              {detectedLanguage && (
                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                  Language: {detectedLanguage.toUpperCase()}
                </span>
              )}
            </div>
            <div className="transcript-scroll max-h-96 overflow-y-auto p-4 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                {transcript}
                {state === 'transcribing' && <span className="streaming-cursor" />}
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => navigator.clipboard.writeText(transcript)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Copy to clipboard
              </button>
              {state === 'complete' && (
                <>
                  <button
                    onClick={() => {
                      const blob = new Blob([transcript], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${file?.name || 'transcript'}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Download .txt
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Transcribe another
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
