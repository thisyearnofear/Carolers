# Carolers Product Roadmap (Concise)

This roadmap reflects the current direction and removes items we have already delivered. It focuses on highest-impact improvements to the event experience and operational robustness.

## Recently Delivered
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

## Phase 3: AI Assistant (Gemini)
Goal: Enable smart assistance inside chat.

- SDK & env
  - `@google/genai` client; `GEMINI_API_KEY` in env
- Server wrapper & safe tools
  - `/api/events/[id]/ai` with auth
  - Tooling (function-calling): `searchCarols`, `addContribution`, `summarizeChat`, `suggestSetlist`
- UX
  - `/ai <prompt>` in composer; AI replies as `ai` message type
  - Summaries and setlist suggestions on demand

Dependencies: API endpoint, basic rate-limiting, safe tool design.
Success: Higher-quality setlists and faster information recall.

## Phase 4: Live State + Verse Roulette Surfacing
Goal: Elevate live features during the event proper.

- Event state machine: `upcoming → live → ended`
- Live affordances
   - Compact Verse Roulette panel or inline generator while `live`
   - Countdown transitions to Live state automatically

Dependencies: minor state management.
Success: Live tools are front-and-center when needed, not before.

## Phase 5: Wikipedia-Style Collaborative Translation (Gemini 3 + DAO Governance)
Goal: Build a decentralized, community-owned carol translation library with Gemini 3 bootstrap and reputation-based voting.

### Architecture
- **Gemini 3 Bootstrap**: Initial carol translations generated on-demand, no pre-storage
- **Crowdsourced Refinement**: Community proposes edits, discusses, votes with reputation-weighted power
- **Canonical Translations**: Highest-voted versions become default; full edit history preserved
- **Reputation System**: Contributors earn rep points for approved translations/proposals → increased voting power
- **DAO Governance**: No crypto initially; lightweight reputation-based voting with optional moderator layer

### Tables & Schema
- `carol_translations`: Stores approved & canonical translations per language
- `translation_proposals`: Wikipedia-style proposal queue for edits with voting
- `proposal_votes`: Tracks votes with reputation-weighted voting power
- `contributor_reputation`: Tracks user language expertise, approval history, rep points
- `translation_history`: Full audit trail (like Wikipedia edit history)
- Extend `users`: Add `preferred_language` field

### Features
1. **Translation Discovery**
   - User selects language → app checks if translation exists
   - If missing: "Generate with Gemini 3" button (marked as AI-suggested)
   - If exists: Display canonical version with "View alternatives" or "Propose improvement"

2. **Proposal Workflow**
   - User submits alternative translation or edit with change reason
   - 7-day voting window; need >60% approval + 5+ quorum to merge
   - Voting power = 1 + floor(reputation / 100)
   - Transparency: all votes + discussion threads visible
   - Moderators (high-rep users) can fast-track obvious fixes

3. **Community Incentives**
   - Reputation earned per approved contribution (5pts per translation, 2pts per feedback)
   - Leaderboards per language
   - Contributor attribution on translation pages
   - (v2) Optional token rewards for Devpost credibility

### UX
- Translation view with language selector
- Proposal submission form with markdown editor + diff preview
- Discussion/voting thread (like GitHub pull requests)
- Contributor profile showing reputation, approved translations, language expertise
- "Compare versions" view (old vs new, highlighting changes)

### Devpost Positioning
- **Story**: Gemini 3 bootstrapped translations, but community governance ensures cultural accuracy
- **Unique angle**: Decentralized carol library; first music translation DAO
- **Scalability**: Works for unlimited languages; zero pre-storage
- **Network effects**: More users → more languages → more valuable for everyone

Dependencies: New schema tables, API endpoints for proposals/voting, UI for proposal workflow & contributor profiles, reputation calculation system.
Success: >20% of users propose/vote on translations; >5 languages fully managed by community.

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
