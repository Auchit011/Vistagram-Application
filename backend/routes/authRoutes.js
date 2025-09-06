const express2 = require('express');
const routerAuth = express2.Router();
const authCtrl = require('../controllers/authController');
routerAuth.post('/register', authCtrl.register);
routerAuth.post('/login', authCtrl.login);
module.exports = routerAuth;
