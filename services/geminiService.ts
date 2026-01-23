
import { GoogleGenAI, Type } from "@google/genai";
import type { PaperSummary, TrendingReport } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const summarySchema = {
    type: Type.OBJECT,
    properties: {
        executiveTldr: { type: Type.STRING, description: 'Executive TL;DR (≤120 words) with one clear takeaway: why this matters now.' },
        whatIsNew: {
            type: Type.OBJECT,
            description: "Distill the leap (architecture, dataset, efficiency, etc.) and always compare to the previous norm.",
            properties: {
                leap: { type: Type.STRING, description: "The core innovation or leap forward." },
                comparison: { type: Type.STRING, description: "Comparison to the previous state-of-the-art or norm." }
            },
            required: ['leap', 'comparison']
        },
        howItWorks: {
            type: Type.OBJECT,
            description: "Simple mental model (metaphor + 3-step logic). Use 'Imagine if…' analogies.",
            properties: {
                metaphor: { type: Type.STRING, description: "A simple metaphor or analogy to explain the concept." },
                logic: { type: Type.STRING, description: "A simplified 3-step explanation of how it works in plain English." }
            },
            required: ['metaphor', 'logic']
        },
        evidenceAndLimits: { type: Type.STRING, description: "Summarize key tables, evals, or caveats. Point out dataset bias, generalization limits, or small-sample issues." },
        productImplications: {
            type: Type.OBJECT,
            description: "How this could shift user experience, metrics, infrastructure, and team organization.",
            properties: {
                userExperience: { type: Type.STRING, description: "Impact on user experience (new capabilities, less friction)." },
                metrics: { type: Type.STRING, description: "Impact on key metrics (retention, latency, trust)." },
                infra: { type: Type.STRING, description: "Impact on infrastructure (compute, cost, privacy trade-offs)." },
                teamOrg: { type: Type.STRING, description: "Impact on team organization (new skills or tooling needed)." }
            },
            required: ['userExperience', 'metrics', 'infra', 'teamOrg']
        },
        realWorldApplications: {
            type: Type.ARRAY,
            description: "Practical applications and analogies. Ground the paper in practical imagination, like 'This is like how Spotify’s Discover Weekly...' or 'A PM at Notion might apply this for...'.",
            items: { type: Type.STRING }
        },
        risksAndGuardrails: { type: Type.STRING, description: "Discuss bias, misuse, eval debt, legal constraints, hallucination types. End with a mitigation idea for each risk mentioned." },
        glossary: {
            type: Type.ARRAY,
            description: "5–10 key terms with metaphorical definitions (e.g., 'attention = spotlight').",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                },
                required: ['term', 'definition']
            }
        },
        questionsToAsk: {
            type: Type.ARRAY,
            description: "Questions to ask the paper's author or a tech lead for due diligence or roadmap discussions.",
            items: { type: Type.STRING }
        },
        citationsAndPullQuotes: {
            type: Type.ARRAY,
            description: "Key pull-quotes from the paper with section/page anchors.",
            items: {
                type: Type.OBJECT,
                properties: {
                    quote: { type: Type.STRING, description: "The direct quote." },
                    citation: { type: Type.STRING, description: "The source, e.g., Section 3.1, page 5." }
                },
                required: ['quote', 'citation']
            }
        }
    },
    required: ['executiveTldr', 'whatIsNew', 'howItWorks', 'evidenceAndLimits', 'productImplications', 'realWorldApplications', 'risksAndGuardrails', 'glossary', 'questionsToAsk', 'citationsAndPullQuotes']
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateSummary = async (
    paperText: string,
    onProgress: (message: string) => void
): Promise<PaperSummary> => {
    const prompt = `
You are an expert AI research analyst specializing in translating complex papers for product managers. Your task is to read the following research paper text and generate a structured summary based on the provided JSON schema. Focus on product implications, practical applications, and clear, concise explanations. Avoid overly technical jargon.

Here is the paper text:
---
${paperText}
---
`;

    const MAX_RETRIES = 3;
    let currentDelay = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const progressMessage = attempt > 1 
                ? `Model is busy. Retrying... (attempt ${attempt}/${MAX_RETRIES})` 
                : 'Analyzing paper with Gemini...';
            onProgress(progressMessage);

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: summarySchema,
                    temperature: 0.2,
                },
            });
            
            const jsonText = response.text.trim();
            try {
                const summary = JSON.parse(jsonText);
                return summary as PaperSummary;
            } catch (parseError) {
                 console.error("Failed to parse Gemini response:", jsonText);
                 throw new Error("The AI model returned an invalid response. Please try again.");
            }

        } catch (error) {
            console.error(`Gemini API call attempt ${attempt} failed:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);

            const isOverloaded = errorMessage.includes('503') || 
                                 errorMessage.includes('UNAVAILABLE') || 
                                 errorMessage.toLowerCase().includes('overloaded') ||
                                 errorMessage.toLowerCase().includes('rate limit');

            if (isOverloaded && attempt < MAX_RETRIES) {
                await delay(currentDelay);
                currentDelay *= 2;
                continue;
            } else {
                if (isOverloaded) {
                     throw new Error("The AI model is currently overloaded. Please try again in a few moments.");
                }
                throw new Error(`Failed to generate summary: ${errorMessage}`);
            }
        }
    }
    throw new Error("Failed to generate summary after multiple retries.");
};

const extractJsonFromMarkdown = (text: string): string => {
    const match = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (match && match[2]) {
        return match[2].trim();
    }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        return text.substring(startIndex, endIndex + 1).trim();
    }
    return text;
};

export const generateTrendingReport = async (
    onProgress: (message: string) => void
): Promise<TrendingReport> => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const prompt = `
You are the AI Paper Trend Tracker, a specialized agent that uses Google Search to find and summarize the top 5 most discussed AI research papers from the past 7 days.

**Execution Date:** ${formatDate(today)}
**Reporting Period:** ${formatDate(sevenDaysAgo)} to ${formatDate(today)}

**Your Task:**
1.  **Search & Collect:** Use Google Search to find AI/ML research papers (e.g., from arXiv, top conferences) that have generated significant discussion in the last 7 days.
2.  **Output:** Return the findings as a single JSON object inside a markdown code block. 
Include: intro, papers (array of title, url, highlightSummary, publishDate, whyTrending, stats), notes, reportDate.
`;

    const MAX_RETRIES = 3;
    let currentDelay = 2000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const progressMessage = attempt > 1 
                ? `Searching for trends... (attempt ${attempt}/${MAX_RETRIES})` 
                : 'Finding trending papers...';
            onProgress(progressMessage);

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                    temperature: 0.1,
                },
            });
            
            const rawText = response.text.trim();
            const jsonText = extractJsonFromMarkdown(rawText);

            try {
                const report = JSON.parse(jsonText) as TrendingReport;
                
                // Extract grounding metadata to satisfy "MUST list URLs" requirement
                const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (chunks) {
                  report.groundingSources = chunks
                    .filter(c => c.web)
                    .map(c => ({
                      title: c.web.title,
                      url: c.web.uri
                    }));
                }

                return report;
            } catch (parseError) {
                 console.error("Failed to parse Gemini response for trending report:", jsonText);
                 throw new Error("The AI model returned an invalid or incomplete JSON response. Please try again.");
            }

        } catch (error) {
            console.error(`Gemini API call attempt ${attempt} failed:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (attempt < MAX_RETRIES) {
                await delay(currentDelay);
                currentDelay *= 2;
                continue;
            }
            throw new Error(`Failed to generate trending report: ${errorMessage}`);
        }
    }
    throw new Error("Failed to generate trending report after multiple retries.");
};
