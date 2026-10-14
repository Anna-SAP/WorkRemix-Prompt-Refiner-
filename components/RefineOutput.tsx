import React, { useState } from 'react';
import { Copy, Check, Zap, Terminal } from 'lucide-react';

interface RefineOutputProps {
  content: string;
  isStreaming: boolean;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-brand-500/20 bg-[#0b1221] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-brand-400" />
          <span className="text-xs text-brand-200/60 font-mono uppercase">{language || 'MARKDOWN'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors text-xs text-slate-400 hover:text-white group"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="group-hover:text-brand-200 transition-colors" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-sm font-mono text-brand-50/90 whitespace-pre-wrap leading-relaxed">{code}</pre>
      </div>
    </div>
  );
};

const RefineOutput: React.FC<RefineOutputProps> = ({ content, isStreaming }) => {
  const [globalCopied, setGlobalCopied] = useState(false);

  const handleGlobalCopy = () => {
    navigator.clipboard.writeText(content);
    setGlobalCopied(true);
    setTimeout(() => setGlobalCopied(false), 2000);
  };

  const renderParsedContent = () => {
    if (!content) return null;

    // Regex to capture code blocks: ```lang ... ```
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }

      // Code block
      parts.push({
        type: 'code',
        language: match[1],
        content: match[2]
      });

      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts.map((part, index) => {
      const isLast = index === parts.length - 1;
      
      if (part.type === 'code') {
        return <CodeBlock key={index} code={part.content} language={part.language} />;
      } else {
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part.content}
            {isLast && isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-brand-400 animate-pulse align-middle" />
            )}
          </span>
        );
      }
    });
  };

  if (!content) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border-2 border-dashed border-dark-border rounded-xl">
        <Zap className="w-12 h-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">Ready to Refine</h3>
        <p className="text-sm max-w-xs">
          Enter your idea on the left, add optional screenshots, and watch the magic happen here.
        </p>
      </div>
    );
  }

  // If we haven't found any closed code blocks yet, just render as text to handle streaming smoothly
  const hasCodeBlock = content.includes('```') && /```[\s\S]*```/.test(content);

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-300 flex items-center gap-2">
          <Zap size={18} />
          Refined Result
        </h2>
        <button
          onClick={handleGlobalCopy}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border hover:bg-dark-border transition-colors text-xs text-slate-300 font-medium"
        >
          {globalCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {globalCopied ? 'Copied Full Text' : 'Copy Full Text'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-dark-surface/50 p-6 rounded-xl border border-dark-border shadow-inner min-h-[100px] text-slate-300 font-mono text-sm leading-relaxed">
           {hasCodeBlock ? renderParsedContent() : (
             <div className="whitespace-pre-wrap">
               {content}
               {isStreaming && (
                 <span className="inline-block w-2 h-4 ml-1 bg-brand-400 animate-pulse align-middle" />
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default RefineOutput;