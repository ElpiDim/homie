const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['rent', 'sale'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  sqm: {
    type: Number,
    required: true,
  },
  bedrooms: {
    type: Number,
    required: true,
  },
  bathrooms: {
    type: Number,
    required: true,
  },
  furnished: {
    type: Boolean,
    default: false,
  },
  petsAllowed: {
    type: Boolean,
    default: false,
  },
  smokingAllowed: {
    type: Boolean,
    default: false,
  },
  // Tenant Requirements
  tenantRequirements: {
    minTenantSalary: {
      type: Number,
      default: 0,
    },
    allowedOccupations: {
      type: [String],
      default: [],
    },
    requiresFamily: {
      type: Boolean,
      default: false,
    },
    allowsSmokers: {
      type: Boolean,
      default: true,
    },
    allowsPets: {
      type: Boolean,
      default: true,
    },
    maxOccupants: {
      type: Number,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Property', PropertySchema);
