import { Router } from 'express';
import * as postController from '../controllers/postController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

// Public: anyone (signed in or not) can read posts.
router.get('/', postController.list);
router.get('/:id', postController.getById);

// Protected: these need a valid token, and write operations check ownership.
router.post('/', requireAuth, validateBody(postController.postSchema), postController.create);
router.put('/:id', requireAuth, validateBody(postController.postSchema), postController.update);
router.delete('/:id', requireAuth, postController.remove);

export default router;