// backend/models/Comment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String }, // snapshot of username
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false }
});

module.exports = mongoose.model('Comment', CommentSchema);
