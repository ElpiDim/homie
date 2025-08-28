const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Property = require('../models/Property');
const User = require('../models/User');

// @route   POST api/properties
// @desc    Create a property
// @access  Private (Owner)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden: Only owners can create properties' });
  }

  try {
    const newProperty = new Property({
      ...req.body,
      owner: req.user.userId,
    });

    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/properties
// @desc    Get all properties matching tenant preferences
// @access  Private (Tenant)
router.get('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'tenant') {
        return res.status(403).json({ message: 'Forbidden: This route is for tenants only' });
    }

    try {
        const tenant = await User.findById(req.user.userId);
        if (!tenant || !tenant.hasCompletedOnboarding) {
            return res.json([]); // Return empty if onboarding is not complete
        }

        const { preferences, salary, occupation, hasFamily, smoker, hasPets, householdSize } = tenant;
        const query = { $and: [] };

        // Match tenant's preferences to property fields
        if (preferences.type) query.$and.push({ type: preferences.type });
        if (preferences.location) query.$and.push({ location: { $regex: new RegExp(preferences.location, 'i') } });
        if (preferences.minPrice) query.$and.push({ price: { $gte: preferences.minPrice } });
        if (preferences.maxPrice) query.$and.push({ price: { ...(query.$and.find(q => q.price) || {}).price, $lte: preferences.maxPrice } });
        if (preferences.minSqm) query.$and.push({ sqm: { $gte: preferences.minSqm } });
        if (preferences.maxSqm) query.$and.push({ sqm: { ...(query.$and.find(q => q.sqm) || {}).sqm, $lte: preferences.maxSqm } });
        if (preferences.bedrooms) query.$and.push({ bedrooms: { $gte: preferences.bedrooms } });
        if (preferences.bathrooms) query.$and.push({ bathrooms: { $gte: preferences.bathrooms } });
        if (preferences.furnished !== undefined) query.$and.push({ furnished: preferences.furnished });
        if (preferences.petsAllowed !== undefined) query.$and.push({ petsAllowed: preferences.petsAllowed });
        if (preferences.smokingAllowed !== undefined) query.$and.push({ smokingAllowed: preferences.smokingAllowed });

        // Match tenant's profile to property's tenantRequirements
        if (salary) query.$and.push({ 'tenantRequirements.minTenantSalary': { $lte: salary } });
        if (householdSize) query.$and.push({ 'tenantRequirements.maxOccupants': { $gte: householdSize } });
        
        query.$and.push({ 'tenantRequirements.requiresFamily': { $in: [false, hasFamily || false] } });
        query.$and.push({ 'tenantRequirements.allowsSmokers': { $in: [true, !(smoker || false)] } });
        query.$and.push({ 'tenantRequirements.allowsPets': { $in: [true, !(hasPets || false)] } });
        
        if (occupation) {
            query.$and.push({
                $or: [
                    { 'tenantRequirements.allowedOccupations': { $size: 0 } },
                    { 'tenantRequirements.allowedOccupations': { $in: [occupation] } }
                ]
            });
        } else {
             query.$and.push({ 'tenantRequirements.allowedOccupations': { $size: 0 } });
        }


        const properties = await Property.find(query.$and.length > 0 ? query : {});
        res.json(properties);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/properties/my
// @desc    Get properties for the logged-in owner
// @access  Private (Owner)
router.get('/my', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden: This route is for owners only' });
  }

  try {
    const properties = await Property.find({ owner: req.user.userId });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/properties/:id
// @desc    Update a property
// @access  Private (Owner)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the user owns the property
    if (property.owner.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/properties/:id
// @desc    Delete a property
// @access  Private (Owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the user owns the property
    if (property.owner.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Property.findByIdAndRemove(req.params.id);

    res.json({ message: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
