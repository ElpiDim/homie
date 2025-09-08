const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['select', 'range', 'boolean', 'text', 'number'],
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  options: {
    type: [String],
    default: undefined,
  },
});

module.exports = RequirementSchema;
