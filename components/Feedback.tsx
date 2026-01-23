
import React, { useState } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon } from './icons';

const Feedback: React.FC = () => {
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRating = (newRating: 'like' | 'dislike') => {
    setRating(newRating);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this feedback to a server
    console.log({
      rating,
      comment,
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8 border-t border-slate-300">
        <p className="font-semibold text-slate-700">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-300 pt-8 mt-8">
      <h3 className="text-lg font-semibold text-center text-slate-800 mb-4">Was this summary helpful?</h3>
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => handleRating('like')}
          className={`p-3 rounded-full transition-colors ${rating === 'like' ? 'bg-slate-800 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
          aria-pressed={rating === 'like'}
          title="Helpful"
        >
          <ThumbsUpIcon />
        </button>
        <button
          onClick={() => handleRating('dislike')}
          className={`p-3 rounded-full transition-colors ${rating === 'dislike' ? 'bg-slate-800 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
          aria-pressed={rating === 'dislike'}
          title="Not helpful"
        >
          <ThumbsDownIcon />
        </button>
      </div>
      {rating && (
        <form onSubmit={handleSubmit} className="mt-4 max-w-lg mx-auto animate-fade-in">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional: Tell us more..."
            className="w-full h-24 p-3 bg-white border border-slate-300 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all duration-200"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 disabled:bg-slate-300"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      )}
       <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Feedback;
