// const router = require('express').Router()
// const userController = require('../controllers/user')
// const { body } = require('express-validator')
// const validation = require('../handlers/validation')
// const tokenHandler = require('../handlers/tokenHandler')

// router.post(
//   '/signup',
//   body('username').isLength({ min: 8 }).withMessage(
//     'username must be at least 8 characters'
//   ),
//   body('password').isLength({ min: 8 }).withMessage(
//     'password must be at least 8 characters'
//   ),
//   body('email').isEmail().withMessage(
//     'invalid email format'
//   ),
//   validation.validate,
//   userController.register
// )

// router.post(
//   '/login',
//   body('username').isLength({ min: 8 }).withMessage(
//     'username must be at least 8 characters'
//   ),
//   body('password').isLength({ min: 8 }).withMessage(
//     'password must be at least 8 characters'
//   ),
//   validation.validate,
//   userController.login
// )

// router.post(
//   '/verify-token',
//   tokenHandler.verifyToken,
//   (req, res) => {
//     res.status(200).json({ user: req.user })
//   }
// )

// router.post(
//   '/forgot-password',
//   body('email').isEmail().withMessage('Invalid email format'),
//   validation.validate,
//   userController.forgotPassword
// )

// router.post(
//   '/reset-password/:token',
//   body('password').isLength({ min: 8 }).withMessage(
//     'password must be at least 8 characters'
//   ),
//   validation.validate,
//   userController.resetPassword
// )

// // Admin routes
// router.get(
//   '/users',
//   tokenHandler.verifyToken,
//   validation.isAdmin,
//   userController.getAllUsers
// )

// router.put(
//   '/users/:userId',
//   tokenHandler.verifyToken,
//   validation.isAdmin,
//   userController.updateUserRole
// )

// module.exports = router

const router = require('express').Router()
const userController = require('../controllers/user')
const { body } = require('express-validator')
const validation = require('../handlers/validation')
const tokenHandler = require('../handlers/tokenHandler')

router.post(
  '/signup',
  body('username').isLength({ min: 8 }).withMessage(
    'username must be at least 8 characters'
  ),
  body('password').isLength({ min: 8 }).withMessage(
    'password must be at least 8 characters'
  ),
  body('email').isEmail().withMessage(
    'invalid email format'
  ),
  validation.validate,
  userController.register
)

router.post(
  '/login',
  body('username').isLength({ min: 8 }).withMessage(
    'username must be at least 8 characters'
  ),
  body('password').isLength({ min: 8 }).withMessage(
    'password must be at least 8 characters'
  ),
  validation.validate,
  userController.login
)

router.post(
  '/verify-token',
  tokenHandler.verifyToken,
  (req, res) => {
    res.status(200).json({ user: req.user })
  }
)

router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Invalid email format'),
  validation.validate,
  userController.forgotPassword
)

router.post(
  '/reset-password/:token',
  body('password').isLength({ min: 8 }).withMessage(
    'password must be at least 8 characters'
  ),
  validation.validate,
  userController.resetPassword
)

module.exports = router
