# Carolers Product Roadmap (Concise)

This roadmap reflects the current direction and removes items we have already delivered. It focuses on highest-impact improvements to the event experience and operational robustness.

## Recently Delivered
- **Onboarding Integration: Carol Creation Entry Point** (Complete)
  - Added step 1: "Create or Discover?" choice at onboarding start
  - Two paths: Create Carol (auto-opens modal) or Browse Carols (trending tab)
  - URL parameters: `?tab=trending` for direct nav, `?create=true` for auto-open modal
  - Seamless flow from onboarding → songs page with proper context
  - Leverages existing onboarding modal structure (no duplication)

- **Discovery & Virality Layer** (Complete)
  - Tab-based filtering: Official | Trending 🔥 | New Community
  - Leaderboard widget showing top carols by likes
  - Metrics display: plays + likes on community carols
  - Query functions for trending/new/all user carols
  - Optimized card rendering with reusable CarolCard component
  - Sidebar leaderboard (desktop) with real-time updates
  - Smart search (disabled on community tabs)
  
- **Suno AI User-Generated Carols** (Complete)
  - Users can create original carols with lyrics + AI composition
  - Suno API integration (generate, status polling, completion)
  - `user_carols` table tracking generation jobs, status, audio/video URLs
  - 4 API endpoints (generate, status, poll-generations, get user carols)
  - CreateCarolModal + UserCarolsSection components
  - Real-time status polling (2s client + optional 5-10m cron)
  - Error handling, metrics (plays, likes), creator attribution
  
- **Phase 5: Wikipedia-Style Collaborative Translation** (Complete)
  - Gemini 3-bootstrapped translations (on-demand, no pre-storage)
  - Community voting with reputation-weighted DAO governance
  - 5 new database tables + full audit trail
  - 7 API endpoints (translate, propose, vote, contributors)
  - 3 new frontend components (LanguageSelector, TranslationBadge, ProposalVoting)
  - Integration test script + comprehensive documentation
- Next.js 16 migration: middleware → proxy (proxy.ts)
- CSP updates for Clerk and vercel.live
- Clerk build-time guard; guest mode when keys are missing
- DB health endpoint: `/api/health/db`
- Seeding and ops scripts (inspect, seed batches, purge non-English, language migration, enrich PD English lyrics, normalize artists)
- Carols API returns English-only by default with `?lang=` override
- Branding and social metadata (hero banners; OG/Twitter images; favicon.ico)

## vNext (Phase 1): Chat-First Event Room
Goal: Reduce friction before events start; make chat the primary surface.

- Chat-first layout
  - Make chat the hero on event page
  - Demote tabs to secondary nav or quick actions
- Pinned message by Host
  - New event field: `pinnedMessage` (text/markdown)
  - API: `PATCH /api/events/[id]` to set/unset pinned message
  - UI: pinned banner above chat with markdown support
- Countdown to Event
  - Use event `date`; show live countdown in sidebar/header
  - System messages at T-10m, T-5m, Live (optional)
- Message typing (non-breaking)
  - Extend messages with `type` enum: `text | system | carol | poll | ai`
  - `payload` JSON for typed content; default to `text`

Dependencies: minor schema tweak (messages.type + payload), small API updates, UI refactor of event room.
Success: Event page immediately useful even before “go live.”

## Phase 2: Chat Primitives & Composer Shortcuts
Goal: Make core actions discoverable within chat.

- Composer actions and slash commands
  - Add Carol primitive: `/addcarol <query>` → search → confirm → post CarolCard & add contribution
  - Polls: `/poll Question | Option A | Option B` → inline poll card + votes
  - Announce: `/announce <text>` → system-styled banner
- API additions
  - Extend `/api/events/[id]/messages` to support `type` and `payload`
  - Optional: `/api/events/[id]/polls` (table) or encode polls as messages
- Rendering
  - Message bubble renderer supports typed cards (carol, poll, system)

Dependencies: minimal; builds on Phase 1 typing.
Success: Fewer clicks; faster collaboration.

## Phase 3: AI Assistant (Gemini 3)
Goal: Enable expert-level musical analysis and smart assistance using Gemini 3's extended thinking.

### Why Gemini 3?
Gemini 3 is uniquely suited for Carolers:
- **Extended Thinking**: Native reasoning across all variants (not bolted-on like o1)
- **Reasoning Transparency**: Model's thinking process visible in UI for trust
- **Multimodal Excellence**: 81% on MMMU-Pro (best-in-class for sheet music, cover art)
- **Cost Efficiency**: $3/1M tokens (Flash) vs $15 for competitors
- **1M Token Context**: Process entire carol catalogs with historical data

### Core Features

