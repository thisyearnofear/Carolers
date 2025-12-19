import { create } from 'zustand';
import { produce } from 'immer';

export type Carol = {
  id: string;
  title: string;
  artist: string;
  tags: string[];
  duration: string;
  lyrics: string[]; // Simple array of lines/verses for now
  energy: 'low' | 'medium' | 'high';
  coverUrl?: string;
};

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
  playlist: string[]; // Array of carol IDs
  player: PlayerState;
  gamification: GamificationState;
  
  // Actions
  addToPlaylist: (carolId: string) => void;
  removeFromPlaylist: (carolId: string) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
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
    lyrics: [
      "Silent night, holy night!",
      "All is calm, all is bright.",
      "Round yon Virgin, Mother and Child.",
      "Holy infant so tender and mild,",
      "Sleep in heavenly peace,",
      "Sleep in heavenly peace."
    ]
  },
  {
    id: '2',
    title: 'Jingle Bells',
    artist: 'James Lord Pierpont',
    tags: ['upbeat', 'kids', 'fun'],
    duration: '2:35',
    energy: 'high',
    lyrics: [
      "Dashing through the snow",
      "In a one-horse open sleigh",
      "O'er the fields we go",
      "Laughing all the way",
      "Bells on bobtail ring",
      "Making spirits bright",
      "What fun it is to ride and sing",
      "A sleighing song tonight!"
    ]
  },
  {
    id: '3',
    title: 'Deck the Halls',
    artist: 'Traditional',
    tags: ['classic', 'upbeat', 'choral'],
    duration: '2:10',
    energy: 'high',
    lyrics: [
      "Deck the halls with boughs of holly",
      "Fa-la-la-la-la, la-la-la-la",
      "'Tis the season to be jolly",
      "Fa-la-la-la-la, la-la-la-la",
      "Don we now our gay apparel",
      "Fa-la-la, la-la-la, la-la-la",
      "Troll the ancient Yule-tide carol",
      "Fa-la-la-la-la, la-la-la-la"
    ]
  },
  {
    id: '4',
    title: 'O Holy Night',
    artist: 'Adolphe Adam',
    tags: ['powerful', 'vocal', 'sacred'],
    duration: '4:20',
    energy: 'medium',
    lyrics: [
      "O holy night, the stars are brightly shining",
      "It is the night of the dear Savior's birth",
      "Long lay the world in sin and error pining",
      "Till He appeared and the soul felt its worth"
    ]
  }
];

export const useStore = create<Store>((set) => ({
  carols: MOCK_CAROLS,
  playlist: ['1', '2'], // Default playlist
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

  addToPlaylist: (carolId) => set(produce((state: Store) => {
    if (!state.playlist.includes(carolId)) {
      state.playlist.push(carolId);
    }
  })),

  removeFromPlaylist: (carolId) => set(produce((state: Store) => {
    state.playlist = state.playlist.filter(id => id !== carolId);
  })),

  reorderPlaylist: (fromIndex, toIndex) => set(produce((state: Store) => {
    const [removed] = state.playlist.splice(fromIndex, 1);
    state.playlist.splice(toIndex, 0, removed);
  })),

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
