const mongoose = require('mongoose');

const YouTubeLinkSchema = new mongoose.Schema({
  title: {  
    type: String, 
    // required: true,  
  },
  link: {
    type: String, 
    required: true,
  },
});

module.exports = mongoose.model('YouTubeLink', YouTubeLinkSchema);
