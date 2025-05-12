import React from 'react';

interface TranscriptDisplayProps {
    transcript: string;
    isLoading: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isLoading }) => {
    return (
        <div className="transcript-container">
            {isLoading ? (
                <div className="loading">
                    <p>Transcribing...</p>
                </div>
            ) : (
                <div className="transcript-content">
                    <h3>Transcript</h3>
                    <div className="transcript-text">
                        {transcript || 'No transcript available'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranscriptDisplay; 