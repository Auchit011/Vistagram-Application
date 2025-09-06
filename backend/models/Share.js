const mongoose4 = require('mongoose');
const ShareSchema = new mongoose4.Schema({
  postId: { type: mongoose4.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose4.Schema.Types.ObjectId, ref: 'User', required: true },
  shareLink: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose4.model('Share', ShareSchema);