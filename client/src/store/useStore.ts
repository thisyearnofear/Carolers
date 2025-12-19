import { create } from 'zustand';
import { produce } from 'immer';
// ENHANCEMENT FIRST: Use unified schema instead of duplicating types
import { type Event, type Carol, type Contribution, type Message } from '@shared/schema';
// ENHANCEMENT FIRST: Use real API instead of mock data
import { eventsAPI, carolsAPI, contributionsAPI, messagesAPI } from '@/lib/api';

export type PlayerState = {
  isPlaying: boolean;
  currentCarolId: string | null;
  progress: number;
  mode: 'library' | 'session';
};

export type GamificationState = {
  activeChallenge: string | null;
  assignedRole: string | null;
  points: number;
};

type Store = {
  carols: Carol[];
  events: Event[];
  contributions: Contribution[];
  messages: Message[];
  currentEventId: string | null;
  player: PlayerState;
  gamification: GamificationState;
  isLoading: boolean;
  error: string | null;
  
  // ENHANCEMENT FIRST: Real API actions instead of mock mutations
  loadEvents: () => Promise<void>;
  loadCarols: () => Promise<void>;
  loadEventData: (eventId: string) => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'members' | 'carols' | 'createdAt'>) => Promise<void>;
  joinEvent: (eventId: string, memberId: string) => Promise<void>;
  setCurrentEvent: (eventId: string | null) => void;
  voteForCarol: (eventId: string, carolId: string) => Promise<void>;
  addContribution: (eventId: string, contribution: Omit<Contribution, 'id' | 'createdAt'>) => Promise<void>;
  addMessage: (eventId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  
  // Playlist actions
  playCarol: (carolId: string) => void;
  togglePlay: () => void;
  setMode: (mode: 'library' | 'session') => void;
  triggerRoulette: () => void;
  addPoints: (amount: number) => void;
};

const MOCK_CAROLS: Carol[] = [
  {
    id: '1',
    title: 'Silent Night',
    artist: 'Traditional',
    tags: ['traditional', 'slow', 'peaceful'],
    duration: '3:15',
    energy: 'low',
    lyrics: ["Silent night, holy night!", "All is calm, all is bright.", "Round yon Virgin, Mother and Child.", "Holy infant so tender and mild,", "Sleep in heavenly peace,", "Sleep in heavenly peace."],
    votes: 8
  },
  {
    id: '2',
    title: 'Jingle Bells',
    artist: 'James Lord Pierpont',
    tags: ['upbeat', 'kids', 'fun'],
    duration: '2:35',
    energy: 'high',
    lyrics: ["Dashing through the snow", "In a one-horse open sleigh", "O'er the fields we go", "Laughing all the way", "Bells on bobtail ring", "Making spirits bright", "What fun it is to ride and sing", "A sleighing song tonight!"],
    votes: 12
  },
  {
    id: '3',
    title: 'Deck the Halls',
    artist: 'Traditional',
    tags: ['classic', 'upbeat', 'choral'],
    duration: '2:10',
    energy: 'high',
    lyrics: ["Deck the halls with boughs of holly", "Fa-la-la-la-la, la-la-la-la", "'Tis the season to be jolly", "Fa-la-la-la-la, la-la-la-la", "Don we now our gay apparel", "Fa-la-la, la-la-la, la-la-la", "Troll the ancient Yule-tide carol", "Fa-la-la-la-la, la-la-la-la"],
    votes: 10
  },
  {
    id: '4',
    title: 'O Holy Night',
    artist: 'Adolphe Adam',
    tags: ['powerful', 'vocal', 'sacred'],
    duration: '4:20',
    energy: 'medium',
    lyrics: ["O holy night, the stars are brightly shining", "It is the night of the dear Savior's birth", "Long lay the world in sin and error pining", "Till He appeared and the soul felt its worth"],
    votes: 6
  },
  {
    id: '5',
    title: 'Feliz Navidad',
    artist: 'José Feliciano',
    tags: ['latin', 'upbeat', 'fun'],
    duration: '2:55',
    energy: 'high',
    lyrics: ["Feliz Navidad, feliz Navidad", "Feliz Navidad, próspero año y felicidad", "I want to wish you a Merry Christmas", "With lots of presents to make you happy"],
    votes: 7
  }
];

