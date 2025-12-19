'use client';

import { useState, useEffect, useRef } from 'react';
import { type Message } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useUser } from '@clerk/nextjs';
import { getEventMessages, addMessage } from '@/lib/messages';

interface EventMessagesProps {
  eventId: string;
}

export function EventMessages({ eventId }: EventMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useUser(); // Clerk client-side hook
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messagesData = await getEventMessages(eventId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user) return;

    try {
      const message = await addMessage({
        eventId,
        memberId: user.id,
        text: newMessage
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
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
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto mb-4 space-y-3 pr-2">
          {messages.map((message) => {
            // In a real app you'd fetch the user name by memberId
            const displayName = message.memberId === user?.id ? 'You' : `User ${message.memberId.substring(0, 8)}`;
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

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  );
}