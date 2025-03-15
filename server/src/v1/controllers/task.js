const Task = require('../models/task')
const Section = require('../models/section')

exports.create = async (req, res) => {
  const { sectionId } = req.body
  try {
    const section = await Section.findById(sectionId)
    const tasksCount = await Task.find({ section: sectionId }).count()
    
    // Create task object with optional assignee
    const taskData = {
      section: sectionId,
      position: tasksCount > 0 ? tasksCount : 0
    }
    
    // If assignee provided and user is admin, set the assignee
    if (req.body.assignee && req.user.role === 'admin') {
      taskData.assignee = req.body.assignee
    }
    
    const task = await Task.create(taskData)
    
    // Populate section and assignee
    task._doc.section = section
    
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.update = async (req, res) => {
  const { taskId } = req.params
  try {
    // Only admin can change assignee
    if (req.body.assignee !== undefined && req.user.role !== 'admin') {
      delete req.body.assignee
    }
    
    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: req.body },
      { new: true }
    ).populate('section')
    
    res.status(200).json(task)
  } catch (err) {
    res.status(500).json(err)
  }
}

// Get tasks assigned to current user
exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('section')
      .sort('-updatedAt')
    
    res.status(200).json(tasks)
  } catch (err) {
    res.status(500).json(err)
  }
}

// Existing methods remain the same
exports.delete = async (req, res) => {
  const { taskId } = req.params
  try {
    const currentTask = await Task.findById(taskId)
    await Task.deleteOne({ _id: taskId })
    const tasks = await Task.find({ section: currentTask.section }).sort('postition')
    for (const key in tasks) {
      await Task.findByIdAndUpdate(
        tasks[key].id,
        { $set: { position: key } }
      )
    }
    res.status(200).json('deleted')
  } catch (err) {
    res.status(500).json(err)
  }
}

// Add this method to your existing task controller
exports.getAssignedTasks = async (req, res) => {
  try {
    // Find all tasks where the current user is the assignee
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('section')
      .sort('-updatedAt')
    
    // For each task, fetch the board info
    for (const task of tasks) {
      const section = await Section.findById(task.section._id).populate('board')
      task._doc.board = section.board
    }
    
    res.status(200).json(tasks)
  } catch (err) {
    console.error('Error fetching assigned tasks:', err)
    res.status(500).json(err)
  }
}


exports.updatePosition = async (req, res) => {
  const {
    resourceList,
    destinationList,
    resourceSectionId,
    destinationSectionId
  } = req.body
  const resourceListReverse = resourceList.reverse()
  const destinationListReverse = destinationList.reverse()
  try {
    if (resourceSectionId !== destinationSectionId) {
      for (const key in resourceListReverse) {
        await Task.findByIdAndUpdate(
          resourceListReverse[key].id,
          {
            $set: {
              section: resourceSectionId,
              position: key
            }
          }
        )
      }
    }
    for (const key in destinationListReverse) {
      await Task.findByIdAndUpdate(
        destinationListReverse[key].id,
        {
          $set: {
            section: destinationSectionId,
            position: key
          }
        }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}
