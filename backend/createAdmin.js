const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust the path to your User model
require('dotenv').config(); // Load environment variables like DB connection

// Connect to the MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// Create an admin user
const createAdmin = async () => {
  const name = 'Administrator';
  const email = 'admin@ex.com';
  const phone = '0123456789';
  const role = 'admin'; // Set role to admin
  const password = 'admin123'; // You can change the default password

  try {
    // Check if admin already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the admin user
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    await user.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error(err.message);
  }
};

// Connect to DB and run the script
connectDB().then(createAdmin).finally(() => mongoose.connection.close());
