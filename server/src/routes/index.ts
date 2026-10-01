import { Router } from 'express';
import authRoutes from './authRoutes';
import { commentsRouter, postCommentsRouter } from './commentRoutes';
import postRoutes from './postRoutes';

const router = Router();

/** GET /api/health - handy for checking the server is up. */
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'BlogSpace API is running.', data: { status: 'ok' } });
});

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/posts/:postId/comments', postCommentsRouter);
router.use('/comments', commentsRouter);

export default router;