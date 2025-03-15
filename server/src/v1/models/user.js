const mongoose = require('mongoose')
const { schemaOptions } = require('./modelOptions')

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
  role: {
    type: String,
    enum: ['admin', 'assignee'],
    default: 'assignee'
  }
}, schemaOptions);


// module.exports = mongoose.model('User', userSchema)
module.exports = mongoose.model('User', userSchema, 'testuser')

