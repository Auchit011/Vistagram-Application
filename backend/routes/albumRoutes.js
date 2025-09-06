const express5 = require('express');
const routerAlbum = express5.Router();
const auth3 = require('../middlewares/auth');
const albumsCtrl = require('../controllers/albumsController');
routerAlbum.get('/:id', auth3, albumsCtrl.getAlbum);
routerAlbum.get('/', auth3, albumsCtrl.listAlbumsNearby);
module.exports = routerAlbum;
