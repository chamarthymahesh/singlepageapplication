const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const imageslider = require('./slider');
const YouTubeLink = require('./routes/YouTubeLinkRoutes');
const ScrollingInfo = require('./routes/scrollingInfoRoutes');
const wordRoutes = require('./routes/wordRoutes');


dotenv.config();
connectDB();

const app = express();

// Set up CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

app.use('/api', YouTubeLink);

app.use('/api', ScrollingInfo);

app.use('/api', wordRoutes);

app.use(imageslider());



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


/* const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const expressFormidable = require('express-formidable');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const StoreImage = require('./routes/StoreImage');
const SimpleData = require('./routes/SimpleData');
const app = express();

dotenv.config();
connectDB();

// Set up CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(expressFormidable());

// API Routes
app.use('/api/auth', authRoutes);
app.use(StoreImage('image','/image'));
// app.use(SimpleData('data','/data','20mb'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 */