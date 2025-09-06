const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const postsCtrl = require('../controllers/postsController');
const { upload } = require('../middlewares/upload');

// create
router.post('/', auth, upload.single('image'), postsCtrl.createPost);

// feed
router.get('/feed', auth, postsCtrl.feed);

// user posts
router.get('/user/:userId', auth, postsCtrl.getUserPosts);

// comments
router.get('/:id/comments', auth, postsCtrl.getComments);
router.post('/:id/comments', auth, postsCtrl.addComment);

// share
router.post('/:id/share', auth, postsCtrl.sharePost);

// single post
router.get('/:id', auth, postsCtrl.getPost);

// like
router.post('/:id/like', auth, postsCtrl.likePost);

module.exports = router;
