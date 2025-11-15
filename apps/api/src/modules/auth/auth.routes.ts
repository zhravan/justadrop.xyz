import { Router } from 'express';
import { register, login, getProfile } from './auth.controller.js';
import { validateRequest } from '../../shared/middleware/validation.middleware.js';
import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { registerSchema, loginSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/profile', authenticate, getProfile);

export default router;

