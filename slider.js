const express = require('express'); 
const slider = express.Router();
const StoreImage = require('./routes/StoreImage');

const expressFormidable = require('express-formidable');

slider.use(expressFormidable()); 

slider.use(StoreImage('Slider','/slider'));

// Export the router to be used in server.js
module.exports = () => slider;
