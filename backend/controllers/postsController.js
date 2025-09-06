// backend/controllers/postsController.js
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow"); // used in feed
const User = require("../models/User");
const { uploadToCloudinaryBuffer } = require("../middlewares/upload");
const sharedAlbumService = require("../services/sharedAlbumService");

/**
 * Create a post (image upload handled by upload middleware)
 */
// backend/controllers/postsController.js
exports.createPost = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    console.log("hello");

    const { caption, lat, lng, location } = req.body;

    const result = await uploadToCloudinaryBuffer(
      req.file.buffer,
      "vistagram/posts"
    );

    const postObj = {
      userId: req.user._id,
      username: req.user.username || undefined,
      image: {
        url: result.secure_url,
        key: result.public_id,
        provider: "cloudinary",
        width: result.width,
        height: result.height,
      },
      caption: caption || "",
      createdAt: new Date(),
    };

    // Handle location gracefully
    if (location) {
      // Only name, no coordinates
      postObj.location = location;
    }
    

    const newPost = await Post.create(postObj);

    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: newPost._id },
    });

    const populated = await Post.findById(newPost._id).populate(
      "userId",
      "username profilePic"
    );

    await sharedAlbumService.detectOrCreateForPost(newPost);

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single post (auth protected)
 */
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "userId",
      "username profilePic"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * Feed: posts from followed users + self. Annotates likedByMe.
 */
exports.feed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "20", 10);

    const follows = await Follow.find({
      followerId: req.user._id,
      status: "accepted",
    }).select("followedId");
    const followedIds = follows.map((f) => f.followedId);
    followedIds.push(req.user._id);

    const posts = await Post.find({ userId: { $in: followedIds } })
      .populate("userId", "username profilePic isVerified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const postIds = posts.map((p) => p._id);
    const likes = await Like.find({
      postId: { $in: postIds },
      userId: req.user._id,
    })
      .select("postId")
      .lean();
    const likedSet = new Set(likes.map((l) => l.postId.toString()));

    // annotate with likedByMe
    const annotated = posts.map((p) => ({
      ...p,
      likedByMe: likedSet.has(p._id.toString()),
    }));

    res.json({ page, limit, posts: annotated });
  } catch (err) {
    next(err);
  }
};

/**
 * Like / Unlike a post. Returns { liked: boolean, likesCount: number }.
 */
/**
 * Like / Unlike a post using a separate Like collection.
 * Returns { liked: boolean, likesCount: number }
 */
exports.likePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // ensure post exists (quick check)
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) return res.status(404).json({ message: "Post not found" });

    // check if user already liked this post
    const existing = await Like.findOne({ postId, userId });

    if (existing) {
      // --- UNLIKE ---
      await existing.deleteOne();

      // decrement likesCount
      const updated = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likesCount: -1 } },
        { new: true, select: "likesCount" }
      );

      // guard: prevent negative counts
      if (updated && updated.likesCount < 0) {
        updated.likesCount = 0;
        await updated.save();
      }

      return res.json({
        liked: false,
        likesCount: updated ? updated.likesCount : 0,
      });
    }

    // --- LIKE ---
    try {
      await Like.create({ postId, userId });
    } catch (err) {
      // handle duplicate-like race (some other request inserted it)
      if (err.code === 11000) {
        const latest = await Post.findById(postId).select("likesCount");
        return res.json({
          liked: true,
          likesCount: latest ? latest.likesCount : 0,
        });
      }
      throw err;
    }

    // increment likesCount
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true, select: "likesCount" }
    );

    return res.json({
      liked: true,
      likesCount: updated ? updated.likesCount : 0,
    });
  } catch (err) {
    console.error("Error in likePost:", err);
    next(err);
  }
};

/**
 * Share a post (increments sharesCount and returns a share URL).
 * Requires FRONTEND_BASE environment variable (or uses fallback).
 */
exports.sharePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true }
    ).select("sharesCount");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const FRONTEND_BASE =
      process.env.FRONTEND_BASE ||
      process.env.FRONTEND_URL ||
      "https://yourfrontend.com";
    const shareUrl = `${FRONTEND_BASE}/posts/${postId}`;

    res.json({ shareUrl, sharesCount: post.sharesCount });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a comment to a post. Returns the created comment.
 * Also increments post.commentsCount.
 */
exports.addComment = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ message: "Comment text required" });

    const commentObj = {
      postId,
      userId: req.user._id,
      username: req.user.username || undefined,
      text: text.trim(),
    };

    const newComment = await Comment.create(commentObj);

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};

/**
 * Get comments for a post (paginated)
 */
exports.getComments = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ page, limit, comments });
  } catch (err) {
    next(err);
  }
};

/**
 * getUserPosts unchanged (optional copy from your file)
 */
exports.getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("posts");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.posts || user.posts.length === 0) {
      return res.json([]);
    }

    const posts = await Post.find({ _id: { $in: user.posts } })
      .populate("userId", "username profilePic")
      .sort({ createdAt: -1 })
      .exec();

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching user posts" });
  }
};
