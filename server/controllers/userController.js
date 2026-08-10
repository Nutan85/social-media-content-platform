const User = require('../models/User');
const { validateEmail, isValidRole } = require('../services/validation');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const userId = parseInt(req.params.id, 10);

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (role && !isValidRole(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await User.findByEmail(email);
      if (emailTaken) {
        return res.status(409).json({ success: false, message: 'Email already in use.' });
      }
    }

    const user = await User.update(userId, { name, email, role });
    res.json({ success: true, message: 'User updated successfully.', data: { user } });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const deleted = await User.delete(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