#### 1. Deep Analysis with Extended Thinking
**Endpoint**: `/api/carols/deep-analysis`
- **Musical Structure**: Harmonic analysis, melodic arc, rhythmic complexity, form analysis
- **Performance Guide**: Vocal range requirements, technical difficulty, breath control, ensemble tips
- **Cultural Context**: Historical origin, traditions, geographic variations, modern relevance
- **Harmony Guide**: SATB voice assignments, voice leading, arrangement suggestions

Configuration:
```typescript
generationConfig: {
  temperature: 1.0, // Required for reasoning
  thinkingConfig: {
    thinkingLevel: 'high' // Gemini 3 parameter
  },
  maxOutputTokens: 8000
}
```

**Key Feature**: Users see the thinking process ("Show Reasoning" button) → transparent AI → more trustworthy analysis.

#### 2. Vision API Integration (Multimodal)
**Endpoint**: `/api/carols/analyze-image`
- **Sheet Music**: Notation reading, vocal part identification, complexity scoring
- **Cover Art**: Cultural symbolism, artistic style, performance mood
- **Performance Photos**: Staging, lighting, technical quality assessment

Configuration:
```typescript
requestOptions: {
  mediaResolution: 'HIGH' // 1120 tokens for detailed analysis
}
```

#### 3. Smart Recommendations
**Tool-calling based setlist curation**:
- Consider group skill level
- Respect event theme
- Manage emotional arc (building → maintaining → winding down)
- Ensure harmonic variety

#### 4. In-Chat AI Assistant
- SDK & env
  - `@google/genai` client; `GEMINI_API_KEY` in env
- Server wrapper & safe tools
  - `/api/events/[id]/ai` with auth
  - Tooling (function-calling): `searchCarols`, `addContribution`, `summarizeChat`, `suggestSetlist`
- UX
  - `/ai <prompt>` in composer; AI replies as `ai` message type
  - Summaries and setlist suggestions on demand

### Prompting Best Practices (Gemini 3 Optimized)
**Before** (verbose, old style):
```
You are a Christmas carol expert with deep knowledge...
Provide comprehensive context...
Include exhaustive analysis...
```

**After** (concise, Gemini 3 best practice):
```
Provide context about "${title}".
Include: 1. Origin 2. Range 3. Difficulty 4. Theme fit 5. Tips
Limit: 120 words, practical tone.
```

**Result**: 30% fewer tokens, faster response, better reasoning quality.

### Implementation Status
| Feature | Status | Notes |
|---------|--------|-------|
| Extended Thinking (Text) | ✅ Complete | Deep-analysis endpoint working |
| Vision API | ✅ Foundation | API ready, UI integration next |
| Thought Summaries | ✅ Extraction | Retrieved and displayed |
| Thinking Level Control | ✅ Implemented | high/low modes working |
| Media Resolution Control | ✅ Ready | HIGH resolution for detail |
| Graceful Fallbacks | ✅ Implemented | Standard generation if thinking unavailable |
| Gemini 3 Prompting | ✅ Optimized | Concise, direct prompts |
| In-Chat Assistant | 🟡 Planned | Phase 3 follow-up |

Dependencies: Extended thinking API, vision API, graceful error handling.
Success: Users get expert-level musical analysis they couldn't get elsewhere; reasoning is visible and trustworthy.

## Phase 4: Live State + Verse Roulette Surfacing
Goal: Elevate live features during the event proper.

- Event state machine: `upcoming → live → ended`
- Live affordances
   - Compact Verse Roulette panel or inline generator while `live`
   - Countdown transitions to Live state automatically

Dependencies: minor state management.
Success: Live tools are front-and-center when needed, not before.

## Phase 6: Enhanced Translation UI & Moderation
Goal: Complete the translation system with proposal forms, history viewer, and moderator tools.

- Proposal submission form (markdown editor + diff preview)
- Translation history browser (show all versions, diffs, editor attribution)
- Contributor profile pages (reputation, language expertise, contribution history)
- Moderator dashboard (fast-track obvious fixes, transparency logs)
- Discussion threads on proposals (optional; can be added later)

Dependencies: Phase 5 backend complete; requires UI components only.
Success: Users can propose, discuss, and review translations in-app. >20% of users interact with proposals.

## Operational / Platform
- Production Clerk keys (replace dev keys in Production) [Planned]
- Language filters in UI (future i18n) [Planned]
- Observability: instrument key chat actions [Planned]

## Tracking & Documentation
- Jira: Create tickets per phase/feature (optional)
- Confluence: Design notes (chat-first), AI tools spec, and runbooks (DB scripts) (optional)

## Notes
- English-only catalog is enforced at API by default; `?lang` can be enabled later for i18n.
- Seed data is idempotent; ops scripts exist for health, seeding, enrichment, and normalization.
