# Wikipedia-Style Collaborative Translation System

## Overview

Carolers now supports **community-owned, Gemini 3-bootstrapped carol translations** in any language. The system combines:

- **Gemini 3 Translation Engine**: Generates initial translations on-demand (no pre-storage)
- **Wikipedia-Style Proposals**: Users propose improvements, edits, and variants
- **Reputation-Based DAO**: Community votes with voting power weighted by language expertise
- **Audit Trail**: Full history like Wikipedia's edit tracking

## Architecture

### Core Tables

```
carol_translations       → Approved & canonical versions per language
translation_proposals   → Pending edits with voting
proposal_votes         → Reputation-weighted votes
contributor_reputation → User expertise per language
translation_history    → Full audit trail
```

### Data Flow

```
1. User selects language
   ↓
2. Check if translation exists
   ├─ YES → Return canonical + alternatives
   └─ NO → Generate with Gemini 3 → Store as "AI-suggested"
   ↓
3. User proposes edit → Creates proposal with voting period
   ↓
4. Community votes (7 days)
   ├─ >60% approval + 5+ quorum → MERGE
   └─ < 60% → REJECT
   ↓
5. Merge updates translation + awards reputation to proposer
```

## API Endpoints

### Translation Requests

**POST `/api/carols/translate`**
Generate or retrieve a translation
```json
{
  "carolId": "carol-123",
  "language": "es",
  "languageName": "Spanish"
}
```

Response:
```json
{
  "success": true,
  "translation": {
    "id": "trans-456",
    "carolId": "carol-123",
    "language": "es",
    "title": "Noche Silenciosa",
    "lyrics": ["Noche silenciosa...", ...],
    "source": "ai_generated",
    "upvotes": 5,
    "downvotes": 0,
    "isCanonical": 1
  },
  "source": "ai_generated",
  "alternatives": []
}
```

**GET `/api/carols/translate?carolId=xxx&language=es`**
Retrieve existing translation without generating

### Proposals

**POST `/api/translations/proposals`**
Propose an edit to a translation
```json
{
  "translationId": "trans-456",
  "newTitle": "Noche Silenciosa (Variant)",
  "newLyrics": ["Noche silenciosa...", ...],
  "changeReason": "Regional dialect adjustment for Mexico"
}
```

**GET `/api/translations/proposals?translationId=xxx`**
List pending proposals for a translation

**POST `/api/translations/proposals/[id]/vote`**
Vote on a proposal
```json
{
  "vote": "upvote"  // or "downvote"
}
```

### Reputation & Leaderboard

**GET `/api/translations/contributors?language=es&limit=10`**
Get reputation leaderboard for a language

**POST `/api/translations/contributors`**
Get current user's reputation
```json
{
  "language": "es"
}
```

Response:
```json
{
  "success": true,
  "reputation": {
    "userId": "user-123",
    "language": "es",
    "translationsApproved": 3,
    "proposalsApproved": 1,
    "repPoints": 15,
    "isModerator": 0
  },
  "votingPower": 1  // 1 + floor(15 / 100) = 1.15, displayed as 1
}
```

## Reputation & Voting System

### Earning Reputation

| Action | Points |
|--------|--------|
| Translation approved | 5 pts |
| Proposal approved | 5 pts |
| (Future) Helpful feedback | 2 pts |

### Voting Power

```
votingPower = 1 + floor(repPoints / 100)
```

Examples:
- 0-99 pts → 1x voting power
- 100-199 pts → 2x voting power
- 200+ pts → 3x voting power

**First vote is always 1x power; reputation is earned through approved contributions.**

### Proposal Finalization

- **Voting period**: 7 days from creation
- **Approval threshold**: >60% upvotes + minimum 5 votes
- **Rejection**: Auto-rejects if quorum not met
- **Merge**: On approval, updates translation + awards 5 rep points to proposer + saves history

## AI Translation with Gemini 3

### Prompt Engineering

Gemini 3 is instructed to:

1. **Preserve singability** — Maintain rhythm and meter
2. **Respect rhyme** — Keep rhyme schemes where culturally appropriate
3. **Cultural accuracy** — Use idioms and references natural to the target language
4. **Structure preservation** — Maintain verse/chorus/bridge markers
5. **Clean output** — Return valid JSON only

### Limitations & Fallback

If Gemini 3 fails:
- Returns error with instruction to try later
- User can manually submit translation (no AI needed)
- Community will vote to improve AI version

## Community Moderation

### Moderators (v1)

High-reputation users (e.g., >300 pts) can be designated as moderators:
- Can fast-track obvious fixes (punctuation, formatting)
- Actions logged transparently
- Transparent moderation dashboard

### Prevention of Spam/Vandalism

