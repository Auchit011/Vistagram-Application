// backend/models/Like.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

// ensure a user can like a post only once
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
