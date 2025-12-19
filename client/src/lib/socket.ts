// MODULAR: Single source of truth for socket functionality
import { io, type Socket } from 'socket.io-client';
import { type Message } from '@shared/schema';

class SocketService {
  private socket: Socket | null = null;
  private eventId: string | null = null;

  // CLEAN: Initialize connection with lazy loading
  private ensureConnection(): Socket {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_SERVER_URL || '', {
        transports: ['websocket', 'polling']
      });
    }
    return this.socket;
  }

  // DRY: Reusable connection setup
  joinEvent(eventId: string) {
    const socket = this.ensureConnection();
    this.eventId = eventId;
    socket.emit('join-event', eventId);
  }

  // Real-time messaging
  sendMessage(memberId: string, text: string) {
    if (!this.eventId) {
      console.warn('Must join an event before sending messages');
      return;
    }
    
    const socket = this.ensureConnection();
    socket.emit('send-message', {
      eventId: this.eventId,
      memberId,
      text
    });
  }

  onNewMessage(callback: (message: Message) => void) {
    const socket = this.ensureConnection();
    socket.on('new-message', callback);
    return () => socket.off('new-message', callback);
  }

  // Real-time voting
  voteForCarol(carolId: string) {
    if (!this.eventId) {
      console.warn('Must join an event before voting');
      return;
    }

    const socket = this.ensureConnection();
    socket.emit('vote-carol', {
      carolId,
      eventId: this.eventId
    });
  }

  onCarolVoted(callback: (data: { carolId: string, votes: number }) => void) {
    const socket = this.ensureConnection();
    socket.on('carol-voted', callback);
    return () => socket.off('carol-voted', callback);
  }

  // Error handling
  onError(callback: (error: { message: string }) => void) {
    const socket = this.ensureConnection();
    socket.on('error', callback);
    return () => socket.off('error', callback);
  }

  // CLEAN: Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.eventId = null;
    }
  }
}

// PERFORMANT: Single instance
export const socketService = new SocketService();