import React from 'react';
import { generateCallSummary } from '../utils/summary';

interface CallSummaryProps {
    transcript: string;
}

const CallSummary: React.FC<CallSummaryProps> = ({ transcript }) => {
    if (!transcript) return null;

    const { summary, keyPoints, callType } = generateCallSummary(transcript);

    const getCallTypeColor = (type: string) => {
        switch (type) {
            case 'support': return '#3498db';
            case 'sales': return '#2ecc71';
            case 'technical': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getCallTypeIcon = (type: string) => {
        switch (type) {
            case 'support': return '🛟';
            case 'sales': return '💰';
            case 'technical': return '🔧';
            default: return '💬';
        }
    };

    return (
        <div className="call-summary">
            <div className="summary-header">
                <h3>Call Summary</h3>
                <div
                    className="call-type-badge"
                    style={{ backgroundColor: getCallTypeColor(callType) }}
                >
                    <span className="call-type-icon">{getCallTypeIcon(callType)}</span>
                    <span className="call-type-text">
                        {callType.charAt(0).toUpperCase() + callType.slice(1)}
                    </span>
                </div>
            </div>
            <div className="summary-content">
                <div className="summary-text">
                    {summary.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>

                {keyPoints.length > 0 && (
                    <div className="key-points">
                        <h4>Key Points</h4>
                        <ul>
                            {keyPoints.map((point, index) => (
                                <li key={index}>
                                    <span className="point-bullet">•</span>
                                    <span className="point-text">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallSummary; 