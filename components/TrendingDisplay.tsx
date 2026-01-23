
import React from 'react';
import type { TrendingReport } from '../types';
import { CalendarIcon, SparklesIcon, StatsIcon, InfoIcon } from './icons';

// A simple animation component
const FadeIn: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => {
        setIsMounted(true);
    }, []);
    return (
        <div className={`transition-opacity duration-700 ease-in ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            {children}
        </div>
    );
}


const TrendingDisplay: React.FC<{ data: TrendingReport }> = ({ data }) => {
  return (
    <div className="max-h-[calc(100vh-4rem)] overflow-y-auto pr-4 -mr-4">
      <FadeIn>
        <div className="bg-white rounded-lg border border-slate-200 p-6 md:p-8">
            <header className="border-b border-slate-200 pb-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-serif font-semibold text-green-700 flex items-center gap-2">
                    AI Paper Trend Report
                    <span className="rocket-animation">🚀</span>
                </h1>
                <p className="mt-1 text-slate-600">{data.intro}</p>
            </header>
            
            <div className="space-y-6">
              {data.papers.length > 0 ? data.papers.map((paper, index) => (
                <article key={index} className="bg-slate-50/50 border border-slate-200/80 rounded-lg p-5 transition-shadow hover:shadow-md">
                    <header className="mb-3">
                        <h2 className="text-xl font-serif font-semibold text-green-700 leading-tight">
                            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-900 hover:underline decoration-green-400 underline-offset-2 transition-colors">
                                {paper.title}
                            </a>
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                           <CalendarIcon />
                           <span>Published: {paper.publishDate}</span>
                        </div>
                    </header>
                    <div className="space-y-3 text-sm text-slate-700">
                        <p>{paper.highlightSummary}</p>
                        <div className="flex items-start gap-3 bg-slate-100 p-3 rounded-md">
                            <div className="flex-shrink-0 text-slate-600 pt-0.5"><SparklesIcon /></div>
                            <div>
                                <strong className="font-semibold text-slate-800">Why it's trending:</strong> {paper.whyTrending}
                            </div>
                        </div>
                         <div className="flex items-start gap-3 bg-slate-100 p-3 rounded-md">
                            <div className="flex-shrink-0 text-slate-600 pt-0.5"><StatsIcon /></div>
                            <div>
                                <strong className="font-semibold text-slate-800">Engagement Stats:</strong> {paper.stats}
                            </div>
                        </div>
                    </div>
                </article>
              )) : (
                <div className="text-center py-8 text-slate-500">
                    <p>No significant trending papers found for this period.</p>
                </div>
              )}
            </div>

            {data.groundingSources && data.groundingSources.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <InfoIcon /> Verified Sources & Search Results
                </h3>
                <ul className="space-y-2">
                  {data.groundingSources.map((source, idx) => (
                    <li key={idx} className="text-xs">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-500 hover:text-green-700 hover:underline transition-colors block truncate"
                      >
                        • {source.title || source.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <footer className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500">
                <p>{data.notes}</p>
                <p>Report generated on: {data.reportDate}</p>
            </footer>
        </div>
      </FadeIn>
      <style>{`
        .rocket-animation {
            display: inline-block;
            animation: launch 1.5s ease-in-out infinite;
        }
        @keyframes launch {
            0% { transform: translateY(0) rotate(0); opacity: 1; }
            50% { transform: translateY(-10px) rotate(45deg); opacity: 0.8; }
            100% { transform: translateY(0) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TrendingDisplay;
