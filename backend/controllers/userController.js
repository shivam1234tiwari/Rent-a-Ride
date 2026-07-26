const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.avatar) user.avatar = req.body.avatar;

      // Address nested object update fix
      if (req.body.address) {
        user.address = {
          street: req.body.address.street !== undefined ? req.body.address.street : (user.address?.street || ''),
          city: req.body.address.city !== undefined ? req.body.address.city : (user.address?.city || ''),
          state: req.body.address.state !== undefined ? req.body.address.state : (user.address?.state || ''),
          pincode: req.body.address.pincode !== undefined ? req.body.address.pincode : (user.address?.pincode || ''),
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        address: updatedUser.address, // Address included in response
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };