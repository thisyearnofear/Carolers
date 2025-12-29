'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Send, Loader, Zap, Search, Music, Users, Gift } from 'lucide-react';

interface ToolCall {
  tool: string;
  args: any;
  result: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
}

const TOOL_ICONS: Record<string, React.ComponentType<any>> = {
  searchCarols: Search,
  summarizeChat: Users,
  suggestSetlist: Music,
  addContribution: Gift
};

const TOOL_COLORS: Record<string, string> = {
  searchCarols: 'bg-blue-50 border-blue-200 text-blue-700',
  summarizeChat: 'bg-purple-50 border-purple-200 text-purple-700',
  suggestSetlist: 'bg-pink-50 border-pink-200 text-pink-700',
  addContribution: 'bg-green-50 border-green-200 text-green-700'
};

const TOOL_LABELS: Record<string, string> = {
  searchCarols: 'Carol Search',
  summarizeChat: 'Chat Summary',
  suggestSetlist: 'Setlist Generator',
  addContribution: 'Contribution Ideas'
};

interface AIAssistantProps {
  eventId: string;
}

export function AIAssistant({ eventId }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        toolCalls: data.toolCalls || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">AI Assistant</h2>
            <p className="text-xs text-slate-500">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="p-3 rounded-lg bg-slate-100">
                <Zap className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Welcome to AI Assistant</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ask me to search carols, summarize chat, suggest a setlist, or get contribution ideas.
                </p>
              </div>
              <div className="mt-4 space-y-2 w-full">
                <p className="text-xs font-medium text-slate-600">Try asking:</p>
                <button
                  onClick={() => setInput('Find upbeat carols for our event')}
                  className="w-full text-left text-xs p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  • Find upbeat carols for our event
                </button>
                <button
                  onClick={() => setInput('Suggest a 1-hour setlist')}
                  className="w-full text-left text-xs p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  • Suggest a 1-hour setlist
                </button>
                <button
                  onClick={() => setInput('What should people contribute?')}
                  className="w-full text-left text-xs p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  • What should people contribute?
                </button>
              </div>
            </motion.div>
          ) : (
            messages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${message.role === 'user' ? 'order-2' : ''}`}>
                  {/* Main message */}
                  <div
                    className={`rounded-lg px-4 py-2.5 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    {message.content}
                  </div>

                  {/* Tool calls visualization */}
                  {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.toolCalls.map((toolCall, toolIdx) => {
                        const Icon = TOOL_ICONS[toolCall.tool];
                        const colorClass = TOOL_COLORS[toolCall.tool];
                        const label = TOOL_LABELS[toolCall.tool];

                        return (
                          <motion.div
                            key={`${message.id}-tool-${toolIdx}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className={`rounded-lg border p-3 text-xs ${colorClass}`}
                          >
                            <div className="flex items-start gap-2">
                              {Icon && <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold mb-1">{label}</p>
                                
                                {/* Tool result summary */}
                                {toolCall.result?.success ? (
                                  <div className="space-y-1 text-opacity-90">
                                    {toolCall.result.count && (
                                      <p>Found {toolCall.result.count} results</p>
                                    )}
                                    {toolCall.result.setlist?.length && (
                                      <p>Generated setlist with {toolCall.result.setlist.length} songs</p>
                                    )}
                                    {toolCall.result.suggestions?.length && (
                                      <p>{toolCall.result.suggestions.length} suggestions available</p>
                                    )}
                                    {toolCall.result.summary && (
                                      <p className="truncate">Summarized recent chat activity</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-opacity-75">Tool execution details</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-lg rounded-bl-none px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about carols, setlists..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
