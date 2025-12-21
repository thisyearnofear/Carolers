'use client';

import { useState, useEffect, useRef } from 'react';
import { type Message, type Event } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSafeUser } from '@/hooks/use-safe-user';
import { Edit, X, Music, Megaphone, Search, Bot, Gift } from 'lucide-react';

interface EventMessagesProps {
  eventId: string;
  event: Event;
}

export function EventMessages({ eventId, event }: EventMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [commandMode, setCommandMode] = useState<'none' | 'addcarol' | 'announce' | 'ai' | 'contribute'>('none');
  const { user } = useSafeUser(); // Safe auth hook
  const [loading, setLoading] = useState(true);
  const [pinnedMessage, setPinnedMessage] = useState(event.pinnedMessage || '');
  const [editingPinned, setEditingPinned] = useState(false);
  const [newPinnedText, setNewPinnedText] = useState(event.pinnedMessage || '');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch(`/api/events/${eventId}/messages`);
        if (!response.ok) throw new Error('Failed to fetch');
        const messagesData = await response.json();
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadMessages();
    }
  }, [eventId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSavePinned = async () => {
    if (!user || user.id !== event.createdBy) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinnedMessage: newPinnedText
        })
      });

      if (!response.ok) throw new Error('Failed to update pinned message');
      
      setPinnedMessage(newPinnedText);
      setEditingPinned(false);
    } catch (error) {
      console.error('Failed to update pinned message:', error);
    }
  };

  const handleClearPinned = async () => {
    if (!user || user.id !== event.createdBy) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pinnedMessage: ''
        })
      });

      if (!response.ok) throw new Error('Failed to clear pinned message');
      
      setPinnedMessage('');
      setNewPinnedText('');
    } catch (error) {
      console.error('Failed to clear pinned message:', error);
    }
  };

  // Simple markdown rendering for pinned messages
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Show command palette when user types '/'
    if (value.startsWith('/')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }

    // Detect command mode
    if (value.startsWith('/addcarol ')) {
      setCommandMode('addcarol');
    } else if (value.startsWith('/announce ')) {
      setCommandMode('announce');
    } else if (value.startsWith('/ai ')) {
      setCommandMode('ai');
    } else if (value.startsWith('/contribute ')) {
      setCommandMode('contribute');
    } else {
      setCommandMode('none');
    }
  };

  const handleCommandSelect = (command: string) => {
    setNewMessage(command + ' ');
    setShowCommands(false);
    
    if (command === '/addcarol') {
      setCommandMode('addcarol');
    } else if (command === '/announce') {
      setCommandMode('announce');
    } else if (command === '/ai') {
      setCommandMode('ai');
    } else if (command === '/contribute') {
      setCommandMode('contribute');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      let messageType: 'text' | 'system' | 'carol' | 'poll' | 'ai' = 'text';
      let messageText = newMessage;
      let messagePayload = null;

      // Handle command messages
      if (commandMode === 'announce') {
        messageType = 'system';
        messageText = newMessage.replace('/announce ', '');
        messagePayload = { style: 'announcement' };
      } else if (commandMode === 'addcarol') {
        // Enhanced: Search for carols and allow adding to event
        const searchQuery = newMessage.replace('/addcarol ', '');
        
        try {
          // Call the carol search API
          const response = await fetch(`/api/carols/search?query=${encodeURIComponent(searchQuery)}`);
          
          if (response.ok) {
            const carols = await response.json();
            
            if (carols.length > 0) {
              // If exactly one carol found, add it to the event
              if (carols.length === 1) {
                const carol = carols[0];
                
                // Add carol to event
                const addResponse = await fetch(`/api/events/${eventId}/carols`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ carolId: carol.id })
                });
                
                if (addResponse.ok) {
                  const result = await addResponse.json();
                  messageType = 'text';
                  messageText = result.alreadyAdded 
                    ? `🎵 "${carol.title}" by ${carol.artist} is already in this event's setlist!`
                    : `🎵 Added "${carol.title}" by ${carol.artist} to the event setlist!`;
                } else {
                  messageType = 'text';
                  messageText = `🎵 Found "${carol.title}" by ${carol.artist} but couldn't add to event.`;
                }
              } else {
                // Multiple carols found - show search results
                messageType = 'text';
                messageText = `🎵 Found ${carols.length} carols matching "${searchQuery}":\n\n${carols.slice(0, 3).map((c: any) => `• ${c.title} by ${c.artist}`).join('\n')}\n\nUse a more specific search term to add a carol.`;
              }
            } else {
              messageType = 'text';
              messageText = `🎵 No carols found matching "${searchQuery}". Try a different search term.`;
            }
          } else {
            messageType = 'text';
            messageText = `🎵 Error searching for carols. Please try again.`;
          }
        } catch (error) {
          console.error('Failed to search or add carols:', error);
          messageType = 'text';
          messageText = `🎵 Error processing carol request. Please try again.`;
        }
      } else if (commandMode === 'ai' || commandMode === 'contribute') {
        // Call AI endpoint
        const prompt = newMessage.replace(commandMode === 'ai' ? '/ai ' : '/contribute ', '');
        const tool = commandMode === 'contribute' ? 'addContribution' : undefined;
        
        try {
          // Call the AI API
          const response = await fetch(`/api/events/${eventId}/ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: prompt,
              tool: tool
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            // The AI response will be posted as a separate message by the API
            const emoji = commandMode === 'ai' ? '🤖' : '🎁';
            messageType = 'text';
            messageText = `${emoji} ${commandMode} request: ${prompt}`;
          } else {
            const emoji = commandMode === 'ai' ? '🤖' : '🎁';
            messageType = 'text';
            messageText = `${emoji} Error processing request. Please try again.`;
          }
        } catch (error) {
          console.error(`Failed to call AI API for ${commandMode}:`, error);
          const emoji = commandMode === 'ai' ? '🤖' : '🎁';
          messageType = 'text';
          messageText = `${emoji} Error processing request. Please try again.`;
        }
      }

      const response = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: user.id,
          text: messageText,
          type: messageType,
          payload: messagePayload
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      const message = await response.json();

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setCommandMode('none');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const isHost = user?.id === event.createdBy;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Messages</CardTitle>
        {isHost && !editingPinned && !pinnedMessage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingPinned(true)}
            className="text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Add Pinned Message
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 relative">
            <div className="flex justify-between items-start">
              <div className="text-sm font-medium text-blue-800 prose max-w-none" 
                   dangerouslySetInnerHTML={{ __html: renderMarkdown(pinnedMessage) }} />
              {isHost && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNewPinnedText(pinnedMessage);
                      setEditingPinned(true);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearPinned}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pinned Message Editor */}
        {isHost && editingPinned && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <textarea
              value={newPinnedText}
              onChange={(e) => setNewPinnedText(e.target.value)}
              placeholder="Write a pinned message...\nSupports *italic*, **bold**, and `code` formatting"
              className="w-full p-2 border rounded-md mb-2 text-sm"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                onClick={handleSavePinned}
                disabled={!newPinnedText.trim()}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPinned(false);
                  setNewPinnedText(pinnedMessage || '');
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Tip: Use *italic*, **bold**, or `code` formatting
            </div>
          </div>
        )}

        <div 
          className="h-64 overflow-y-auto mb-4 space-y-3 pr-2"
          role="log"
          aria-live="polite"
          aria-label="Event messages"
        >
           {messages.map((message: any) => {
            const displayName = message.userName || (message.memberId === user?.id ? 'You' : `User ${message.memberId.substring(0, 8)}`);
            
            // Handle different message types
            if (message.type === 'system') {
              return (
                <div key={message.id} className="flex flex-col items-center">
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 max-w-xs md:max-w-md w-full text-center">
                    <div className="text-sm font-bold text-blue-800 mb-1">📢 ANNOUNCEMENT</div>
                    <div className="text-sm text-blue-700">{message.text}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              );
            } else if (message.type === 'ai') {
              return (
                <div key={message.id} className="flex flex-col items-start">
                  <div className="p-2 bg-purple-50 rounded-lg border border-purple-200 max-w-xs md:max-w-md w-full">
                    <div className="text-sm font-bold text-purple-800 mb-1">🤖 AI ASSISTANT</div>
                    <div className="text-sm text-purple-700 whitespace-pre-wrap">{message.text}</div>
                    {message.payload && (
                      <div className="mt-2 text-xs text-purple-600">
                        {JSON.stringify(message.payload, null, 2)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={message.id} className="flex flex-col">
                <div className="text-sm font-medium text-muted-foreground">
                  {displayName} <span className="text-xs">- {new Date(message.timestamp || Date.now()).toLocaleTimeString()}</span>
                </div>
                <div className="p-2 bg-muted rounded-lg max-w-xs md:max-w-md">
                  {message.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Command Palette */}
        {showCommands && (
          <div className="absolute bottom-12 left-0 right-0 bg-white border rounded-lg shadow-lg p-2 z-10 max-w-md">
            <div className="space-y-1">
              <button
                onClick={() => handleCommandSelect('/addcarol')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded w-full text-left text-sm"
              >
                <Music className="h-4 w-4 text-primary" />
                <span>/addcarol</span>
                <span className="text-xs text-gray-500 ml-auto">Suggest a carol</span>
              </button>
              <button
                onClick={() => handleCommandSelect('/announce')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded w-full text-left text-sm"
              >
                <Megaphone className="h-4 w-4 text-primary" />
                <span>/announce</span>
                <span className="text-xs text-gray-500 ml-auto">Make an announcement</span>
              </button>
              <button
                onClick={() => handleCommandSelect('/ai')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded w-full text-left text-sm"
              >
                <Bot className="h-4 w-4 text-primary" />
                <span>/ai</span>
                <span className="text-xs text-gray-500 ml-auto">Ask AI assistant</span>
              </button>
              <button
                onClick={() => handleCommandSelect('/contribute')}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded w-full text-left text-sm"
              >
                <Gift className="h-4 w-4 text-primary" />
                <span>/contribute</span>
                <span className="text-xs text-gray-500 ml-auto">Suggest contributions</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder={commandMode === 'none' ? "Type your message..." : 
                         commandMode === 'addcarol' ? "Search for a carol..." : 
                         commandMode === 'announce' ? "Write your announcement..." : 
                         commandMode === 'ai' ? "Ask AI assistant..." : 
                         "Describe what you need..."}
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  );
}