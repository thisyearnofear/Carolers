# Carolers

An intuitive, festive app for gathering singers to celebrate together. Create events, vote on songs, coordinate contributions, and capture the joy of caroling—before, during, and after.

## Quick Start

```bash
npm install
npm run dev:client    # Start client at http://localhost:5000
npm run dev           # Start server in another terminal
```

## Features

- **Event Discovery**: Create or join caroling gatherings
- **Song Voting**: Democratically choose which carols to sing
- **Lyrics Hub**: Full lyrics display, optimized for outdoor venues (print & share)
- **Prep Guide**: Theme context, song previews, vocal range guidance
- **Event Recap**: Celebrate together with stats, top songs, and social sharing
- **Coordination**: Chat, contributions tracking, gamification
- **AI-Powered Planning**: Gemini 3 reasoning for smart setlist suggestions and event planning
- **Carol Insights**: Deep cultural & historical analysis of carols using extended thinking
- **Multilingual Translations**: High-quality translations preserving rhythm and cultural context
- **Create Carols**: Generate original carols with Suno AI (lyrics + composition) for community events

## Architecture

- **Client**: React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Server**: Next.js App Router + Clerk auth + Vercel deployment
- **Database**: TiDB Serverless MySQL + Drizzle ORM
- **AI**: Gemini 3 Pro/Flash Preview for reasoning, recommendations, and translations
- **Real-time**: On-demand polling (no WebSocket complexity)

## Project Structure

```
client/          # React frontend
server/          # Express backend
shared/          # Unified schemas & types
script/          # Database & utility scripts
docs/            # Documentation
```

## Why Gemini 3?

| Feature | Gemini 3 | GPT-4o | Claude 3.5 |
|---------|----------|--------|-----------|
| **Extended Thinking** | ✅ Native | ❌ (o1 separate) | ❌ |
| **Reasoning Transparency** | ✅ Visible in UI | ⚠️ Hidden | ❌ |
| **Multimodal (Vision)** | ✅ 81% MMMU-Pro | ⚠️ 73% | ⚠️ 75% |
| **Cost (per 1M tokens)** | $3 Flash | $15 | $15 |
| **Context Window** | 1M | 128k | 200k |

**Carolers uniquely leverages Gemini 3's native extended thinking** to provide expert-level musical analysis. Users see the reasoning process—understanding why they get specific guidance. This transparency and depth is exclusive to Gemini 3.

### Key Innovation
The **Deep Analysis Panel** displays model reasoning in the UI for transparency. This makes AI more trustworthy and educational—users understand not just "what" but "why."

## Documentation

- **[ROADMAP.md](docs/ROADMAP.md)** — Product vision and Gemini 3 implementation details ⭐ **START HERE** (Phase 3)
- **[DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)** — Database setup and schema
- **[CLERK_AUTHENTICATION.md](docs/CLERK_AUTHENTICATION.md)** — Auth configuration
- **[TRANSLATION_SYSTEM.md](docs/TRANSLATION_SYSTEM.md)** — Multilingual translation architecture

## Design Principles

- **ENHANCEMENT FIRST**: Extend existing components over creating new ones
- **AGGRESSIVE CONSOLIDATION**: Delete unnecessary code
- **PREVENT BLOAT**: Audit before adding features
- **DRY**: Single source of truth
- **CLEAN**: Clear separation of concerns
- **MODULAR**: Composable, testable, independent modules
- **PERFORMANT**: Adaptive loading and caching
- **ORGANIZED**: Predictable structure, domain-driven design

## User Experience

The app guides users through three phases:

1. **BEFORE** — Prepare & discover (event details, song previews, vocal range guide)
2. **DURING** — Sing together (lyrics modal, voting, coordination)
3. **AFTER** — Celebrate & remember (recap page, social sharing, plan next event)

## Getting Started

### Setup Suno AI Integration

1. Get your Suno API key: https://sunoapi.org/dashboard
2. Add to `.env.local`:
   ```env
   SUNO_API_KEY=your_api_key_here
   CRON_SECRET=your_cron_secret_here  # For background polling
   ```
3. Run migrations: `npm run db:push`
4. Navigate to `/songs` and click "Create Carol"

#### Suno API Optimization

The integration is optimized for reliability and performance:

- **Smart Rate Limiting**: Respects Suno's 20 requests/10 seconds limit with automatic throttling
- **Intelligent Polling**: Progressive intervals based on generation phase (PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS)
- **Error Recovery**: Automatic retries with exponential backoff for transient failures
- **Model Selection**: 
  - V5 (default): Best for emotional expression in carols
  - V4: Faster generation for demos
  - V4_5PLUS: Extended duration up to 8 minutes
- **Status Tracking**: Real-time updates with proper error handling
- **Batch Processing**: Efficient background polling for multiple generations

See [DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md) for detailed setup.

## Next Steps

1. Test carol creation with real users
2. Monitor Suno API usage and costs (rate limits: 20 req/10s)
3. Set up cron job for `/api/carols/poll-generations` (recommended: every 30 seconds)
4. Optimize mobile experience for outdoor venues
5. Gather community feedback on carol generation
6. Plan monetization strategy based on user metrics

## Development

See [ROADMAP.md](docs/ROADMAP.md) for current sprint status and planned features.

---

**Built with ❤️ for singers everywhere.**
