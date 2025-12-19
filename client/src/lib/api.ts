// MODULAR: Single source of truth for API calls
import { 
  type Event, type Carol, type Contribution, type Message,
  type InsertEvent, type InsertContribution, type InsertMessage
} from '@shared/schema';

const API_BASE = '/api';

// DRY: Generic fetch wrapper with error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// CLEAN: Domain-specific API modules
export const eventsAPI = {
  getAll: (): Promise<Event[]> => 
    apiRequest('/events'),

  getById: (id: string): Promise<Event> => 
    apiRequest(`/events/${id}`),

  create: (event: InsertEvent): Promise<Event> => 
    apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    }),

  join: (eventId: string, userId: string): Promise<{ success: boolean }> =>
    apiRequest('/events/join', {
      method: 'POST',
      body: JSON.stringify({ eventId, userId }),
    }),
};

export const carolsAPI = {
  getAll: (): Promise<Carol[]> => 
    apiRequest('/carols'),

  vote: (carolId: string): Promise<{ success: boolean }> =>
    apiRequest(`/carols/${carolId}/vote`, {
      method: 'POST',
    }),
};

export const contributionsAPI = {
  getByEvent: (eventId: string): Promise<Contribution[]> =>
    apiRequest(`/events/${eventId}/contributions`),

  create: (contribution: InsertContribution): Promise<Contribution> =>
    apiRequest('/contributions', {
      method: 'POST',
      body: JSON.stringify(contribution),
    }),
};

export const messagesAPI = {
  getByEvent: (eventId: string): Promise<Message[]> =>
    apiRequest(`/events/${eventId}/messages`),

  create: (message: InsertMessage): Promise<Message> =>
    apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    }),
};