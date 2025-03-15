const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const Board = require('../models/board')
const Task = require('../models/task')

exports.validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

exports.isObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

// Admin role validation middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' })
  }
  next()
}

// Check if user is board owner or admin
exports.isBoardOwnerOrAdmin = async (req, res, next) => {
  try {
    const { boardId } = req.params
    const board = await Board.findById(boardId)
    
    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }
    
    // Allow if admin or board owner
    if (req.user.role === 'admin' || board.user.toString() === req.user._id.toString()) {
      return next()
    }
    
    return res.status(403).json({ message: 'Access denied: Not authorized for this board' })
  } catch (err) {
    res.status(500).json(err)
  }
}

// Check if user is task assignee or admin
exports.isTaskAssigneeOrAdmin = async (req, res, next) => {
  try {
    const { taskId } = req.params
    
    if (!taskId) {
      return next() // If creating a new task
    }
    
    const task = await Task.findById(taskId)
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    // Allow if admin or task is assigned to user
    if (
      req.user.role === 'admin' || 
      (task.assignee && task.assignee.toString() === req.user._id.toString())
    ) {
      return next()
    }
    
    return res.status(403).json({ message: 'Access denied: Not authorized for this task' })
  } catch (err) {
    res.status(500).json(err)
  }
}
