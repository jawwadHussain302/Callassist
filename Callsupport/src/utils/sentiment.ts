export interface SentimentResult {
    sentiment: string;
    confidence: number;
    phrases: string[];
}

// Enhanced keyword-based sentiment analysis with weighted scores
const POSITIVE_KEYWORDS = new Map([
    // Strong positive
    ['excellent', 1.0], ['outstanding', 1.0], ['perfect', 1.0], ['brilliant', 1.0],
    ['amazing', 1.0], ['fantastic', 1.0], ['wonderful', 1.0], ['superb', 1.0],
    // Moderate positive
    ['good', 0.7], ['great', 0.7], ['helpful', 0.7], ['pleased', 0.7],
    ['happy', 0.7], ['satisfied', 0.7], ['enjoy', 0.7], ['nice', 0.7],
    // Mild positive
    ['thank', 0.4], ['thanks', 0.4], ['appreciate', 0.4], ['okay', 0.4],
    ['fine', 0.4], ['alright', 0.4], ['decent', 0.4], ['acceptable', 0.4]
]);

const NEGATIVE_KEYWORDS = new Map([
    // Strong negative
    ['terrible', 1.0], ['horrible', 1.0], ['awful', 1.0], ['dreadful', 1.0],
    ['atrocious', 1.0], ['abysmal', 1.0], ['unacceptable', 1.0], ['hate', 1.0],
    // Moderate negative
    ['bad', 0.7], ['poor', 0.7], ['disappointing', 0.7], ['frustrated', 0.7],
    ['angry', 0.7], ['upset', 0.7], ['dissatisfied', 0.7], ['dislike', 0.7],
    // Mild negative
    ['problem', 0.4], ['issue', 0.4], ['difficult', 0.4], ['hard', 0.4],
    ['complicated', 0.4], ['confused', 0.4], ['concerned', 0.4], ['worried', 0.4]
]);

// Negation words that can flip sentiment
const NEGATION_WORDS = new Set([
    'not', 'no', 'never', 'neither', 'nor', 'none', 'nothing',
    'nowhere', 'hardly', 'barely', 'scarcely', 'doesn\'t', 'don\'t',
    'didn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'won\'t',
    'wouldn\'t', 'couldn\'t', 'shouldn\'t', 'can\'t', 'cannot'
]);

function calculateSentimentScore(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let totalWords = words.length;
    let negationActive = false;

    words.forEach(word => {
        // Check for negation
        if (NEGATION_WORDS.has(word)) {
            negationActive = true;
            return;
        }

        // Check positive words
        if (POSITIVE_KEYWORDS.has(word)) {
            const score = POSITIVE_KEYWORDS.get(word) || 0;
            if (negationActive) {
                negativeScore += score;
            } else {
                positiveScore += score;
            }
        }

        // Check negative words
        if (NEGATIVE_KEYWORDS.has(word)) {
            const score = NEGATIVE_KEYWORDS.get(word) || 0;
            if (negationActive) {
                positiveScore += score;
            } else {
                negativeScore += score;
            }
        }

        // Reset negation after one word
        negationActive = false;
    });

    // Normalize score between -1 and 1
    const score = (positiveScore - negativeScore) / Math.max(1, totalWords);
    return Math.max(-1, Math.min(1, score));
}

function findHighlightedPhrases(text: string): Array<{ text: string; sentiment: 'Positive' | 'Neutral' | 'Negative'; score: number }> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const phrases: Array<{ text: string; sentiment: 'Positive' | 'Neutral' | 'Negative'; score: number }> = [];

    sentences.forEach(sentence => {
        const score = calculateSentimentScore(sentence);
        if (Math.abs(score) > 0.2) { // Lowered threshold to catch more phrases
            phrases.push({
                text: sentence.trim(),
                sentiment: score > 0 ? 'Positive' : 'Negative',
                score: Math.abs(score)
            });
        }
    });

    // Sort by absolute score and take top 5
    return phrases
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
}

export function analyzeSentiment(text: string): SentimentResult {
    const score = calculateSentimentScore(text);
    const confidence = Math.abs(score);
    
    let sentiment: 'Positive' | 'Neutral' | 'Negative';
    if (score > 0.15) sentiment = 'Positive';
    else if (score < -0.15) sentiment = 'Negative';
    else sentiment = 'Neutral';

    const highlightedPhrases = findHighlightedPhrases(text);

    return {
        sentiment,
        confidence,
        phrases: highlightedPhrases.map(phrase => phrase.text)
    };
} 