import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  room: string;
}

const chatSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    default: 'general',
  },
}, {
  timestamps: true,
});

export default mongoose.model<IChat>('Chat', chatSchema);