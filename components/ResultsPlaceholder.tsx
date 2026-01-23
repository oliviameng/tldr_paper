import React from 'react';
import { LoadingSpinner, DocPlaceholderIcon } from './icons';

interface ResultsPlaceholderProps {
  isLoading: boolean;
  loadingMessage: string;
}

const ResultsPlaceholder: React.FC<ResultsPlaceholderProps> = ({ isLoading, loadingMessage }) => {
  const getSubMessage = () => {
    const lowerCaseMessage = loadingMessage.toLowerCase();
    if (lowerCaseMessage.includes('analyzing') || lowerCaseMessage.includes('retrying')) {
      return 'Decoding a full research paper can take up to a minute. Thanks for your patience!';
    }
    if (lowerCaseMessage.includes('fetching') || lowerCaseMessage.includes('parsing')) {
      return 'This depends on the file size and your connection speed.';
    }
    return 'This can sometimes take a moment...';
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-8 text-center">
      {isLoading ? (
        <div className="flex flex-col items-center text-slate-800">
          <LoadingSpinner className="w-8 h-8"/>
          <p className="mt-4 text-lg text-slate-700">{loadingMessage || 'Decoding...'}</p>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">{getSubMessage()}</p>
        </div>
      ) : (
        <>
          <div className="text-slate-300">
              <DocPlaceholderIcon />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-600">Your summary will appear here</h3>
          <p className="mt-2 text-slate-500">Enter text or a URL on the left and click "Decode Paper" to start.</p>
        </>
      )}
    </div>
  );
};

export default ResultsPlaceholder;