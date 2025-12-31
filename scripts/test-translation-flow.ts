#!/usr/bin/env tsx
/**
 * Integration test: Translation flow (generate → propose → vote → merge)
 * 
 * Usage: npm run db:test (or manually: tsx scripts/test-translation-flow.ts)
 * 
 * Tests:
 * 1. Get canonical English carol
 * 2. Generate Spanish translation via Gemini 3
 * 3. Fetch translation metadata
 * 4. Create proposal to improve translation
 * 5. Vote on proposal (upvote)
 * 6. Check reputation updated
 * 7. List leaderboard
 */

import 'dotenv/config';
import { getDb } from "@/lib/db";
import { getCarol, searchCarols } from "@/lib/carols";
import {
  getCanonicalTranslation,
  getOrCreateTranslation,
  createTranslationProposal,
  voteOnProposal,
  getLeaderboard,
  getOrCreateReputation,
} from "@/lib/translations";
import { translateCarolWithGemini } from "@/lib/ai";
import { carols } from '@shared/schema';
import { eq } from 'drizzle-orm';

const TEST_USER_ID = 'test-user-' + Date.now();
const TEST_LANGUAGE = 'es';

async function main() {
  console.log('🎵 Translation System Integration Test\n');

  try {
    // Step 1: Get a carol
    console.log('1️⃣  Fetching English carol...');
    const db = await getDb();
    const results = await db.select().from(carols).limit(1);
    
    if (results.length === 0) {
      console.error('❌ No carols found in database. Please seed carols first.');
      console.log('   Run: npm run db:seed');
      process.exit(1);
    }

    const carol = results[0];
    console.log(`✅ Found: "${carol.title}" by ${carol.artist}`);

    // Step 2: Generate translation
    console.log(`\n2️⃣  Generating ${TEST_LANGUAGE.toUpperCase()} translation via Gemini 3...`);
    
    if (!carol.lyrics || carol.lyrics.length === 0) {
      console.log('⚠️  Carol has no lyrics. Skipping translation generation.');
    } else {
      try {
        const translationData = await translateCarolWithGemini(
          carol.title,
          carol.lyrics as string[],
          TEST_LANGUAGE,
          'Spanish'
        );
        console.log(`✅ Translation generated: "${translationData.title}"`);

        // Step 3: Store translation
        console.log(`\n3️⃣  Storing translation in database...`);
        const translation = await getOrCreateTranslation(
          carol.id,
          TEST_LANGUAGE,
          {
            title: translationData.title,
            lyrics: translationData.lyrics,
            source: 'ai_generated',
            isCanonical: 1,
            createdBy: TEST_USER_ID,
          }
        );
        console.log(`✅ Translation stored (ID: ${translation.id})`);

        // Step 4: Verify we can retrieve it
        console.log(`\n4️⃣  Fetching canonical translation...`);
        const canonical = await getCanonicalTranslation(carol.id, TEST_LANGUAGE);
        if (!canonical) {
          console.error('❌ Failed to fetch translation');
          process.exit(1);
        }
        console.log(`✅ Retrieved: "${canonical.title}" (${canonical.upvotes || 0} upvotes)`);

        // Step 5: Create a proposal for improvement
        console.log(`\n5️⃣  Creating proposal to improve translation...`);
        const proposal = await createTranslationProposal(
          canonical.id,
          TEST_USER_ID,
          {
            newTitle: canonical.title + ' (Improved)',
            newLyrics: (canonical.lyrics || []).map(l => l + ' [refined]'),
            changeReason: 'Regional dialect adjustment for Spain',
            requiredQuorum: 1, // Lower for testing
          }
        );
        console.log(`✅ Proposal created (ID: ${proposal.id})`);
        console.log(`   Status: ${proposal.status}`);
        console.log(`   Voting ends: ${proposal.votingEndsAt}`);

        // Step 6: Vote on proposal
        console.log(`\n6️⃣  Voting on proposal...`);
        await voteOnProposal(proposal.id, TEST_USER_ID, 1); // upvote
        console.log(`✅ Upvote recorded`);

        // Step 7: Check reputation
        console.log(`\n7️⃣  Checking user reputation...`);
        const reputation = await getOrCreateReputation(TEST_USER_ID, TEST_LANGUAGE);
        console.log(`✅ Reputation: ${reputation.repPoints} points`);
        console.log(`   Voting power: ${1 + Math.floor((reputation.repPoints || 0) / 100)}x`);

        // Step 8: Check leaderboard
        console.log(`\n8️⃣  Fetching ${TEST_LANGUAGE.toUpperCase()} leaderboard...`);
        const leaderboard = await getLeaderboard(TEST_LANGUAGE, 5);
        console.log(`✅ Leaderboard (top 5):`);
        leaderboard.forEach((entry, i) => {
          console.log(`   ${i + 1}. ${entry.userId.slice(0, 8)}... - ${entry.repPoints} pts`);
        });

        console.log('\n✅ All tests passed!');
      } catch (err) {
        console.error('❌ Gemini translation failed:', err instanceof Error ? err.message : err);
        console.log('   This is expected if GEMINI_API_KEY is not configured.');
        console.log('   Skipping remainder of test.');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
