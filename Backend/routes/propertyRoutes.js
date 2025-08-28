const express = require('express');
const router = express.Router();
const {
    createProperty,
    getProperties,
    getMyProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
} = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

// All property routes are protected
router.use(auth);

// @route   GET /api/properties
// @desc    Get properties for tenant dashboard
// @access  Private (Tenant)
router.get('/', roles('tenant'), getProperties);

// @route   POST /api/properties
// @desc    Create a property
// @access  Private (Owner)
router.post('/', roles('owner'), createProperty);

// @route   GET /api/properties/my
// @desc    Get properties for the logged-in owner
// @access  Private (Owner)
router.get('/my', roles('owner'), getMyProperties);

// @route   GET /api/properties/:id
// @desc    Get a single property by ID
// @access  Private
router.get('/:id', getPropertyById);

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private (Owner)
router.put('/:id', roles('owner'), updateProperty);

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private (Owner)
router.delete('/:id', roles('owner'), deleteProperty);


module.exports = router;
