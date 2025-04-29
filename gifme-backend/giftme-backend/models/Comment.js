import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    gifId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gif', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
