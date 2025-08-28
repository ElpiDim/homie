const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['tenant', 'owner'],
    default: 'tenant',
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false,
  },
  // Personal Info
  age: {
    type: Number,
  },
  householdSize: {
    type: Number,
  },
  hasFamily: {
    type: Boolean,
  },
  hasPets: {
    type: Boolean,
  },
  smoker: {
    type: Boolean,
  },
  occupation: {
    type: String,
  },
  salary: {
    type: Number,
  },
  isWillingToHaveRoommate: {
    type: Boolean,
  },
  // Apartment Preferences
  preferences: {
    type: {
      type: String,
      enum: ['rent', 'sale'],
    },
    location: String,
    minPrice: Number,
    maxPrice: Number,
    minSqm: Number,
    maxSqm: Number,
    bedrooms: Number,
    bathrooms: Number,
    petsAllowed: Boolean,
    smokingAllowed: Boolean,
    furnished: Boolean,
  },
}, {
  timestamps: true,
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
