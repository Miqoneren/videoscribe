'use client';
import { useState } from 'react';

export default function TranscribePage() {
  // Transcription State
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Analysis State
  const [analysisType, setAnalysisType] = useState('summary');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [analysis, setAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setTranscript('');
      setAnalysis(''); // Reset analysis when new file uploaded
      setError('');
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setTranscript('');
    setAnalysis('');

    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transcribe');
      setTranscript(data.transcript);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!transcript) return;
    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysis('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          type: analysisType,
          language: targetLanguage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze');
      setAnalysis(data.analysis);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = { maxWidth: '800px', margin: '0 auto', padding: '40px 20px', backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', fontFamily: 'sans-serif' };
  const boxStyle: React.CSSProperties = { marginTop: '24px', padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #cccccc', borderRadius: '8px', color: '#000000' };
  const btnStyle: React.CSSProperties = { backgroundColor: '#0055ff', color: '#ffffff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' };
  const selectStyle: React.CSSProperties = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px', fontSize: '14px' };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>VideoScribe</h1>
      
      {/* Upload Section */}
      <div style={{ marginBottom: '20px' }}>
        <input type="file" accept="audio/*,video/*" onChange={handleFileChange} style={{ display: 'block', marginBottom: '10px' }} />
        {file && (
          <button onClick={handleTranscribe} disabled={loading} style={{...btnStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Transcribing...' : '1. Transcribe Audio'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#cc0000', marginBottom: '16px' }}>{error}</p>}

      {/* Transcript Section */}
      {transcript && (
        <div style={boxStyle}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '18px' }}>Transcript (Source Language)</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', maxHeight: '300px', overflowY: 'auto' }}>{transcript}</p>
          
          {/* Analysis Controls */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>2. Generate Analysis</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)} style={selectStyle}>
                <option value="summary">Summary</option>
                <option value="brief">Brief</option>
                <option value="action items">Action Items</option>
                <option value="key decisions">Key Decisions</option>
                <option value="meeting minutes">Meeting Minutes</option>
              </select>

              <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} style={selectStyle}>
                <option value="English">English</option>
                <option value="Armenian">Armenian</option>
                <option value="Russian">Russian</option>
              </select>

              <button onClick={handleAnalyze} disabled={analysisLoading} style={{...btnStyle, marginTop: 0, backgroundColor: '#28a745', opacity: analysisLoading ? 0.6 : 1}}>
                {analysisLoading ? 'Analyzing...' : 'Generate'}
              </button>
            </div>

            {analysisError && <p style={{ color: '#cc0000', marginTop: '10px' }}>{analysisError}</p>}

            {analysis && (
              <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#ffffff', border: '1px solid #0055ff', borderRadius: '6px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#0055ff' }}>Analysis ({targetLanguage})</h3>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{analysis}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}