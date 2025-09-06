const Follow = require('../models/Follow');
const User = require('../models/User');

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.id;  // assuming user is authenticated and user id is in req.user.id
    const followedId = req.params.userId;

    if (followerId === followedId) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    // Create follow relation if not exists
    const existing = await Follow.findOne({ followerId, followedId });
    if (existing) {
      return res.status(400).json({ message: 'Already following this user.' });
    }

    const follow = new Follow({ followerId, followedId, status: 'accepted' });
    await follow.save();

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while following user' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followedId = req.params.userId;

    const deleted = await Follow.findOneAndDelete({ followerId, followedId });
    if (!deleted) {
      return res.status(400).json({ message: "You don't follow this user." });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while unfollowing user' });
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all users who follow this user
    const followers = await Follow.find({ followedId: userId, status: 'accepted' })
      .populate('followerId', 'username profilePic')
      .exec();

    res.json(followers.map(f => f.followerId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching followers' });
  }
};

// Get following (people whom user follows)
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all users whom this user follows
    const following = await Follow.find({ followerId: userId, status: 'accepted' })
      .populate('followedId', 'username profilePic')
      .exec();

    res.json(following.map(f => f.followedId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching following' });
  }
};