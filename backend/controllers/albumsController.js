const SharedAlbum = require('../models/SharedAlbum');

exports.getAlbum = async (req, res, next) => {
  try {
    const album = await SharedAlbum.findById(req.params.id).populate('members', 'username profilePic').populate('postIds');
    if (!album) return res.status(404).json({ message: 'Album not found' });
    res.json(album);
  } catch (err) { next(err); }
};

exports.listAlbumsNearby = async (req, res, next) => {
  try {
    const { lat, lng, radius = 1000 } = req.query; // radius in meters
    if (!lat || !lng) return res.status(400).json({ message: 'lat & lng required' });
    const albums = await SharedAlbum.find({ location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(radius) } } }).limit(50);
    res.json(albums);
  } catch (err) { next(err); }
};
