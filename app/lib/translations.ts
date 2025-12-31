import 'server-only';
import { getDb } from './db';
import {
  carolTranslations,
  translationProposals,
  proposalVotes,
  contributorReputation,
  translationHistory,
  type CarolTranslation,
  type TranslationProposal,
  type ContributorReputation,
  type InsertCarolTranslation,
  type InsertTranslationProposal,
  type InsertProposalVote,
} from '@shared/schema';
import { eq, and, or, sql, desc, gte } from 'drizzle-orm';

/**
 * Get canonical translation for a carol in a specific language
 * Returns highest-voted version marked as canonical
 */
export async function getCanonicalTranslation(
  carolId: string,
  language: string
): Promise<CarolTranslation | null> {
  try {
    const db = await getDb();
    const result = await db
      .select()
      .from(carolTranslations)
      .where(
        and(
          eq(carolTranslations.carolId, carolId),
          eq(carolTranslations.language, language),
          eq(carolTranslations.isCanonical, 1)
        )
      )
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error(`Failed to fetch canonical translation for ${carolId} in ${language}:`, error);
    return null;
  }
}

/**
 * Get all translations for a carol in a specific language
 * Returns all versions (canonical + alternatives), sorted by upvotes
 */
export async function getTranslationsForCarol(
  carolId: string,
  language: string
): Promise<CarolTranslation[]> {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(carolTranslations)
      .where(
        and(
          eq(carolTranslations.carolId, carolId),
          eq(carolTranslations.language, language)
        )
      )
      .orderBy(desc(carolTranslations.upvotes));
  } catch (error) {
    console.error(`Failed to fetch translations for ${carolId}:`, error);
    return [];
  }
}

/**
 * Create or retrieve a translation (for Gemini bootstrap)
 * If translation exists, return it; otherwise create AI-generated version
 */
