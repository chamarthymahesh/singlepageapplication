const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  additionalDescription: {
    type: String,
  },
});

module.exports = mongoose.model('Word', WordSchema);
