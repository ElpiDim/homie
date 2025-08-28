const Property = require('../models/Property');
const User = require('../models/User');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Owner)
const createProperty = async (req, res, next) => {
  try {
    const newProperty = new Property({
      ...req.body,
      createdBy: req.user.userId,
    });

    const property = await newProperty.save();
    res.status(201).json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all properties matching tenant preferences
// @route   GET /api/properties
// @access  Private (Tenant)
const getProperties = async (req, res, next) => {
    try {
        const tenant = await User.findById(req.user.userId);
        
        // This will be replaced with a 403 in the next step, but for now, this logic is fine
        if (!tenant || !tenant.hasCompletedOnboarding) {
            return res.json([]); 
        }

        const { preferences, personalInfo } = tenant;
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
        if (personalInfo.salary) query.$and.push({ 'tenantRequirements.minTenantSalary': { $lte: personalInfo.salary } });
        if (personalInfo.householdSize) query.$and.push({ 'tenantRequirements.maxOccupants': { $gte: personalInfo.householdSize } });
        
        query.$and.push({ 'tenantRequirements.requiresFamily': { $in: [false, personalInfo.hasFamily || false] } });
        query.$and.push({ 'tenantRequirements.allowsSmokers': { $in: [true, !(personalInfo.smoker || false)] } });
        query.$and.push({ 'tenantRequirements.allowsPets': { $in: [true, !(personalInfo.hasPets || false)] } });
        
        if (personalInfo.occupation) {
            query.$and.push({
                $or: [
                    { 'tenantRequirements.allowedOccupations': { $size: 0 } },
                    { 'tenantRequirements.allowedOccupations': { $in: [personalInfo.occupation] } }
                ]
            });
        } else {
             query.$and.push({ 'tenantRequirements.allowedOccupations': { $size: 0 } });
        }

        const properties = await Property.find(query.$and.length > 0 ? query : {});
        res.json(properties);

    } catch (err) {
        next(err);
    }
};

// @desc    Get properties for the logged-in owner
// @route   GET /api/properties/my
// @access  Private (Owner)
const getMyProperties = async (req, res, next) => {
    try {
        const properties = await Property.find({ createdBy: req.user.userId });
        res.json(properties);
    } catch (err) {
        next(err);
    }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Private
const getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Private (Owner)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the user owns the property
    if (property.createdBy.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });

    res.json(property);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Owner)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.createdBy.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await property.remove();

    res.json({ message: 'Property removed' });
  } catch (err) {
    next(err);
  }
};


module.exports = {
    createProperty,
    getProperties,
    getMyProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
};
