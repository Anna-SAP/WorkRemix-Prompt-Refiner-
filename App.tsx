
import React, { useState, useEffect } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import RefineOutput from './components/RefineOutput';
import HistorySidebar from './components/HistorySidebar';
import { geminiService } from './services/geminiService';
import { AttachedImage, AppStatus, HistoryItem } from './types';

const MAX_HISTORY_ITEMS = 50;
const STORAGE_KEY = 'prompt_refiner_history';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [images, setImages] = useState<AttachedImage[]>([]);
  const [outputContent, setOutputContent] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (original: string, refined: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      originalPrompt: original,
      refinedPrompt: refined,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const updated = [newItem, ...prev];
      return updated.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering selection
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const selectHistoryItem = (item: HistoryItem) => {
    if (status === AppStatus.GENERATING) return;
    
    setInputText(item.originalPrompt);
    setOutputContent(item.refinedPrompt);
    setImages([]); // History doesn't store heavy images for performance
    setStatus(AppStatus.COMPLETE);
    setIsHistoryOpen(false);
  };

  // Handle Global Paste for Images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const newImage: AttachedImage = {
                  id: crypto.randomUUID(),
                  data: event.target.result as string,
                  mimeType: blob.type
                };
                setImages(prev => [...prev, newImage]);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleRefine = async () => {
    if (!inputText.trim() && images.length === 0) return;

    setStatus(AppStatus.GENERATING);
    setOutputContent('');
    
    // We need to accumulate the text here to save it to history later
    // because outputContent state won't update synchronously inside the function
    let fullGeneratedText = '';

    try {
      await geminiService.refinePromptStream(
        inputText,
        images,
        (chunk) => {
          fullGeneratedText += chunk;
          setOutputContent(prev => prev + chunk);
        }
      );
      setStatus(AppStatus.COMPLETE);
      
      // Save to history after successful generation
      // We check if text is not empty to avoid saving failed empty states
      if (fullGeneratedText.trim()) {
        addToHistory(inputText, fullGeneratedText);
      }

    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
      setOutputContent(prev => prev + "\n\n[Error: Failed to generate response. Please try again.]");
    }
  };

  const handleStartOver = () => {
    if (inputText || images.length > 0 || outputContent) {
      if (window.confirm("Are you sure you want to clear everything and start over?")) {
        setInputText('');
        setImages([]);
        setOutputContent('');
        setStatus(AppStatus.IDLE);
      }
    } else {
       // Also reset if empty, just to be sure state is clean
       setInputText('');
       setImages([]);
       setOutputContent('');
       setStatus(AppStatus.IDLE);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleRefine();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-200 font-sans selection:bg-brand-500/30 selection:text-brand-100 relative">
      <Header 
        onReset={handleStartOver} 
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      <HistorySidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={selectHistoryItem}
        onDelete={deleteHistoryItem}
        onClearAll={clearHistory}
      />

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* Input Section */}
          <div className="flex flex-col h-full bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden p-6 relative">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">1</span>
              Raw Input
            </h2>
            
            <div className="flex-1 flex flex-col min-h-0">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you want the AI to do... (e.g., 'Write a blog post about coffee', 'Analyze this dashboard screenshot')"
                className="w-full flex-1 bg-transparent border-none resize-none focus:ring-0 text-slate-300 placeholder-slate-600 text-base leading-relaxed p-0 custom-scrollbar"
              />
              
              <ImageUploader images={images} setImages={setImages} />
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {images.length > 0 ? `${images.length} image(s) attached` : 'Paste images directly'}
              </span>
              <button
                onClick={handleRefine}
                disabled={status === AppStatus.GENERATING || (!inputText && images.length === 0)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-brand-900/20 ${
                  status === AppStatus.GENERATING
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-500 text-white hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {status === AppStatus.GENERATING ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Refine Prompt
                    <span className="text-xs font-normal opacity-70 ml-1 hidden sm:inline-block">
                      (⌘ + Enter)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col h-full bg-dark-surface rounded-2xl border border-dark-border shadow-xl overflow-hidden p-6 relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-purple-500 to-brand-600 opacity-20"></div>
             <RefineOutput content={outputContent} isStreaming={status === AppStatus.GENERATING} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
