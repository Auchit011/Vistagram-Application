const express3 = require('express');
const routerUser = express3.Router();
const auth = require('../middlewares/auth');
const usersCtrl = require('../controllers/usersController');
routerUser.get('/explore', auth, usersCtrl.exploreUsers);
routerUser.get('/me', auth, usersCtrl.getProfile);
routerUser.get('/:id', auth, usersCtrl.getProfile);
routerUser.put('/me', auth, usersCtrl.updateProfile);
routerUser.get('/username/:username', auth, usersCtrl.getUserByUsername);
module.exports = routerUser;

