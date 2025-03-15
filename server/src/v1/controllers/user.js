const User = require('../models/user')
const CryptoJS = require('crypto-js')
const jsonwebtoken = require('jsonwebtoken')

exports.register = async (req, res) => {
  const { username, password, confirmPassword, role } = req.body
  
  // Validate input
  const errors = []
  
  if (!username || username.length < 8) {
    errors.push({ param: 'username', msg: 'Username must be at least 8 characters' })
  }
  
  if (!password || password.length < 8) {
    errors.push({ param: 'password', msg: 'Password must be at least 8 characters' })
  }
  
  if (password !== confirmPassword) {
    errors.push({ param: 'confirmPassword', msg: 'Passwords do not match' })
  }
  
  if (role && !['admin', 'assignee'].includes(role)) {
    errors.push({ param: 'role', msg: 'Invalid role specified' })
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors })
  }
  
  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({
        errors: [{ param: 'username', msg: 'Username already used' }]
      })
    }
    
    // Encrypt password
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    ).toString()
    
    // Create new user
    const user = await User.create({
      username,
      password: encryptedPassword,
      role: role || 'assignee' // Default to assignee if role not provided
    })
    
    // Generate token
    const token = jsonwebtoken.sign(
      { id: user._id, role: user.role },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )
    
    // Return response without password
    user.password = undefined
    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ 
      message: 'Internal server error',
      errors: [{ param: 'general', msg: 'Failed to create user' }]
    })
  }
}



exports.login = async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username }).select('password username role')
    if (!user) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username or password'
          }
        ]
      })
    }

    const decryptedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8)

    if (decryptedPass !== password) {
      return res.status(401).json({
        errors: [
          {
            param: 'username',
            msg: 'Invalid username or password'
          }
        ]
      })
    }

    user.password = undefined

    const token = jsonwebtoken.sign(
      { id: user._id, role: user.role },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )

    res.status(200).json({ user, token })
  } catch (err) {
    res.status(500).json(err)
  }
}

// Admin function to get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Admin function to update user role
exports.updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (!role || !['admin', 'assignee'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }
  
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};
