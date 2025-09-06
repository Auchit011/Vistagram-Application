const Follow = require('../models/Follow');
const User3 = require('../models/User');
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User3.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();
    const user = await User3.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (err) { next(err); }
};

exports.exploreUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // assuming you have auth middleware setting req.user
    
    // Get all users except current user
    const users = await User3.find({ _id: { $ne: currentUserId } })
      .select('_id username profilePic bio')
      .lean();

    // Get all users current user is following
    const following = await Follow.find({ followerId: currentUserId, status: 'accepted' }).select('followedId').lean();

    const followingSet = new Set(following.map(f => f.followedId.toString()));

    // Add isFollowed property for each user
    const usersWithFollowStatus = users.map(u => ({
      ...u,
      isFollowed: followingSet.has(u._id.toString())
    }));

    res.json(usersWithFollowStatus);
  } catch (error) {
    console.error('Explore users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};
const User = require('../models/User'); // assuming your user model

exports.getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select('-password'); // exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
