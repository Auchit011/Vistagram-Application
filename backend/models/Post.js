// backend/models/Post.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  username: { type: String }, // snapshot of username (faster reads)
  image: { url: String, key: String, provider: String, width: Number, height: Number },
  caption: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: Date,
  // GeoJSON point + human-readable name
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
    name: { type: String } // human-readable location name (poi)
  },
  exif: Schema.Types.Mixed,
  ai: Schema.Types.Mixed,
  likesCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false }
});

module.exports = mongoose.model('Post', PostSchema);
