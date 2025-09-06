const mongoose5 = require('mongoose');
const FollowSchema = new mongoose5.Schema({
  followerId: { type: mongoose5.Schema.Types.ObjectId, ref: 'User', required: true },
  followedId: { type: mongoose5.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['accepted', 'pending', 'blocked'], default: 'accepted' },
  createdAt: { type: Date, default: Date.now }
});
FollowSchema.index({ followerId: 1, followedId: 1 }, { unique: true });
module.exports = mongoose5.model('Follow', FollowSchema);