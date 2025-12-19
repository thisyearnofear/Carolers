/**
 * MODULAR: Polling service for on-demand data refresh
 * PERFORMANT: Only fetches when needed, not on continuous interval
 * DRY: Single source of truth for polling logic
 */

import { eventsAPI, carolsAPI, messagesAPI, contributionsAPI } from './api';
import type { Event, Carol, Message, Contribution } from '@shared/schema';

export interface PollingService {
  refreshEvent: (eventId: string) => Promise<Event>;
  refreshCarols: () => Promise<Carol[]>;
  refreshMessages: (eventId: string) => Promise<Message[]>;
  refreshContributions: (eventId: string) => Promise<Contribution[]>;
}

export const pollingService: PollingService = {
  refreshEvent: async (eventId: string) => {
    return eventsAPI.getById(eventId);
  },

  refreshCarols: async () => {
    return carolsAPI.getAll();
  },

  refreshMessages: async (eventId: string) => {
    return messagesAPI.getByEvent(eventId);
  },

  refreshContributions: async (eventId: string) => {
    return contributionsAPI.getByEvent(eventId);
  },
};
