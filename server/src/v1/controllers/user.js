const User = require('../models/user')
const CryptoJS = require('crypto-js')
const jsonwebtoken = require('jsonwebtoken')
const { sendEmail } = require('../handlers/emailHandler')
const crypto = require('crypto')

exports.register = async (req, res) => {
  const { password, username, email } = req.body
  try {
    const emailExists = await User.findOne({ email })
    if (emailExists) return res.status(400).json({
      errors: [{ param: 'email', msg: 'Email already used' }]
    })

    const usernameExists = await User.findOne({ username })
    if (usernameExists) return res.status(400).json({
      errors: [{ param: 'username', msg: 'Username already used' }]
    })

    const user = await User.create({
      username,
      password: CryptoJS.AES.encrypt(
        password,
        process.env.PASSWORD_SECRET_KEY
      ),
      email
    })
    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await User.findOne({ username }).select('password username')
    if (!user) return res.status(401).json({
      errors: [
        {
          param: 'username',
          msg: 'Invalid username or password'
        }
      ]
    })

    const decryptedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASSWORD_SECRET_KEY
    ).toString(CryptoJS.enc.Utf8)

    if (decryptedPass !== password) return res.status(401).json({
      errors: [
        {
          param: 'username',
          msg: 'Invalid username or password'
        }
      ]
    })

    user.password = undefined

    const token = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    )

    res.status(200).json({ user, token })
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        errors: [{ param: 'email', msg: 'No user found with that email' }]
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Create email content
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    // Send email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending email. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Get token from params
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with the one in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with the token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        errors: [{ param: 'token', msg: 'Invalid or expired token' }]
      });
    }

    // Update password and clear reset token fields
    user.password = CryptoJS.AES.encrypt(
      password,
      process.env.PASSWORD_SECRET_KEY
    );
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate new JWT token
    const jwtToken = jsonwebtoken.sign(
      { id: user._id },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Remove password from response
    user.password = undefined;

    res.status(200).json({ 
      message: 'Password reset successful',
      user,
      token: jwtToken
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
};
