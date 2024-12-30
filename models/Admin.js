const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// No need for password hashing middleware in the model, as we handle it manually in the controller

module.exports = mongoose.model('Admin', AdminSchema);
