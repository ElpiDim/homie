const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/me
// @desc    Update user's personal info
// @access  Private
router.put('/me', authMiddleware, async (req, res) => {
  const { age, householdSize, hasFamily, hasPets, smoker, occupation, salary, isWillingToHaveRoommate } = req.body;

  const profileFields = {
    age,
    householdSize,
    hasFamily,
    hasPets,
    smoker,
    occupation,
    salary,
    isWillingToHaveRoommate
  };

  try {
    let user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/me/preferences
// @desc    Update user's preferences and complete onboarding
// @access  Private
router.put('/me/preferences', authMiddleware, async (req, res) => {
  const { type, location, minPrice, maxPrice, minSqm, maxSqm, bedrooms, bathrooms, petsAllowed, smokingAllowed, furnished } = req.body;

  const preferencesFields = {
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
    let user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {
      preferences: preferencesFields,
      hasCompletedOnboarding: true,
    };

    user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
