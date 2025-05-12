export interface SummaryResult {
    summary: string;
    keyPoints: string[];
    callType: 'support' | 'sales' | 'technical' | 'general';
}

// Enhanced topic keywords with categories
const TOPIC_KEYWORDS = new Map([
    // Support related
    ['support', 1.0], ['help', 1.0], ['assistance', 1.0], ['service', 1.0],
    ['issue', 0.8], ['problem', 0.8], ['concern', 0.8], ['ticket', 0.8],
    ['complaint', 0.8], ['inquiry', 0.8], ['question', 0.8], ['request', 0.8],
    
    // Technical related
    ['technical', 1.0], ['error', 1.0], ['bug', 1.0], ['crash', 1.0],
    ['software', 0.8], ['hardware', 0.8], ['system', 0.8], ['network', 0.8],
    ['update', 0.8], ['install', 0.8], ['configure', 0.8], ['compatibility', 0.8],
    
    // Sales related
    ['purchase', 1.0], ['order', 1.0], ['payment', 1.0], ['price', 1.0],
    ['product', 0.8], ['service', 0.8], ['subscription', 0.8], ['renewal', 0.8],
    ['discount', 0.8], ['refund', 0.8], ['billing', 0.8], ['invoice', 0.8],
    
    // Account related
    ['account', 1.0], ['password', 1.0], ['login', 1.0], ['access', 1.0],
    ['security', 0.8], ['privacy', 0.8], ['settings', 0.8], ['profile', 0.8],
    
    // General
    ['information', 0.6], ['details', 0.6], ['status', 0.6], ['progress', 0.6],
    ['update', 0.6], ['change', 0.6], ['confirm', 0.6], ['verify', 0.6]
]);

// Enhanced action keywords with categories
const ACTION_KEYWORDS = new Map([
    // Resolution actions
    ['resolved', 1.0], ['fixed', 1.0], ['solved', 1.0], ['completed', 1.0],
    ['finished', 0.8], ['done', 0.8], ['addressed', 0.8], ['handled', 0.8],
    
    // Process actions
    ['submitted', 1.0], ['processed', 1.0], ['approved', 1.0], ['denied', 1.0],
    ['rejected', 0.8], ['accepted', 0.8], ['validated', 0.8], ['verified', 0.8],
    
    // Planning actions
    ['scheduled', 1.0], ['arranged', 1.0], ['planned', 1.0], ['organized', 1.0],
    ['confirmed', 0.8], ['booked', 0.8], ['reserved', 0.8], ['set up', 0.8],
    
    // Investigation actions
    ['investigated', 1.0], ['checked', 1.0], ['reviewed', 1.0], ['examined', 1.0],
    ['analyzed', 0.8], ['assessed', 0.8], ['evaluated', 0.8], ['monitored', 0.8],
    
    // Communication actions
    ['reported', 1.0], ['notified', 1.0], ['informed', 1.0], ['updated', 1.0],
    ['escalated', 0.8], ['referred', 0.8], ['transferred', 0.8], ['forwarded', 0.8]
]);

// Time-related words to identify urgency
const TIME_KEYWORDS = new Set([
    'urgent', 'immediate', 'asap', 'emergency', 'critical', 'priority',
    'today', 'tomorrow', 'next week', 'scheduled', 'deadline', 'due'
]);

function detectCallType(text: string): 'support' | 'sales' | 'technical' | 'general' {
    const words = text.toLowerCase().split(/\s+/);
    const scores = {
        support: 0,
        sales: 0,
        technical: 0,
        general: 0
    };

    words.forEach(word => {
        if (['support', 'help', 'assistance', 'issue', 'problem'].includes(word)) {
            scores.support += 1;
        }
        if (['purchase', 'order', 'payment', 'price', 'product'].includes(word)) {
            scores.sales += 1;
        }
        if (['technical', 'error', 'bug', 'software', 'hardware'].includes(word)) {
            scores.technical += 1;
        }
    });

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) return 'general';

    const type = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
    return (type as 'support' | 'sales' | 'technical') || 'general';
}

function extractKeyPoints(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints: Array<{ text: string; score: number }> = [];
    
    sentences.forEach(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        let score = 0;
        let hasTopic = false;
        let hasAction = false;
        let hasTime = false;
        
        words.forEach(word => {
            if (TOPIC_KEYWORDS.has(word)) {
                hasTopic = true;
                score += TOPIC_KEYWORDS.get(word) || 0;
            }
            if (ACTION_KEYWORDS.has(word)) {
                hasAction = true;
                score += ACTION_KEYWORDS.get(word) || 0;
            }
            if (TIME_KEYWORDS.has(word)) {
                hasTime = true;
                score += 0.5;
            }
        });

        // Only include sentences with significant content
        if ((hasTopic || hasAction) && score > 0.5) {
            keyPoints.push({
                text: sentence.trim(),
                score: score + (hasTime ? 0.3 : 0)
            });
        }
    });

    // Sort by score and return top points
    return keyPoints
        .sort((a, b) => b.score - a.score)
        .map(point => point.text);
}

function generateSummary(text: string, keyPoints: string[], callType: 'support' | 'sales' | 'technical' | 'general'): string {
    if (!text || text.trim().length === 0) {
        return "No transcript available to summarize.";
    }

    // If we have key points, use them to generate a more focused summary
    if (keyPoints.length > 0) {
        const mainTopics = keyPoints.slice(0, 3);
        const callTypePhrase = {
            support: "support request",
            sales: "sales inquiry",
            technical: "technical issue",
            general: "conversation"
        }[callType];

        const summary = [
            `This ${callTypePhrase} covered several important topics:`,
            ...mainTopics.map(point => `- ${point}`),
            "The conversation was handled professionally and all concerns were addressed."
        ].join("\n");
        
        return summary;
    }

    // Fallback to a basic summary if no key points are found
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 3) {
        return text; // If text is already short, return as is
    }

    // Take first and last sentence, plus one from the middle
    const firstSentence = sentences[0];
    const middleSentence = sentences[Math.floor(sentences.length / 2)];
    const lastSentence = sentences[sentences.length - 1];

    return [
        firstSentence.trim(),
        middleSentence.trim(),
        lastSentence.trim()
    ].join(". ") + ".";
}

export function generateCallSummary(text: string): SummaryResult {
    const callType = detectCallType(text);
    const keyPoints = extractKeyPoints(text);
    const summary = generateSummary(text, keyPoints, callType);

    return {
        summary,
        keyPoints: keyPoints.slice(0, 5), // Limit to top 5 key points
        callType
    };
} 