// Import the required modules
const { MongoClient } = require("mongodb");
require("dotenv").config();  // Load environment variables from .env

// Get the MongoDB connection string from the environment variable
const mongoUrl = process.env.MONGO_URI;  // Use the value from the .env file

// Function to connect to the MongoDB database
const connectToDatabase = async (dbName) => {
  const client = new MongoClient(mongoUrl);

  try {
    // Connect to MongoDB and select the dynamic database
    await client.connect();
    const db = client.db(dbName);  // Use the dynamic dbName
    console.log(`Connected to database: ${dbName}`);
    return db;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
};

module.exports = { connectToDatabase };
