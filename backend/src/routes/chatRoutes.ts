import express from 'express';
import { getChatCount, getUserCount, getChatHistory } from "../controllers/chatControllers";

const router = express.Router();

router.get('/count', getChatCount);
router.get('/users/count', getUserCount);
router.get('/history', getChatHistory);

export default router;