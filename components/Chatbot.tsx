
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatIcon, CloseIcon, SendIcon, BotIcon, UserIcon, LoadingSpinner } from './icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  paperText: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ paperText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (paperText) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const newChat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: `You are a helpful research assistant. The user has just summarized a research paper and wants to ask questions about it. Answer the user's questions concisely based *only* on the provided paper text. If the answer is not in the text, say so.`,
            },
        });
        chatRef.current = newChat;
        setMessages([
          { role: 'model', text: 'I have read the paper. What would you like to know?' }
        ]);
        setError(null);
      } catch (e) {
        console.error("Failed to initialize chat:", e);
        setError("Could not start chat session.");
      }
    } else {
        chatRef.current = null;
        setMessages([]);
    }
  }, [paperText]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const chat = chatRef.current;
      const resultStream = await chat.sendMessageStream({ message: input });

      let fullResponse = '';
      let isFirstChunk = true;

      for await (const chunk of resultStream) {
        if (isFirstChunk) {
          setIsLoading(false);
          setMessages(prev => [...prev, { role: 'model', text: '' }]);
          isFirstChunk = false;
        }
        
        fullResponse += chunk.text;

        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'model') {
                 newMessages[newMessages.length - 1].text = fullResponse.trim();
            }
            return newMessages;
        });
      }

      if (isFirstChunk) {
        setIsLoading(false);
      }

    } catch (e) {
      setIsLoading(false);
      console.error("Error sending message:", e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I ran into a problem. Please try again.' }]);
    }
  };
  
  if (!paperText) {
    return null;
  }

  return (
    <>
      <div className={`fixed bottom-24 right-4 sm:right-8 w-[calc(100%-2rem)] max-w-md bg-white rounded-lg shadow-2xl shadow-indigo-500/20 border border-slate-200 transition-transform transition-opacity duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} z-40`}>
        <header className="flex items-center justify-between p-4 border-b border-indigo-700 bg-indigo-600 rounded-t-lg">
          <h3 className="font-bold text-white">Ask the Paper</h3>
          <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white" title="Close chat">
            <CloseIcon />
          </button>
        </header>

        <div className="p-4 h-80 overflow-y-auto bg-[#f8f7f4]">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center"><BotIcon /></div>}
                <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                 {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"><UserIcon /></div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center"><BotIcon /></div>
                <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-lg bg-slate-200 text-slate-800 rounded-bl-none flex items-center gap-2">
                  <LoadingSpinner className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-500 italic">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {error && <p className="p-2 text-xs text-center text-red-600 bg-red-100">{error}</p>}

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full p-2 pr-10 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button type="submit" className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-indigo-600 disabled:text-slate-300" disabled={isLoading || !input.trim()} title="Send message">
              <SendIcon />
            </button>
          </div>
        </form>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-8 z-50 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-transform hover:scale-110"
        title="Ask a question about the paper"
        aria-label="Toggle chat"
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  );
};

export default Chatbot;
