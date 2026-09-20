import type { PaperSummary, TrendingReport } from '../types';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? 'The server could not complete the request.');
  }
  return data as T;
}

export async function generateSummary(
  paperText: string,
  onProgress: (message: string) => void,
): Promise<PaperSummary> {
  onProgress('Analyzing paper with Gemini...');
  return postJson<PaperSummary>('/api/summary', { paperText });
}

export async function generateTrendingReport(
  onProgress: (message: string) => void,
): Promise<TrendingReport> {
  onProgress('Finding trending papers...');
  return postJson<TrendingReport>('/api/trending', {});
}

export async function askPaper(
  paperText: string,
  messages: ChatMessage[],
  question: string,
): Promise<string> {
  const result = await postJson<{ answer: string }>('/api/chat', {
    paperText,
    messages,
    question,
  });
  return result.answer;
}
