const User = require('../models/User');

// @desc    Get current user's profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.userId);
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
  // Destructure name and the nested personalInfo fields from req.body
  const { name, age, householdSize, hasFamily, hasPets, smoker, occupation, salary, isWillingToHaveRoommate } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  
  // Build the personalInfo object
  const personalInfo = {};
  if (age !== undefined) personalInfo.age = age;
  if (householdSize !== undefined) personalInfo.householdSize = householdSize;
  if (hasFamily !== undefined) personalInfo.hasFamily = hasFamily;
  if (hasPets !== undefined) personalInfo.hasPets = hasPets;
  if (smoker !== undefined) personalInfo.smoker = smoker;
  if (occupation !== undefined) personalInfo.occupation = occupation;
  if (salary !== undefined) personalInfo.salary = salary;
  if (isWillingToHaveRoommate !== undefined) personalInfo.isWillingToHaveRoommate = isWillingToHaveRoommate;

  if (Object.keys(personalInfo).length > 0) {
      fieldsToUpdate.personalInfo = personalInfo;
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    );

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
  const { type, location, minPrice, maxPrice, minSqm, maxSqm, bedrooms, bathrooms, petsAllowed, smokingAllowed, furnished } = req.body;

  const preferences = {
    type,
    location,
    minPrice,
    maxPrice,
    minSqm,
    maxSqm,
    bedrooms,
    bathrooms,
    petsAllowed,
    smokingAllowed,
    furnished
  };

  try {
    // Also set hasCompletedOnboarding to true
    const updateData = {
      preferences,
      hasCompletedOnboarding: true,
    };

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

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
