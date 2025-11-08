import express from 'express';
import { getChatCount, getUserCount } from "../controllers/chatControllers";

const router = express.Router();

router.get('/count', getChatCount);
router.get('/users/count', getUserCount);

export default router;