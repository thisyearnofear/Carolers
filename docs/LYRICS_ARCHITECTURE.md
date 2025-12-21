# Enhanced Lyrics Architecture

## Vision
Transform lyrics from static text into an interactive, synchronized, real-time experience that embodies karaoke, lyrics video, and podcast aesthetics while maintaining Core Principles alignment.

## Core Principles Alignment

✅ **ENHANCEMENT FIRST**: Extend `LyricsModal` into `EnhancedLyricsViewer`—no new modal component
✅ **AGGRESSIVE CONSOLIDATION**: Single lyrics data structure; unified sync engine
✅ **PREVENT BLOAT**: Modular sub-components only for distinct concerns
✅ **DRY**: Shared `LyricsState` hook manages all sync/control logic
✅ **CLEAN**: Clear separation between data, display, controls, and playback
✅ **MODULAR**: Composable display modes, controls, sync layers
✅ **PERFORMANT**: Virtualized rendering for large lyrics, efficient re-renders
✅ **ORGANIZED**: Domain-driven structure under `/shared` and `/components/lyrics`

---

## Data Model (Single Source of Truth)

### Enhanced Carol Schema
```typescript
// shared/schema.ts - EXTEND existing carols table
export const carols = mysqlTable("carols", {
  // ... existing fields ...
  
  // NEW: Structured lyrics for sync
  lyricsStructured: json("lyrics_structured").$type<LyricsLine[]>(),
  duration: text("duration").notNull(), // "2:30" format
  
  // Metadata for display modes
  defaultDisplayMode: varchar("default_display_mode").default('progressive'),
  hasVocalParts: int("has_vocal_parts").default(0),
});

type LyricsLine = {
  index: number;           // Line sequence (0, 1, 2...)
  text: string;           // The actual lyric text
  type: 'lyric' | 'section' | 'direction'; // section=[Verse 1], direction=(chorus ad lib)
  sectionLabel?: string;  // "Verse 1", "Chorus", "Bridge"
  timing?: number;        // ms from song start (optional, for sync)
  vocalParts?: {          // Optional: assign parts
    [part: string]: boolean; // { soprano: true, alto: true }
  };
};
```

---

## Architecture Layers

### 1. **State Management** (`hooks/useLyricsState.ts`)
Single hook managing all lyrics playback logic
```typescript
useLyricsState({
  carol: Carol;
  isPlaying: boolean;
  currentTime: number; // ms
  speed: number; // 0.75, 1, 1.25, 1.5
  displayMode: 'progressive' | 'karaoke' | 'podcast' | 'full';
  fontSize: number; // scale 0.8-1.5
  lineSpacing: number; // scale 0.8-1.5
  highlightedIndex: number; // current line
  upcomingLines: number; // lines to preview
})
```

**Responsibilities:**
- Compute `highlightedIndex` based on `currentTime` and timing data
- Manage user controls (speed, size, spacing, mode)
- Auto-scroll to keep current line visible
- Handle playback sync

---

### 2. **Display Components** (Modular, Composable)

#### `EnhancedLyricsViewer` (Container)
Replaces `LyricsModal`—same interface, enhanced internals

**Sub-components by concern:**
- `LyricsDisplay` — Renders lines based on mode + scroll state
- `DisplayModeSelector` — Switch between karaoke/podcast/progressive/full
- `PlaybackControls` — Speed, size, spacing, current time slider
- `SectionNavigator` — Jump to verse/chorus
- `VocalPartAssigner` — Show/filter parts (if applicable)

Each sub-component receives data via props, no internal state—state lives in `useLyricsState`.

---

### 3. **Display Modes** (`lib/lyrics/display-modes.ts`)

Each mode is a pure function computing line styles + visibility:

```typescript
type DisplayMode = 'progressive' | 'karaoke' | 'podcast' | 'full';

const modeConfigs: Record<DisplayMode, {
  showAll: boolean;
  highlightCurrent: boolean;
  previewUpcoming: number;
  autoScroll: boolean;
  backgroundColor: string;
  layout: 'center' | 'left' | 'full';
  styling: (lineIndex: number, highlightedIndex: number) => string;
}>;
```

