const mongoose = require('mongoose');

// Define the schema for the scrolling info
const ScrollingInfoSchema = new mongoose.Schema({
  title: {
    type: String,  // This will store the title of the scrolling info
    required: true,  // Title is required
  },
  info: {
    type: String,  
  },
});

module.exports = mongoose.model('ScrollingInfo', ScrollingInfoSchema);
