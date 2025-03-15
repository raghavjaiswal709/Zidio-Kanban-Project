const mongoose = require('mongoose')
const { schemaOptions } = require('./modelOptions')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  }
}, schemaOptions)

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema)