**Modes:**
- **Progressive**: One line at a time, reveals as song plays
- **Karaoke**: Current line large/centered, upcoming lines faded below
- **Podcast**: All lines visible, current highlighted, transcript-like
- **Full**: All lyrics visible, simple highlighting

---

### 4. **Sync Engine** (`lib/lyrics/sync.ts`)

Pure functions for timing logic:

```typescript
// Map playback time → line index
getHighlightedLineIndex(
  currentTimeMs: number,
  lyricsLines: LyricsLine[]
): number

// Get lines to preview
getUpcomingLines(
  currentLineIndex: number,
  lyricsLines: LyricsLine[],
  count: number
): LyricsLine[]

// Compute scroll position to keep current line centered
getScrollOffset(
  currentLineIndex: number,
  containerHeight: number,
  lineHeight: number
): number
```

**No playback logic here—just time-to-line mapping.**

---

### 5. **Playback Bridge** (Integration with Audio)

For now: `EnhancedLyricsViewer` accepts `currentTime` as prop from parent.

**Future:** Integrate with Howler.js when audio is added.

```typescript
// Pass from parent (e.g., CarolPlayer or EventRoom)
<EnhancedLyricsViewer
  carol={carol}
  currentTime={audioCurrentTime} // ms
  isPlaying={audioIsPlaying}
  onTimeChange={setAudioTime}
/>
```

---

## File Structure

```
shared/
  schema.ts                 # ENHANCE: Add lyricsStructured, extend carol table

lib/lyrics/
  display-modes.ts        # Mode configs and styling functions
  sync.ts                 # Time-to-line mapping logic
  vocal-parts.ts          # Part assignment utilities (if needed)

hooks/
  useLyricsState.ts       # Central state hook for all lyrics logic

components/lyrics/
  enhanced-lyrics-viewer.tsx  # Main component (replaces modal)
  lyrics-display.tsx          # Render lines by mode
  playback-controls.tsx       # Speed, size, spacing, time
  section-navigator.tsx       # Jump to verse/chorus
  display-mode-selector.tsx   # Mode switcher
  vocal-part-filter.tsx       # (Optional) Part selector
  
components/modals/
  lyrics-modal.tsx        # DELETE or deprecate—replaced by EnhancedLyricsViewer
```

---

## Implementation Phases

### Phase 1: Foundation (MVP)
- [ ] Extend carol schema with `lyricsStructured`
- [ ] Migration script to parse existing lyrics → structured format
- [ ] Implement `useLyricsState` hook
- [ ] Build `EnhancedLyricsViewer` with `progressive` mode
- [ ] Add `PlaybackControls` (speed, size, spacing)
- [ ] Replace `LyricsModal` in `CarolPlayer`

### Phase 2: Display Modes
- [ ] Implement karaoke, podcast, full modes
- [ ] Add `DisplayModeSelector`
- [ ] Mode-specific styling and layouts

### Phase 3: Navigation & Sync
- [ ] Build `SectionNavigator` (jump to verse/chorus)
- [ ] Add timing-based sync (if audio playback available)
- [ ] Implement `LyricsDisplay` virtualization for performance

### Phase 4: Vocal Parts & Social
- [ ] Build `VocalPartAssigner`
- [ ] Part-specific rendering and filtering
- [ ] (Future) Group sync and recording features

---

## Performance Considerations

1. **Virtualization**: `LyricsDisplay` renders only visible lines + buffer
2. **Memoization**: `useLyricsState` returns stable values between renders
3. **CSS-in-JS**: Use Tailwind classes, avoid inline styles for line-by-line rendering
4. **Debouncing**: Playback time updates debounced to avoid excessive re-renders
5. **Lazy parsing**: Only parse lyricsStructured on demand (not at page load)

---

## Accessibility

- High contrast mode option
- Dyslexia-friendly font toggle (OpenDyslexic)
- Keyboard navigation: arrow keys to move lines, space to play/pause
- Screen reader support: semantic HTML, ARIA labels
- Focus management within modal

---

## Success Criteria

✅ Lyrics feel like a rich, interactive experience (not just text)
✅ Multiple display modes support different learning/singing styles
✅ Smooth, jank-free playback sync
✅ All code modular, testable, and aligned with Core Principles
✅ No bloat—enhancement of existing patterns, not new paradigms
