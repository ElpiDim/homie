const mongoose = require('mongoose');
const RequirementSchema = require('./Requirement');

const PropertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  floor: Number,
  rent: {
    type: Number,
    required: true,
  },
  sqm: {
    type: Number,
    required: true,
  },
  yearBuilt: Number,
  yearRenovated: Number,
  bedrooms: Number,
  furnished: Boolean,
  parking: Boolean,
  heatingType: String,
  requirements: [RequirementSchema], // For owners
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
