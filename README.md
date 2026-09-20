# TLDR Paper

**Read an AI research paper the way a product manager needs to: what changed, what it means for users, what it costs to ship.**

Most paper summaries are written for other researchers. TLDR Paper reads the same PDF and answers the questions a PM actually has: what is the leap, how would I explain it to my team, where does it change the product, and what infrastructure does it assume.

## What it does

- **Ingest from anywhere.** Paste an arXiv URL, upload a PDF, or paste raw text.
- **PM-centric summary.** Every paper comes back in the same structure: The Leap, a plain-language metaphor for the technical idea, product implications, and real-world applications.
- **Trend tracker.** Pulls the week's top trending AI papers with search grounding and summarizes them in the same format.
- **Ask the paper.** Follow-up chat grounded in the document you loaded.
- **Editable output.** Summaries render as editable text you can copy as rich text or Markdown into a doc or a Slack thread.
- **Your logo.** Upload one to brand the reports you share.

## Run it

You need Node.js 20.19+ (or 22.12+) and a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The key is read only by the Node server and is never included in the browser bundle.

```bash
git clone https://github.com/oliviameng/tldr_paper.git
cd tldr_paper
npm install
cp .env.example .env   # add your key to GEMINI_API_KEY
npm run dev
```

The web client runs on `http://localhost:3000` and proxies API requests to the server on port `3001`. For a production-style local run, use `npm run build && npm start` and open the server port. The server binds to `127.0.0.1` by default. For public deployment, provide authentication and persistent distributed rate limiting at an HTTPS gateway before setting `HOST=0.0.0.0`; the built-in per-IP limiter is only a local safeguard against abuse.

## Stack

React 19, Tailwind CSS, Node/Express, Google Gemini API (Gemini 3 Pro and Flash), PDF.js, CORS proxy fallback for URL fetching.

## Why this exists

Paper reading is a PM skill that almost no PM has time to practice. The bottleneck is not access to research, it is translation: turning a method section into a product decision. This tool encodes the translation step so it happens every time, in the same shape, instead of only when someone has a free afternoon.

More on how I think about AI deployment and product work at [Soft Intelligence on Substack](https://substack.com/@oliviaxmeng).

## License

MIT. See [LICENSE](LICENSE).

---

*Personal project. Built on my own time with my own tools; not affiliated with or endorsed by any employer.*
