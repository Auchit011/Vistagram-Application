const { body } = require('express-validator');
exports.registerValidator = [
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
];
