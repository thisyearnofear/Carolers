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

## Architecture

- **Client**: React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Server**: Express.js + Clerk auth
- **Database**: PlanetScale MySQL + Drizzle ORM
- **Real-time**: Socket.io for live events

## Project Structure

```
client/          # React frontend
server/          # Express backend
shared/          # Unified schemas & types
script/          # Database & utility scripts
docs/            # Documentation
```

## Documentation

- **[ROADMAP.md](docs/ROADMAP.md)** — Product vision, phases, and completion status
- **[DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md)** — Database setup and schema
- **[CLERK_AUTHENTICATION.md](docs/CLERK_AUTHENTICATION.md)** — Auth configuration

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

## Next Steps

1. Seed `carols` table with public-domain lyrics from [mindprod.com](https://www.mindprod.com/carol/carols.html)
2. Test end-to-end user flow
3. Optimize mobile experience for outdoor venues
4. Gather community feedback

## Development

See [ROADMAP.md](docs/ROADMAP.md) for current sprint status and planned features.

---

**Built with ❤️ for singers everywhere.**
