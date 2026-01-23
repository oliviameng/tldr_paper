import React, { useRef } from 'react';
import { LoadingSpinner, UploadIcon, PdfIcon, CloseIcon, TrendingIcon } from './icons';

interface InputFormProps {
  paperText: string;
  setPaperText: (text: string) => void;
  url: string;
  setUrl: (url: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  mode: 'text' | 'url' | 'file' | 'trending';
  setMode: (mode: 'text' | 'url' | 'file' | 'trending') => void;
  onSubmit: () => void;
  isLoading: boolean;
  loadingMessage: string;
}

const InputForm: React.FC<InputFormProps> = ({ 
  paperText, setPaperText, 
  url, setUrl, 
  file, setFile,
  mode, setMode, 
  onSubmit, isLoading, loadingMessage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModeChange = (newMode: 'text' | 'url' | 'file' | 'trending') => {
    if (mode !== newMode) {
      setUrl('');
      setPaperText('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setMode(newMode);
  };

  const isSubmitDisabled = isLoading || 
    (mode === 'text' && !paperText.trim()) || 
    (mode === 'url' && !url.trim()) ||
    (mode === 'file' && !file);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex border-b border-slate-300">
          <TabButton
            label="From URL"
            isActive={mode === 'url'}
            onClick={() => handleModeChange('url')}
          />
           <TabButton
            label="Upload PDF"
            isActive={mode === 'file'}
            onClick={() => handleModeChange('file')}
          />
          <TabButton
            label="Paste Text"
            isActive={mode === 'text'}
            onClick={() => handleModeChange('text')}
          />
          <TabButton
            label="Trending"
            isActive={mode === 'trending'}
            onClick={() => handleModeChange('trending')}
          />
        </div>
        <div className="py-6">
          {mode === 'trending' ? (
             <div>
                <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-center text-slate-500">
                        <TrendingIcon />
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-800">AI Paper Trend Tracker</h3>
                    <p className="mt-1 text-sm text-slate-600">
                        Discover the top 5 trending AI research papers from the past week.
                    </p>
                </div>
              </div>
          ) : mode === 'url' ? (
            <div>
              <label htmlFor="paper-url" className="block text-sm font-medium text-slate-600 mb-2">
                  Paste the URL of the research paper (e.g., from arXiv):
              </label>
              <input
                  type="url"
                  id="paper-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://arxiv.org/abs/..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200"
                  disabled={isLoading}
              />
            </div>
          ) : mode === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Upload the research paper directly:
              </label>
              {file ? (
                <div className="flex items-center justify-between p-3 bg-slate-100 border border-slate-300 rounded-md">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <PdfIcon />
                    <span className="truncate text-sm font-medium text-slate-700">{file.name}</span>
                  </div>
                  <button type="button" onClick={handleClearFile} className="text-slate-500 hover:text-slate-800 flex-shrink-0" title="Remove file">
                    <CloseIcon />
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <input
                    type="file"
                    id="paper-file-upload"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf,.pdf"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload PDF file"
                    disabled={isLoading}
                  />
                  <div className="w-full flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-slate-300 rounded-md text-slate-500 group-focus-within:border-slate-800 group-focus-within:text-slate-800 group-hover:border-slate-800 group-hover:text-slate-800 transition-colors" aria-hidden="true">
                    <UploadIcon />
                    <p className="mt-2 text-sm font-medium">Click to upload or drag & drop</p>
                    <p className="text-xs">PDF only</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
             <div>
                <label htmlFor="paper-text" className="block text-sm font-medium text-slate-600 mb-2">
                    Paste the full text of the research paper below:
                </label>
                <textarea
                    id="paper-text"
                    value={paperText}
                    onChange={(e) => setPaperText(e.target.value)}
                    placeholder="Start by pasting the text from an AI research paper here..."
                    className="w-full h-64 p-3 bg-white border border-slate-300 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all duration-200 resize-y"
                    disabled={isLoading}
                />
             </div>
          )}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={mode === 'trending' ? isLoading : isSubmitDisabled}
        className="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-slate-900 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="text-white" />
            {loadingMessage || (mode === 'trending' ? 'Searching...' : 'Decoding...')}
          </>
        ) : mode === 'trending' ? (
            'Find Trending Papers'
        ) : (
          'Decode Paper'
        )}
      </button>
    </form>
  );
};

const TabButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-1 pb-2 text-sm font-semibold uppercase tracking-widest transition-colors duration-200 mr-6 ${
        isActive
          ? 'border-b-2 border-slate-900 text-slate-900'
          : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800'
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );

export default InputForm;