1. **Reputation requirement** (future): Contribute 1 approved translation before proposing
2. **Discussion threads**: Community can discuss proposals before voting
3. **Voting threshold**: >60% + quorum prevents minority abuse
4. **Reversal**: Failed proposals stay in history but don't update translation

## UI Components (To Build)

### Translation Selector
```
[Language Dropdown ▼]
→ Shows available translations
→ "Generate Translation" button if missing
→ "View Alternatives" if >1 version
```

### Proposal Form
```
- Title editor
- Lyrics editor (with side-by-side diff)
- Change reason (required, 5-500 chars)
- "Submit Proposal" button
```

### Proposal Thread
```
- Proposal details
- Discussion comments (future)
- Voting section
  ├─ Current votes: 8 up, 2 down
  ├─ Voting power: 1x (0 pts)
  ├─ Time remaining: 5 days 3 hours
  └─ [Upvote] [Downvote] buttons
- Approval status
```

### Contributor Profile
```
- Username
- Language expertise (e.g., "Spanish, French, Italian")
- Stats: 5 translations approved, 2 proposals approved
- Reputation: 28 pts (1x voting power)
- Moderator badge (if applicable)
```

### Translation History
```
- "Compare versions" link
- Edit timeline with:
  ├─ Date
  ├─ Editor name
  ├─ Change summary
  └─ View full diff
```

## Example Workflow

### Scenario: Spanish Translation of "Silent Night"

**Step 1: Generate Translation**
```
User: Spanish [Language dropdown]
→ System: "No Spanish translation yet"
→ User: [Generate Translation button]
→ System: Calls Gemini 3, stores as ai_generated
```

**Step 2: Community Review**
```
User2: Sees Spanish "Noche Silenciosa"
→ Proposes: Regional variant for Mexico
→ Creates proposal with improved lyrics
→ Voting window opens (7 days)
```

**Step 3: Community Votes**
```
10 users vote (5 upvotes, 5 downvotes initially)
User3: votes up (1x power, total: 6 up)
User4: votes down (1x power, total: 5 down)
→ 6 up / 11 total = 54.5% (< 60%, not yet approved)
→ 3 more users upvote
→ 9 up / 14 total = 64.3% + quorum met → APPROVED
```

**Step 4: Merge**
```
Proposal merged
→ Translation updated to new lyrics
→ User2 awarded 5 rep points (now 0+5 = 5 pts)
→ Previous version saved in history
→ Canonical flag on new version
```

**Step 5: Leaderboard**
```
Spanish Leaderboard:
1. User2 - 5 pts (translated "Silent Night")
2. User4 - 0 pts (not yet contributed)
...
```

## Implementation Status

### Completed ✅
- [x] Database schema (all tables)
- [x] Zod validation schemas
- [x] Translation library functions (`lib/translations.ts`)
- [x] Gemini 3 translation function (`lib/ai.ts`)
- [x] API endpoints (translate, proposals, voting, contributors)
- [x] TypeScript types & inference

### To Build 🚧
- [ ] Frontend components (selector, proposal form, voting UI)
- [ ] Discussion/comments on proposals (optional v2)
- [ ] Admin moderator dashboard
- [ ] History browser/diff viewer
- [ ] Contributor profile pages
- [ ] Notification system (when proposal voted on)
- [ ] Batch operations (seed multiple translations)

### To Test 🧪
- [ ] End-to-end translation → proposal → approval flow
- [ ] Gemini 3 prompt quality (rhythm, rhyme, cultural fit)
- [ ] Reputation calculation edge cases
- [ ] Double-voting prevention
- [ ] Proposal finalization (edge cases)

## Devpost Submission Angle

**"Decentralized Carol Library with Gemini 3 + Community DAO"**

- **Problem**: One-size-fits-all carol apps ignore cultural diversity; users want to sing in their native language
- **Solution**: Gemini 3 generates initial translations, community refines them with Wikipedia-style voting
- **Innovation**:
  - ✅ Zero pre-storage (scalable to unlimited languages)
  - ✅ AI as kickstart, community as quality gate
  - ✅ Reputation-based DAO (no crypto, just meritocracy)
  - ✅ Network effects: more users = more languages = more valuable
- **Unique**: First music translation DAO; turns Carolers into a cultural platform

## Future Enhancements

### Phase 2
- Discussion threads on proposals
- Community moderation (fast-track fixes)
- Batch translation of entire carol libraries
- Rate translations after singing

### Phase 3
- Contributor badges (e.g., "Spanish Expert")
- Tokenomics (optional, for Devpost credibility)
- Multi-language search
- Translation quality scoring

### Phase 4
- Video tutorials on translating carols
- Grammar/lyric-focused feedback
- Integration with music streaming APIs
- Social sharing of translations
