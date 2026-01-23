import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import ResultsPlaceholder from './components/ResultsPlaceholder';
import TrendingDisplay from './components/TrendingDisplay';
import Chatbot from './components/Chatbot';
import { generateSummary, generateTrendingReport } from './services/geminiService';
import { getTextFromUrl, extractTextFromPdf } from './services/urlScraper';
import type { PaperSummary, TrendingReport } from './types';
import { ErrorIcon } from './components/icons';

const App: React.FC = () => {
  const [paperText, setPaperText] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'text' | 'url' | 'file' | 'trending'>('url');
  const [summary, setSummary] = useState<PaperSummary | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userLogo, setUserLogo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('userLogo');
      if (savedLogo) {
        setUserLogo(savedLogo);
      }
    } catch (e) {
      console.error("Failed to read from localStorage:", e);
    }
  }, []);

  const handleLogoUpload = (logoDataUrl: string | null) => {
    try {
      if (logoDataUrl) {
        localStorage.setItem('userLogo', logoDataUrl);
        setUserLogo(logoDataUrl);
      } else {
        localStorage.removeItem('userLogo');
        setUserLogo(null);
      }
    } catch (e) {
        console.error("Failed to write to localStorage:", e);
        setError("Could not save your logo. Your browser's storage might be full or disabled.");
    }
  };


  const handleSubmit = useCallback(async () => {
    setError(null);
    setSummary(null);
    setTrendingData(null);

    if (isLoading) return;
    
    setIsLoading(true);

    try {
      if (mode === 'trending') {
        const result = await generateTrendingReport(setLoadingMessage);
        setTrendingData(result);
      } else {
        let textToSummarize = paperText;

        if (mode === 'url') {
          if (!url.trim()) {
            throw new Error("Please enter a URL to decode.");
          }
          setLoadingMessage('Fetching & parsing paper...');
          textToSummarize = await getTextFromUrl(url);
          setPaperText(textToSummarize); // Show the extracted text in the textarea
        } else if (mode === 'file') {
          if (!file) {
            throw new Error("Please select a PDF file to decode.");
          }
          setLoadingMessage('Parsing PDF...');
          const readFileAsUint8Array = (file: File): Promise<Uint8Array> => {
              return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                      if (reader.result instanceof ArrayBuffer) {
                          resolve(new Uint8Array(reader.result));
                      } else {
                          reject(new Error('Failed to read file as ArrayBuffer.'));
                      }
                  };
                  reader.onerror = (error) => reject(error);
                  reader.readAsArrayBuffer(file);
              });
          };
          const pdfData = await readFileAsUint8Array(file);
          textToSummarize = await extractTextFromPdf(pdfData);
          setPaperText(textToSummarize); // Show extracted text for user reference
        }


        if (!textToSummarize.trim()) {
          throw new Error("Could not extract any text to summarize. Please check the source or paste the text manually.");
        }
        
        const result = await generateSummary(textToSummarize, setLoadingMessage);
        setSummary(result);
      }

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred. Please check the console and try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [paperText, url, file, mode, isLoading]);

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <main className="flex flex-col md:flex-row gap-8 md:gap-16">
          {/* Left Column: Input */}
          <div className="w-full md:w-2/5 lg:w-1/3">
            <Header userLogo={userLogo} onLogoUpload={handleLogoUpload} />
            <div className="mt-8">
              <InputForm
                paperText={paperText}
                setPaperText={setPaperText}
                url={url}
                setUrl={setUrl}
                file={file}
                setFile={setFile}
                mode={mode}
                setMode={setMode}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
              />
              {error && (
                <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    <ErrorIcon />
                  </div>
                  <div>
                    <strong className="font-bold">Error!</strong>
                    <p className="block sm:inline ml-1">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="w-full md:w-3/5 lg:w-2/3">
             <div className="sticky top-8">
              {(() => {
                  if (isLoading) {
                    return <ResultsPlaceholder isLoading={true} loadingMessage={loadingMessage} />;
                  }
                  if (trendingData && mode === 'trending') {
                    return <TrendingDisplay data={trendingData} />;
                  }
                  if (summary && (mode === 'url' || mode === 'file' || mode === 'text')) {
                    return <ResultsDisplay summary={summary} />;
                  }
                  return <ResultsPlaceholder isLoading={false} loadingMessage="" />;
              })()}
             </div>
          </div>
        </main>
      </div>
      {summary && <Chatbot paperText={paperText} />}
    </div>
  );
};

export default App;