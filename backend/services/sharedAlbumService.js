// core algorithm to detect posts near each other in time & space and create SharedAlbum
const Post2 = require('../models/Post');
const SharedAlbum2 = require('../models/SharedAlbum');
const mongoose = require('mongoose');

exports.detectOrCreateForPost = async (post) => {
  try {
    if (!post.location || !post.location.coordinates) return null;
    const [lng, lat] = post.location.coordinates;
    const timeWindowHours = 4;
    const maxDistanceMeters = 500;

    const start = new Date(new Date(post.createdAt).getTime() - timeWindowHours * 3600 * 1000);
    const end = new Date(new Date(post.createdAt).getTime() + timeWindowHours * 3600 * 1000);

    // find posts near
    const nearby = await Post2.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'dist.calculated',
          maxDistance: maxDistanceMeters,
          spherical: true
        }
      },
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $sort: { createdAt: 1 } }
    ]);

    const uniquePostIds = Array.from(new Set(nearby.map(p => p._id.toString())));
    // include current post
    if (!uniquePostIds.includes(post._id.toString())) uniquePostIds.push(post._id.toString());

    // if cluster size >= 2 create or attach
    if (uniquePostIds.length >= 2) {
      // check existing album that overlaps (within same area & time)
      const existingAlbum = await SharedAlbum2.findOne({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistanceMeters
          }
        },
        startTime: { $lte: end },
        endTime: { $gte: start }
      });

      if (existingAlbum) {
        // add post if not present
        const toAdd = uniquePostIds.filter(id => !existingAlbum.postIds.map(x => x.toString()).includes(id));
        if (toAdd.length) {
          existingAlbum.postIds.push(...toAdd.map(id => mongoose.Types.ObjectId(id)));
          // merge members
          const postDocs = await Post2.find({ _id: { $in: toAdd.map(id => mongoose.Types.ObjectId(id)) } });
          const memberIds = postDocs.map(p => p.userId.toString());
          existingAlbum.members = Array.from(new Set([...existingAlbum.members.map(m => m.toString()), ...memberIds]));
          existingAlbum.endTime = new Date(Math.max(existingAlbum.endTime ? existingAlbum.endTime.getTime() : 0, post.createdAt.getTime()));
          await existingAlbum.save();
        }
        return existingAlbum;
      } else {
        // create new album
        const postDocs = await Post2.find({ _id: { $in: uniquePostIds.map(id => mongoose.Types.ObjectId(id)) } });
        const members = Array.from(new Set(postDocs.map(p => p.userId.toString()))).map(id => mongoose.Types.ObjectId(id));
        const album = await SharedAlbum2.create({
          creatorId: post.userId,
          location: { type: 'Point', coordinates: [lng, lat] },
          locationName: post.poi && post.poi.name ? post.poi.name : 'Unknown POI',
          startTime: new Date(Math.min(...postDocs.map(p => p.createdAt.getTime()))),
          endTime: new Date(Math.max(...postDocs.map(p => p.createdAt.getTime()))),
          members,
          postIds: uniquePostIds.map(id => mongoose.Types.ObjectId(id)),
          metadata: { autoCreated: true, detectionWindowHours: timeWindowHours }
        });
        return album;
      }
    }
    return null;
  } catch (err) {
    console.error('sharedAlbumService error', err);
    return null;
  }
};