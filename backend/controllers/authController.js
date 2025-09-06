const bcrypt = require('bcryptjs');
const jwt2 = require('jsonwebtoken');
const User2 = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User2.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ message: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User2.create({ username, email, passwordHash: hash, fullName });
    const token = jwt2.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User2.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt2.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) { next(err); }
};

