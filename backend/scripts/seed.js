const mongoose8 = require('mongoose');
const dotenv2 = require('dotenv');
dotenv2.config();
const UserSeed = require('../models/User');
const PostSeed = require('../models/Post');

(async () => {
  try {
    await mongoose8.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vistagram');
    console.log('connected');
    await UserSeed.deleteMany({});
    await PostSeed.deleteMany({});
    const u = await UserSeed.create({ username: 'demo', email: 'demo@example.com', passwordHash: '$2a$10$examplehash', fullName: 'Demo User' });
    const p = await PostSeed.create({ userId: u._id, image: { url: 'https://picsum.photos/800/600', provider: 'placeholder' }, caption: 'Demo post', location: { type: 'Point', coordinates: [2.2945, 48.8584] }, createdAt: new Date() });
    console.log('seeded', u._id, p._id);
    process.exit(0);
  } catch (err) { console.error(err); process.exit(1); }
})();