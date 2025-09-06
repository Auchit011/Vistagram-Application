const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const authMiddleware = require('../middlewares/auth'); // your auth middleware that sets req.user

router.post('/follow/:userId', authMiddleware, followController.followUser);
router.delete('/unfollow/:userId', authMiddleware, followController.unfollowUser);

router.get('/followers/:userId', followController.getFollowers);
router.get('/following/:userId', followController.getFollowing);

module.exports = router;
