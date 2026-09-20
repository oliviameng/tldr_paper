import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import {
  answerPaperQuestion,
  generateSummary,
  generateTrendingReport,
  type ChatMessage,
} from './gemini';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3001', 10);
const host = process.env.HOST ?? '127.0.0.1';
const maxPaperCharacters = 1_000_000;

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: '5mb', type: 'application/json' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before trying again.' },
});
app.use('/api', limiter);

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

app.post('/api/summary', async (request, response, next) => {
  try {
    if (!isBoundedString(request.body?.paperText, maxPaperCharacters)) {
      response.status(400).json({ error: 'Paper text is required and must be under 1,000,000 characters.' });
      return;
    }
    response.json(await generateSummary(request.body.paperText));
  } catch (error) {
    next(error);
  }
});

app.post('/api/trending', async (_request, response, next) => {
  try {
    response.json(await generateTrendingReport());
  } catch (error) {
    next(error);
  }
});

app.post('/api/chat', async (request, response, next) => {
  try {
    const { paperText, question } = request.body ?? {};
    if (!isBoundedString(paperText, maxPaperCharacters)) {
      response.status(400).json({ error: 'Paper text is required and must be under 1,000,000 characters.' });
      return;
    }
    if (!isBoundedString(question, 4_000)) {
      response.status(400).json({ error: 'A question under 4,000 characters is required.' });
      return;
    }

    const rawMessages = Array.isArray(request.body.messages) ? request.body.messages : [];
    const messages: ChatMessage[] = rawMessages.slice(-12).filter(
      (message: unknown): message is ChatMessage => {
        if (!message || typeof message !== 'object') return false;
        const candidate = message as Partial<ChatMessage>;
        return (
          (candidate.role === 'user' || candidate.role === 'model') &&
          typeof candidate.text === 'string' &&
          candidate.text.length <= 10_000
        );
      },
    );

    response.json({ answer: await answerPaperQuestion(paperText, messages, question) });
  } catch (error) {
    next(error);
  }
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API route not found.' });
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(currentDirectory, '..', 'dist');
app.use(express.static(distDirectory));
app.use((_request, response) => {
  response.sendFile(path.join(distDirectory, 'index.html'));
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const isMissingKey = error instanceof Error && error.message.includes('GEMINI_API_KEY');
  // Provider errors may include request details; never log or return their raw text.
  console.error(isMissingKey ? 'Gemini key is missing.' : 'AI request failed.');
  response.status(isMissingKey ? 503 : 500).json({
    error: isMissingKey
      ? 'The AI service is not configured.'
      : 'The AI service could not complete the request. Please try again.',
  });
});

app.listen(port, host, () => {
  console.log(`TLDR Paper server listening on http://${host}:${port}`);
});