const MOCK_EVENTS: Event[] = [
  {
    id: 'event1',
    name: 'Christmas Carol Gathering 2024',
    date: new Date(2024, 11, 25),
    theme: 'Christmas',
    venue: 'Central Park Amphitheater',
    description: 'Join us for a festive caroling event with hot cocoa and family!',
    members: ['user1', 'user2', 'user3'],
    carols: ['1', '2', '3', '4'],
    contributions: [
      { id: 'c1', memberId: 'user1', item: 'Hot Cocoa', status: 'confirmed' },
      { id: 'c2', memberId: 'user2', item: 'Cookies', status: 'proposed' }
    ],
    messages: []
  },
  {
    id: 'event2',
    name: 'Hanukkah Candle Lighting 2025',
    date: new Date(2025, 1, 15),
    theme: 'Hanukkah',
    venue: 'Community Center',
    description: 'Celebrate with traditional and modern Hanukkah songs',
    members: ['user1'],
    carols: ['5'],
    contributions: [],
    messages: []
  }
];

export const useStore = create<Store>((set) => ({
  carols: MOCK_CAROLS,
  events: MOCK_EVENTS,
  currentEventId: 'event1',
  player: {
    isPlaying: false,
    currentCarolId: null,
    progress: 0,
    mode: 'library'
  },
  gamification: {
    activeChallenge: null,
    assignedRole: null,
    points: 150
  },

  createEvent: (eventData) => set(produce((state: Store) => {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`,
      members: [],
      carols: [],
      contributions: [],
      messages: []
    };
    state.events.push(newEvent);
  })),

  joinEvent: (eventId, memberId) => set(produce((state: Store) => {
    const event = state.events.find(e => e.id === eventId);
    if (event && !event.members.includes(memberId)) {
      event.members.push(memberId);
    }
  })),

  setCurrentEvent: (eventId) => set(produce((state: Store) => {
    state.currentEventId = eventId;
  })),

  voteForCarol: async (eventId, carolId) => {
    await carolsAPI.vote(carolId);
    set(produce((state: Store) => {
      const event = state.events.find(e => e.id === eventId);
      if (event && !event.carols.includes(carolId)) {
        event.carols.push(carolId);
      }
      const carol = state.carols.find(c => c.id === carolId);
      if (carol) {
        carol.votes = (carol.votes || 0) + 1;
      }
    }));
  },

  addContribution: async (eventId, contribution) => {
    const result = await contributionsAPI.create(contribution);
    set(produce((state: Store) => {
      const event = state.events.find(e => e.id === eventId);
      if (event) {
        event.contributions.push(result);
      }
    }));
  },

  addMessage: async (eventId, message) => {
    const result = await messagesAPI.create(message);
    set(produce((state: Store) => {
      const event = state.events.find(e => e.id === eventId);
      if (event) {
        event.messages.push(result);
      }
    }));
  },

  playCarol: (carolId) => set(produce((state: Store) => {
    state.player.currentCarolId = carolId;
    state.player.isPlaying = true;
    state.player.mode = 'session';
  })),

  togglePlay: () => set(produce((state: Store) => {
    state.player.isPlaying = !state.player.isPlaying;
  })),

  setMode: (mode) => set(produce((state: Store) => {
    state.player.mode = mode;
  })),
  
  triggerRoulette: () => set(produce((state: Store) => {
    const roles = ['Soprano Solo', 'Bass Only', 'Everyone Clap', 'Humming Verse', 'Operatic Style'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    state.gamification.activeChallenge = 'Verse Roulette';
    state.gamification.assignedRole = randomRole;
  })),

  addPoints: (amount) => set(produce((state: Store) => {
    state.gamification.points += amount;
  }))
}));