export async function getOrCreateTranslation(
  carolId: string,
  language: string,
  data: Omit<InsertCarolTranslation, 'carolId' | 'language'>
): Promise<CarolTranslation> {
  try {
    const db = await getDb();

    // Check if translation already exists
    const existing = await db
      .select()
      .from(carolTranslations)
      .where(
        and(
          eq(carolTranslations.carolId, carolId),
          eq(carolTranslations.language, language)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new AI-generated translation
    const newTranslation: typeof carolTranslations.$inferInsert = {
      ...data,
      carolId,
      language,
      source: 'ai_generated',
      isCanonical: 1, // Initially canonical until community votes
      lyrics: data.lyrics ? (Array.from(data.lyrics) as string[]) : undefined,
    };

    const result = await db
      .insert(carolTranslations)
      .values(newTranslation)
      .$returningId();

    // Fetch and return created translation
    const created = await db
      .select()
      .from(carolTranslations)
      .where(eq(carolTranslations.id, result[0].id))
      .limit(1);

    return created[0];
  } catch (error) {
    console.error(`Failed to get or create translation for ${carolId}:`, error);
    throw error;
  }
}

/**
 * Create a proposal to edit or improve a translation
 */
export async function createTranslationProposal(
  translationId: string,
  proposedBy: string,
  data: Omit<InsertTranslationProposal, 'translationId' | 'proposedBy' | 'votingEndsAt'>
): Promise<TranslationProposal> {
  try {
    const db = await getDb();

    // Set voting end date to 7 days from now
    const votingEndsAt = new Date();
    votingEndsAt.setDate(votingEndsAt.getDate() + 7);

    const proposal: typeof translationProposals.$inferInsert = {
      ...data,
      translationId,
      proposedBy,
      votingEndsAt,
      status: 'pending',
      newLyrics: data.newLyrics ? (Array.from(data.newLyrics) as string[]) : undefined,
    };

    const result = await db
      .insert(translationProposals)
      .values(proposal)
      .$returningId();

    const created = await db
      .select()
      .from(translationProposals)
      .where(eq(translationProposals.id, result[0].id))
      .limit(1);

    return created[0];
  } catch (error) {
    console.error('Failed to create translation proposal:', error);
    throw error;
  }
}

/**
 * Vote on a translation proposal
 * Prevents double voting, applies reputation-weighted voting power
 */
export async function voteOnProposal(
  proposalId: string,
  userId: string,
  vote: -1 | 1
): Promise<void> {
  try {
    const db = await getDb();

    // Check if user already voted
    const existingVote = await db
      .select()
      .from(proposalVotes)
      .where(
        and(
          eq(proposalVotes.proposalId, proposalId),
          eq(proposalVotes.userId, userId)
        )
      )
      .limit(1);

    if (existingVote.length > 0) {
      throw new Error('User has already voted on this proposal');
    }

    // Get user's voting power based on reputation
    const reputation = await getOrCreateReputation(
      userId,
      'en' // Default to English, will be dynamic later
    );
    const votingPower = 1 + Math.floor((reputation.repPoints || 0) / 100);

    // Record vote
    const voteData: typeof proposalVotes.$inferInsert = {
      proposalId,
      userId,
      vote,
      votingPower,
    };

    await db.insert(proposalVotes).values(voteData);

    // Update proposal vote counts
    if (vote === 1) {
      await db
        .update(translationProposals)
        .set({ upvotes: sql`${translationProposals.upvotes} + ${votingPower}` })
        .where(eq(translationProposals.id, proposalId));
    } else {
      await db
        .update(translationProposals)
        .set({ downvotes: sql`${translationProposals.downvotes} + ${votingPower}` })
        .where(eq(translationProposals.id, proposalId));
    }
  } catch (error) {
    console.error('Failed to vote on proposal:', error);
    throw error;
  }
}

/**
 * Get or create reputation record for a user in a language
 */
export async function getOrCreateReputation(
  userId: string,
  language: string
): Promise<ContributorReputation> {
  try {
    const db = await getDb();

    const existing = await db
      .select()
      .from(contributorReputation)
      .where(
        and(
          eq(contributorReputation.userId, userId),
          eq(contributorReputation.language, language)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new reputation record
    const newRep = {
      userId,
      language,
      translationsApproved: 0,
      proposalsApproved: 0,
      repPoints: 0,
      isModerator: 0,
    };

    const result = await db
      .insert(contributorReputation)
      .values(newRep)
      .$returningId();

    const created = await db
      .select()
      .from(contributorReputation)
      .where(eq(contributorReputation.id, result[0].id))
      .limit(1);

    return created[0];
  } catch (error) {
    console.error(`Failed to get or create reputation for ${userId}:`, error);
    throw error;
  }
}

/**
 * Check if proposal voting period has ended and approve if qualified
 * Returns true if proposal was approved and merged
 */
export async function finalizeProposal(proposalId: string): Promise<boolean> {
  try {
    const db = await getDb();

    // Get proposal
    const proposal = await db
      .select()
      .from(translationProposals)
      .where(eq(translationProposals.id, proposalId))
      .limit(1);

    if (proposal.length === 0) {
      throw new Error('Proposal not found');
    }

    const prop = proposal[0];

    // Check if voting period has ended
    if (prop.votingEndsAt && new Date() < prop.votingEndsAt) {
      return false; // Voting still active
    }

    // Calculate approval: >60% + minimum quorum
    const totalVotes = (prop.upvotes || 0) + (prop.downvotes || 0);
    const quorum = prop.requiredQuorum || 5;

    if (totalVotes < quorum) {
      // Not enough votes - reject
      await db
        .update(translationProposals)
        .set({ status: 'rejected' })
        .where(eq(translationProposals.id, proposalId));
      return false;
    }

    const approvalRate = (prop.upvotes || 0) / totalVotes;
    if (approvalRate < 0.6) {
      // Less than 60% approval - reject
      await db
        .update(translationProposals)
        .set({ status: 'rejected' })
        .where(eq(translationProposals.id, proposalId));
      return false;
    }

    // Proposal approved - merge changes
    const translation = await db
      .select()
      .from(carolTranslations)
      .where(eq(carolTranslations.id, prop.translationId))
      .limit(1);

    if (translation.length === 0) {
      throw new Error('Translation not found');
    }

    const trans = translation[0];

    // Save history
    await db.insert(translationHistory).values({
      translationId: trans.id,
      proposalId: proposalId,
      previousTitle: trans.title,
      previousLyrics: trans.lyrics,
      changedBy: prop.proposedBy,
      changeReason: prop.changeReason,
    });

    // Update translation with proposal changes
    await db
      .update(carolTranslations)
      .set({
        title: prop.newTitle || trans.title,
        lyrics: prop.newLyrics || trans.lyrics,
        source: 'user_submitted',
        upvotes: 0, // Reset votes after update
        downvotes: 0,
        updatedAt: new Date(),
      })
      .where(eq(carolTranslations.id, trans.id));

    // Update proposal status
    await db
      .update(translationProposals)
      .set({ status: 'merged' })
      .where(eq(translationProposals.id, proposalId));

    // Award reputation to proposer
    const proposerRep = await getOrCreateReputation(prop.proposedBy, trans.language);
    await db
      .update(contributorReputation)
      .set({
        proposalsApproved: sql`${contributorReputation.proposalsApproved} + 1`,
        repPoints: sql`${contributorReputation.repPoints} + 5`,
      })
      .where(eq(contributorReputation.id, proposerRep.id));

    return true;
  } catch (error) {
    console.error('Failed to finalize proposal:', error);
    throw error;
  }
}

/**
 * Get pending proposals for a translation
 */
export async function getPendingProposals(translationId: string): Promise<TranslationProposal[]> {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(translationProposals)
      .where(
        and(
          eq(translationProposals.translationId, translationId),
          eq(translationProposals.status, 'pending')
        )
      )
      .orderBy(desc(translationProposals.createdAt));
  } catch (error) {
    console.error('Failed to fetch pending proposals:', error);
    return [];
  }
}

/**
 * Get reputation leaderboard for a language
 */
export async function getLeaderboard(language: string, limit: number = 10): Promise<ContributorReputation[]> {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(contributorReputation)
      .where(eq(contributorReputation.language, language))
      .orderBy(desc(contributorReputation.repPoints))
      .limit(limit);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}
