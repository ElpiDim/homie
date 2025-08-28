const express = require('express');
const router = express.Router();
const { getMe, updateMe, updateMyPreferences } = require('../controllers/userController');
const auth = require('../middleware/auth'); // Renamed from authMiddleware

// All routes in this file are protected, so we can use the middleware at the top
router.use(auth);

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', getMe);

// @route   PUT api/users/me
// @desc    Update user's personal info
// @access  Private
router.put('/me', updateMe);

// @route   PUT api/users/me/preferences
// @desc    Update user's preferences and complete onboarding
// @access  Private
router.put('/me/preferences', updateMyPreferences);

module.exports = router;
