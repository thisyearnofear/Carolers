// MODULAR: User-specific API routes
import { Router } from 'express';
import { userSyncService } from '../services/userSync';
import { log } from '../index';

const router = Router();

// CLEAN: User synchronization endpoint
router.post('/sync', async (req, res) => {
  try {
    const { userId, username, email, imageUrl, firstName, lastName } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        success: false 
      });
    }

    // Sync user with database
    await userSyncService.syncClerkUser({
      id: userId,
      username,
      email,
      imageUrl,
      firstName,
      lastName,
    });

    log(`🔄 User ${userId} synchronized successfully`, 'api-user-sync');

    res.status(200).json({
      success: true,
      message: 'User synchronized successfully',
      userId,
    });

  } catch (error) {
    log(`❌ User sync failed: ${error.message}`, 'api-user-sync');
    res.status(500).json({
      success: false,
      error: 'Failed to synchronize user',
      details: error.message,
    });
  }
});

// ENHANCEMENT FIRST: Get user by Clerk ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userSyncService.getUserByClerkId(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Clean user data for response
    const cleanUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      user: cleanUser,
    });

  } catch (error) {
    log(`❌ Get user failed: ${error.message}`, 'api-user-get');
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      details: error.message,
    });
  }
});

// CLEAN: Check if user needs synchronization
router.get('/:userId/needs-sync', async (req, res) => {
  try {
    const { userId } = req.params;
    const needsSync = await userSyncService.needsSync(userId);

    res.status(200).json({
      success: true,
      needsSync,
    });

  } catch (error) {
    log(`❌ Needs sync check failed: ${error.message}`, 'api-user-check');
    res.status(500).json({
      success: false,
      error: 'Failed to check sync status',
      details: error.message,
    });
  }
});

export default router;