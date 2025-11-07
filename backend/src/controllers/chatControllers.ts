import { Request, Response } from 'express';
import Chat from '../models/Chat';
import User from '../models/User';

export const getChatCount = async (req: Request, res: Response) => {
  try {
    const count = await Chat.countDocuments();
    res.json({ totalChats: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserCount = async (req: Request, res: Response) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};