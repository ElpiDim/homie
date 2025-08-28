const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user's personal info
// @route   PUT /api/users/me
// @access  Private
const updateMe = async (req, res, next) => {
  const { name, age, householdSize, hasFamily, hasPets, smoker, occupation, salary, isWillingToHaveRoommate } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (age !== undefined) fieldsToUpdate.age = age;
  if (householdSize !== undefined) fieldsToUpdate.householdSize = householdSize;
  if (hasFamily !== undefined) fieldsToUpdate.hasFamily = hasFamily;
  if (hasPets !== undefined) fieldsToUpdate.hasPets = hasPets;
  if (smoker !== undefined) fieldsToUpdate.smoker = smoker;
  if (occupation) fieldsToUpdate.occupation = occupation;
  if (salary !== undefined) fieldsToUpdate.salary = salary;
  if (isWillingToHaveRoommate !== undefined) fieldsToUpdate.isWillingToHaveRoommate = isWillingToHaveRoommate;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user's preferences and complete onboarding
// @route   PUT /api/users/me/preferences
// @access  Private
const updateMyPreferences = async (req, res, next) => {
  const { preferences } = req.body;

  try {
    const updateData = {
      preferences,
      hasCompletedOnboarding: true,
    };

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMe,
  updateMe,
  updateMyPreferences,
};
