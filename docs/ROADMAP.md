# Carolers Product Roadmap

## Vision
An intuitive, festive, holistic caroling experience that guides users through discovery → preparation → performance → celebration.

---

## Phase 1: BEFORE (Event Discovery & Preparation)
**Goal**: Excite users and prepare them to sing together.

### 1.1 Song Preview in Event Details [NEW]
- **Component**: `EventSongPreview` (enhancement to existing Room details tab)
- **Features**:
  - Show top 3-5 songs for the event
  - Display lyrics preview (first verse + chorus)
  - Energy level badges (low/medium/high)
  - Theme context ("Why these songs?")
- **User value**: Know what you're singing before you arrive

### 1.2 Prep Guide Modal [NEW]
- **Component**: `PrepGuideModal` (lazy-loaded on event hover or detail view)
- **Features**:
  - Theme explainer (e.g., "Hanukkah celebrates 8 nights of light")
  - "Learn these lyrics" CTA with difficulty levels
  - Vocal range guide ("soprano", "alto", "bass" suggestions)
  - "Bring this" reminders from contribution list
- **Trigger**: Event card hover or "Prepare" button in event details
- **User value**: Newcomers feel confident; singers mentally prepare

---

## Phase 2: DURING (Active Singing Experience)
**Goal**: Center the singing; make lyrics and coordination seamless.

### 2.1 Restructure Room UI [REFACTOR]
- **Current state**: Tabs (songs, details, contributions, chat) treat singing as optional
- **Target state**: Lyrics as hero, logistics as sidebar
- **Changes**:
  - Move "Vote on Songs" from tab to sticky header with quick-select buttons
  - Make lyrics modal default-open (or prominent "tap to see lyrics" overlay)
  - Right sidebar: "Who's here + contributions" (persistent, collapsible)
  - Bottom sheet: Chat (swipe up to message)
  - Full-screen song view option (ideal for group singing)

### 2.2 Create LyricsModal Component [NEW]
- **Component**: `LyricsModal.tsx`
- **Features**:
  - Full lyrics with verse/chorus/bridge structure
  - Large, readable font (mobile-first)
  - Highlight current verse (if matched to gamification)
  - Share snippet button
  - Print-friendly formatting
- **Accessibility**: Dark mode text size controls, high contrast
- **User value**: Crystal clear lyrics mid-performance; no squinting

### 2.3 Enhance VerseRoulette [UPGRADE]
- **Current state**: Random role assignment, loose connection to song
- **Target state**: Tied to actual song verses
- **Changes**:
  - Pull specific verse from `carol.lyrics` array
  - Display verse in modal + VerseRoulette card
  - Suggest harmony part based on role
  - Post-sing: "You nailed verse 3 as soprano!" celebration
- **User value**: Gamification feels integrated, not tacked-on

### 2.4 Add Audio Playback Preview [NICE-TO-HAVE]
- **Component**: Simple Spotify/YouTube embed in VoteCard or LyricsModal
- **Features**:
  - 30-sec clip or link to full song
  - Play melody reference
- **User value**: Harmony guides reference the actual tune
- **Note**: May require licensing; can defer to Phase 3

---

## Phase 3: AFTER (Memory & Celebration)
**Goal**: Capture the magic; encourage repeat engagement.

### 3.1 Event Recap Page [NEW]
- **Route**: `/events/:id/recap`
- **Components**:
  - `RecapHero`: Event name, date, theme, member count
  - `TopSongs`: Ranked list of most-voted songs
  - `MemberGrid`: Profile photos of all who attended
  - `Stats`: "2 hours, 15 songs, 8 traditions celebrated"
  - `SocialShare`: Shareable summary card
- **User value**: Celebrate together; prove it happened

### 3.2 Memories/Media Section [NEW]
- **Component**: `EventMemories` (placeholder for Phase 4)
- **Features**:
  - Photo gallery (upload after event)
  - Highlight reel (top moments)
  - Member testimonials ("That was amazing!")
- **User value**: Social proof; triggers FOMO for next event

### 3.3 Event Continuity [ENHANCE]
- **Features**:
  - "Plan next gathering" CTA on recap page
  - Auto-populate theme/venue/date suggestions
  - Invite same members with 1 click
- **User value**: Reduces friction for organizers; builds community

---

## Phase 4: Polish & Monetization (Future)
- Audio playback with licensing
- Photo uploads & shared albums
- Community event discovery
- Printable carol books
- PDF export of setlist + lyrics

---

## Architecture Principles
- **ENHANCEMENT FIRST**: Extend existing components (Room, VoteCard, EventCard)
- **DRY**: Single `carols` table with `lyrics` JSON; no duplicates
- **MODULAR**: LyricsModal, RecapPage, PrepGuide are isolated, composable
- **PERFORMANT**: Lyrics loaded once at app start; no per-carol API calls
- **ORGANIZED**: Domain-driven (before/, during/, after/ conceptual grouping in code)

---

## Execution Order

### Sprint 1: MVP (Weeks 1-2)
1. Seed lyrics data from mindprod.com
2. Create `LyricsModal.tsx`
3. Enhance `VoteCard` → link to modal
4. Integrate into `Room.tsx` (replace/enhance "songs" tab)
5. Test on mobile (primary use case)

### Sprint 2: Before & During Polish (Weeks 3-4)
1. Create `PrepGuideModal.tsx`
2. Add to EventCard hover/details
3. Refactor Room layout (hero lyrics, sidebar logistics)
4. Enhance VerseRoulette with actual verse display
5. Optimize Room mobile responsiveness

### Sprint 3: After & Celebration (Weeks 5-6)
1. Create `/events/:id/recap` page
2. Build `RecapHero`, `TopSongs`, `MemberGrid`, `Stats`
3. Add social share card
4. Add "plan next event" CTA
5. Polish transitions & animations

### Defer to Future
- Audio playback (licensing complexity)
- Photo uploads (storage costs)
- Advanced gamification (leaderboards, badges)

---

## Success Metrics
- **Before**: 70% of users preview songs before joining event
- **During**: 100% of songs have readable lyrics; 0 "what verse?" confusion
- **After**: 60% attend follow-up event within 30 days
- **Overall**: NPS > 8 (fun factor); app retention > 40% weekly active

---

## Design Principles
- **Festive**: Animations, colors, icons celebrate the season
- **Inclusive**: Multiple traditions (Christmas, Hanukkah, Easter, etc.)
- **Intuitive**: New users sing within 30 seconds of joining
- **Mobile-first**: Optimize for outdoor use (actual caroling venues)
- **Accessible**: Large text, high contrast, keyboard navigation

---

## ✅ Sprint 1 Completed

### Components Built
- **LyricsModal** (`client/src/components/LyricsModal.tsx`)
  - Full lyrics display with verse/chorus differentiation
  - Print and share functionality
  - Accessible, readable design
  
- **Enhanced VoteCard** (updated `client/src/components/VoteCard.tsx`)
  - Lyrics preview (first 2 lines)
  - "View Lyrics" button triggers modal
  - Prevents modal fatigue — no new modals added

### Pages Enhanced
- **Room Details Tab** (refactored `client/src/pages/Room.tsx`)
  - Theme explainer section
  - Song preview cards (ranked by votes)
  - Vocal range guide (Soprano/Alto/Tenor/Bass)
  - Unified BEFORE experience in existing tab structure

- **EventRecap Page** (new `client/src/pages/EventRecap.tsx`)
  - Hero section with trophy icon
  - Stats grid (singers, songs, votes, duration)
  - Top 3 songs with medal rankings
  - All songs list
  - Attendee section
  - Share recap and "Plan Next Event" CTAs
  
### Router Updates
- Added `/events/:eventId/recap` route

### UI/UX Improvements
- **No modal bloat**: Leveraged existing Room tab structure for prep
- **Cohesive flow**: Home → Event Details (prep) → Room (sing with lyrics) → Recap (celebrate)
- **Moved from transactional to emotional**: Focus on lyrics and celebration, not logistics

---

## Next Steps (User-Owned)
1. **Seed lyrics data**: Populate `carols` table with real songs from mindprod.com (public domain)
2. **Test end-to-end**: Walk through BEFORE → DURING → AFTER user journey
3. **Optimize mobile**: Test Room lyrics readability on actual phone (outdoor venue use)
4. **Gather feedback**: Validate vocal range guide, theme context, and celebration features
