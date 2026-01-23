
# 🧭 TLDR Paper — PM Edition by Olivia Meng
follow me on substack https://substack.com/@oliviaxmeng?

**Decode any AI research paper into what a Product Manager can actually use.**

TLDR Paper is a specialized tool designed for Product Managers to bridge the gap between complex AI research and practical product strategy. It distills dense academic papers into structured, actionable insights focusing on user experience, metrics, and infrastructure.

## ✨ Features

- **Multi-Source Ingestion**: Input papers via URL (e.g., arXiv), PDF upload, or direct text paste.
- **PM-Centric Summarization**: Generates summaries covering "The Leap", metaphors for technical logic, product implications, and real-world applications.
- **Trend Tracker**: Discovers and summarizes the top 5 trending AI research papers of the week using Google Search grounding.
- **Interactive Chat**: Ask follow-up questions directly to the paper using an AI-powered research assistant.
- **Editable Reports**: Summaries are generated in an editable format, allowing you to refine and copy them as rich text or Markdown.
- **Custom Branding**: Upload your own logo to personalize the experience.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tldr-paper.git
   cd tldr-paper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`.
   - Add your Gemini API key to the `API_KEY` variable.

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API (Gemini 3 Pro & Flash)
- **PDF Processing**: PDF.js
- **Proxy**: Resilient fetching via CORS proxies for URL scraping.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
