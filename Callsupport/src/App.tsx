import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadBox from './components/UploadBox'
import TranscriptDisplay from './components/TranscriptDisplay'
import SentimentAnalysis from './components/SentimentAnalysis'
import CallSummary from './components/CallSummary'
import { transcribeAudio } from './utils/transcribe'
import './styles/App.css'
import './styles/UploadBox.css'
import './styles/TranscriptDisplay.css'
import './styles/SentimentAnalysis.css'
import './styles/CallSummary.css'
import ExportButtons from './components/ExportButtons'
import { SessionData } from './utils/export'
import { analyzeSentiment, SentimentResult } from './utils/sentiment'
import { generateCallSummary, SummaryResult } from './utils/summary'
import { AutoSaveManager } from './utils/autoSave'
import './styles/ExportButtons.css'

function App() {
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [autoSaveManager] = useState(() => new AutoSaveManager());

  // Upload state
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    return () => {
      // Cleanup auto-save when component unmounts
      autoSaveManager.stopAutoSave();
    };
  }, [autoSaveManager]);

  const handleTranscribe = async (filename: string) => {
    setIsTranscribing(true);
    try {
      const result = await transcribeAudio(filename);
      handleTranscriptionComplete(result);
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
    const sentimentResult = analyzeSentiment(text);
    setSentiment(sentimentResult);

    const summaryResult = generateCallSummary(text);
    // Create session data
    const data: SessionData = {
      audioFile: fileName || 'Unknown',
      transcript: text,
      sentiment: {
        label: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        keyPhrases: sentimentResult.phrases
      },
      summary: {
        text: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        callType: summaryResult.callType
      },
      timestamp: new Date().toISOString()
    };
    setSessionData(data);

    // Start auto-save with the new data
    autoSaveManager.startAutoSave(data);
  };

  // Update auto-save when session data changes
  useEffect(() => {
    if (sessionData) {
      autoSaveManager.updateData(sessionData);
    }
  }, [sessionData, autoSaveManager]);

  return (
    <div className="app">
      <Header />
      <main>
        <UploadBox
          onTranscribe={handleTranscribe}
          fileName={fileName}
          setFileName={setFileName}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          error={error}
          setError={setError}
          duration={duration}
          setDuration={setDuration}
        />
        <TranscriptDisplay transcript={transcript} isLoading={isTranscribing} />
        {transcript && (
          <>
            <SentimentAnalysis
              sentiment={sentiment}
              transcript={transcript}
            />
            <CallSummary transcript={transcript} />
            {sessionData && <ExportButtons data={sessionData} />}
          </>
        )}
      </main>
    </div>
  )
}

export default App
