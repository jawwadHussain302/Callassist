import { dialog } from '@tauri-apps/api';
import { writeTextFile } from '@tauri-apps/api/fs';

export interface SessionData {
    audioFile: string;
    transcript: string;
    sentiment: {
        label: string;
        confidence: number;
        keyPhrases: string[];
    };
    summary: {
        text: string;
        keyPoints: string[];
        callType: string;
    };
    timestamp: string;
}

export type ExportFormat = 'text' | 'json' | 'markdown' | 'html';

export function generatePreview(data: SessionData, format: ExportFormat): string {
    switch (format) {
        case 'text':
            return generateTextContent(data);
        case 'markdown':
            return generateMarkdownContent(data);
        case 'html':
            return generateHtmlContent(data);
        case 'json':
            return JSON.stringify(data, null, 2);
        default:
            return '';
    }
}

function generateTextContent(data: SessionData): string {
    return [
        '=== Call Session Report ===',
        `Date: ${new Date(data.timestamp).toLocaleString()}`,
        '',
        '=== Audio Information ===',
        `File: ${data.audioFile}`,
        '',
        '=== Transcript ===',
        data.transcript,
        '',
        '=== Sentiment Analysis ===',
        `Overall Sentiment: ${data.sentiment.label}`,
        `Confidence: ${(data.sentiment.confidence * 100).toFixed(1)}%`,
        '',
        'Key Phrases:',
        ...data.sentiment.keyPhrases.map(phrase => `- ${phrase}`),
        '',
        '=== Call Summary ===',
        `Type: ${data.summary.callType.charAt(0).toUpperCase() + data.summary.callType.slice(1)}`,
        '',
        data.summary.text,
        '',
        'Key Points:',
        ...data.summary.keyPoints.map(point => `- ${point}`),
        '',
        '=== End of Report ==='
    ].join('\n');
}

function generateMarkdownContent(data: SessionData): string {
    return [
        '# Call Session Report',
        `**Date:** ${new Date(data.timestamp).toLocaleString()}`,
        '',
        '## Audio Information',
        `**File:** ${data.audioFile}`,
        '',
        '## Transcript',
        data.transcript,
        '',
        '## Sentiment Analysis',
        `**Overall Sentiment:** ${data.sentiment.label}`,
        `**Confidence:** ${(data.sentiment.confidence * 100).toFixed(1)}%`,
        '',
        '### Key Phrases',
        ...data.sentiment.keyPhrases.map(phrase => `- ${phrase}`),
        '',
        '## Call Summary',
        `**Type:** ${data.summary.callType.charAt(0).toUpperCase() + data.summary.callType.slice(1)}`,
        '',
        data.summary.text,
        '',
        '### Key Points',
        ...data.summary.keyPoints.map(point => `- ${point}`)
    ].join('\n');
}

function generateHtmlContent(data: SessionData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Call Session Report</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1, h2, h3 { color: #2c3e50; }
        .section { margin: 20px 0; }
        .key-points { list-style-type: none; padding: 0; }
        .key-points li { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .sentiment { font-weight: bold; }
        .confidence { color: #666; }
    </style>
</head>
<body>
    <h1>Call Session Report</h1>
    <p><strong>Date:</strong> ${new Date(data.timestamp).toLocaleString()}</p>

    <div class="section">
        <h2>Audio Information</h2>
        <p><strong>File:</strong> ${data.audioFile}</p>
    </div>

    <div class="section">
        <h2>Transcript</h2>
        <p>${data.transcript}</p>
    </div>

    <div class="section">
        <h2>Sentiment Analysis</h2>
        <p>
            <span class="sentiment">Overall Sentiment: ${data.sentiment.label}</span><br>
            <span class="confidence">Confidence: ${(data.sentiment.confidence * 100).toFixed(1)}%</span>
        </p>
        <h3>Key Phrases</h3>
        <ul class="key-points">
            ${data.sentiment.keyPhrases.map(phrase => `<li>${phrase}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>Call Summary</h2>
        <p><strong>Type:</strong> ${data.summary.callType.charAt(0).toUpperCase() + data.summary.callType.slice(1)}</p>
        <p>${data.summary.text}</p>
        <h3>Key Points</h3>
        <ul class="key-points">
            ${data.summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
}

export async function exportData(data: SessionData, format: ExportFormat): Promise<void> {
    const content = generatePreview(data, format);
    const filePath = await dialog.save({
        filters: [{
            name: format === 'json' ? 'JSON Files' : 
                  format === 'markdown' ? 'Markdown Files' :
                  format === 'html' ? 'HTML Files' : 'Text Files',
            extensions: [format]
        }]
    });

    if (filePath) {
        await writeTextFile(filePath, content);
    }
} 