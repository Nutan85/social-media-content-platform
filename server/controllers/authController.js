const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateEmail, validatePassword, isValidRole } = require('../services/validation');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const userRole = role && isValidRole(role) ? role : 'content_creator';
    if (role && !isValidRole(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: userRole });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
