const mongoose7 = require('mongoose');
const SharedAlbumSchema = new mongoose7.Schema({
  creatorId: { type: mongoose7.Schema.Types.ObjectId, ref: 'User' },
  location: { type: { type: String, default: 'Point' }, coordinates: { type: [Number], index: '2dsphere' } },
  locationName: String,
  startTime: Date,
  endTime: Date,
  members: [{ type: mongoose7.Schema.Types.ObjectId, ref: 'User' }],
  postIds: [{ type: mongoose7.Schema.Types.ObjectId, ref: 'Post' }],
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  metadata: mongoose7.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose7.model('SharedAlbum', SharedAlbumSchema);
