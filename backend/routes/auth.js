const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;

    //Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    //Encrypt/Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create the user document
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      specialization: role === 'doctor' ? specialization : '' 
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error during registration');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials (Email not found)' });
    }

    //Validate Password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials (Wrong password)' });
    }

    //Create and sign JWT payload (includes ID and Role for role-based routing)
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }, // Token valid for 1 day
      (err, token) => {
        if (err) throw err;
        
        // Return token alongside basic user details to help the frontend redirect seamlessly
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            role: user.role
          }
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error during login');
  }
});

// @route   GET api/auth/doctors
// @desc    Get a list of doctors filtered by specialization
// @access  Private (Logged-in users)
router.get('/doctors', async (req, res) => {
  try {
    const { specialization } = req.query;
    
    // Build a dynamic query object. If a specialization is passed, filter by it.
    let query = { role: 'doctor' };
    if (specialization) {
      query.specialization = specialization;
    }

    // Find doctors and only return their name, email, and specialization (hide passwords)
    const doctors = await User.find(query).select('name email specialization');
    res.json(doctors);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error while fetching doctors');
  }
});

module.exports = router;