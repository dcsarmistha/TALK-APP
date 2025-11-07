import express from 'express';
import { register, login, getUsers } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/', protect, getUsers);

export default router;