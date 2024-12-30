const mongoose = require('mongoose');
const Admin = require('../models/Admin');  // Import the Admin model
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Check if the default admin user exists
    const existingAdmin = await Admin.findOne({ email: process.env.DEFAULT_ADMIN_EMAIL });

    if (!existingAdmin) {
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 10);

      // Create the default admin user
      const newAdmin = new Admin({
        email: process.env.DEFAULT_ADMIN_EMAIL,
        password: hashedPassword,  // Storing hashed password
      });

      await newAdmin.save();
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
