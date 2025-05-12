import React from 'react';
import { SentimentResult } from '../utils/sentiment';
import '../styles/SentimentAnalysis.css';

interface SentimentAnalysisProps {
    sentiment: SentimentResult | null;
    transcript: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ sentiment, transcript }) => {
    if (!sentiment) return null;

    return (
        <div className="sentiment-analysis">
            <h3>Sentiment Analysis</h3>
            <div className="sentiment-content">
                <div className="sentiment-overview">
                    <div className="sentiment-label">
                        Overall Sentiment: <span className={sentiment.sentiment.toLowerCase()}>
                            {sentiment.sentiment}
                        </span>
                    </div>
                    <div className="sentiment-confidence">
                        Confidence: {(sentiment.confidence * 100).toFixed(1)}%
                    </div>
                </div>
                {sentiment.phrases.length > 0 && (
                    <div className="key-phrases">
                        <h4>Key Phrases</h4>
                        <ul>
                            {sentiment.phrases.map((phrase, index) => (
                                <li key={index}>{phrase}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentimentAnalysis; 