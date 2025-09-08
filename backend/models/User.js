const mongoose = require('mongoose');
const RequirementSchema = require('./Requirement');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'tenant'],
  },
  profile: {
    job: String,
    location: String,
    picture: String,
    profession: String,
    income: Number,
    employmentLocation: String,
    familyStatus: String,
    workingMembers: Number,
    pets: Boolean,
    smoker: Boolean,
  },
  filters: [RequirementSchema], // For tenants
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
