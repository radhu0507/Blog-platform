import { Router } from 'express';
import * as authController from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

router.post('/register', validateBody(authController.registerSchema), authController.register);
router.post('/login', validateBody(authController.loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;