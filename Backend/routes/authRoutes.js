const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { registerSchema, loginSchema, validate } = require('../utils/validators');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerSchema, validate, register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginSchema, validate, login);

module.exports = router;
