import { Box, Button, Typography, Divider, TextField, IconButton, Card, Paper } from '@mui/material'
import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import sectionApi from '../../api/sectionApi'
import taskApi from '../../api/taskApi'
import TaskModal from './TaskModal'

let timer
const timeout = 500

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',    // Primary text, important elements
  mediumGreen: '#3F4F44',  // Secondary text, buttons
  warmBrown: '#A27B5C',    // Accents, highlights
  lightBeige: '#DCD7C9',   // Backgrounds
}

const Kanban = props => {
  const boardId = props.boardId
  const [data, setData] = useState([])
  const [selectedTask, setSelectedTask] = useState(undefined)

  useEffect(() => {
    setData(props.data)
  }, [props.data])

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return
    const sourceColIndex = data.findIndex(e => e.id === source.droppableId)
    const destinationColIndex = data.findIndex(e => e.id === destination.droppableId)
    const sourceCol = data[sourceColIndex]
    const destinationCol = data[destinationColIndex]

    const sourceSectionId = sourceCol.id
    const destinationSectionId = destinationCol.id

    const sourceTasks = [...sourceCol.tasks]
    const destinationTasks = [...destinationCol.tasks]

    if (source.droppableId !== destination.droppableId) {
      const [removed] = sourceTasks.splice(source.index, 1)
      destinationTasks.splice(destination.index, 0, removed)
      data[sourceColIndex].tasks = sourceTasks
      data[destinationColIndex].tasks = destinationTasks
    } else {
      const [removed] = destinationTasks.splice(source.index, 1)
      destinationTasks.splice(destination.index, 0, removed)
      data[destinationColIndex].tasks = destinationTasks
    }

    try {
      await taskApi.updatePosition(boardId, {
        resourceList: sourceTasks,
        destinationList: destinationTasks,
        resourceSectionId: sourceSectionId,
        destinationSectionId: destinationSectionId
      })
      setData(data)
    } catch (err) {
      alert(err)
    }
  }

  const createSection = async () => {
    try {
      const section = await sectionApi.create(boardId)
      setData([...data, section])
    } catch (err) {
      alert(err)
    }
  }

  const deleteSection = async (sectionId) => {
    try {
      await sectionApi.delete(boardId, sectionId)
      const newData = [...data].filter(e => e.id !== sectionId)
      setData(newData)
    } catch (err) {
      alert(err)
    }
  }

  const updateSectionTitle = async (e, sectionId) => {
    clearTimeout(timer)
    const newTitle = e.target.value
    const newData = [...data]
    const index = newData.findIndex(e => e.id === sectionId)
    newData[index].title = newTitle
    setData(newData)
    timer = setTimeout(async () => {
      try {
        await sectionApi.update(boardId, sectionId, { title: newTitle })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const createTask = async (sectionId) => {
    try {
      const task = await taskApi.create(boardId, { sectionId })
      const newData = [...data]
      const index = newData.findIndex(e => e.id === sectionId)
      newData[index].tasks.unshift(task)
      setData(newData)
    } catch (err) {
      alert(err)
    }
  }

  const onUpdateTask = (task) => {
    const newData = [...data]
    const sectionIndex = newData.findIndex(e => e.id === task.section.id)
    const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id)
    newData[sectionIndex].tasks[taskIndex] = task
    setData(newData)
  }

  const onDeleteTask = (task) => {
    const newData = [...data]
    const sectionIndex = newData.findIndex(e => e.id === task.section.id)
    const taskIndex = newData[sectionIndex].tasks.findIndex(e => e.id === task.id)
    newData[sectionIndex].tasks.splice(taskIndex, 1)
    setData(newData)
  }

  return (
    <Box sx={{ 
      bgcolor: theme.lightBeige, 
      p: 2, 
      borderRadius: 2,
      minHeight: 'calc(100vh - 200px)'
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: theme.darkGreen,
        mb: 2
      }}>
        <Button 
          onClick={createSection} 
          variant="contained"
          sx={{
            bgcolor: theme.mediumGreen,
            color: theme.lightBeige,
            '&:hover': { 
              bgcolor: theme.darkGreen,
              boxShadow: '0 4px 8px rgba(44, 57, 48, 0.2)' 
            },
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(44, 57, 48, 0.2)'
          }}
        >
          Add section
        </Button>
        <Typography variant='body2' fontWeight='700' color={theme.darkGreen}>
          {data.length} Sections
        </Typography>
      </Box>
      <Divider sx={{ margin: '0px 0', bgcolor: theme.warmBrown, opacity: 0.3 }} />
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          width: 'calc(100vw - 400px)',
          overflowX: 'auto',
          padding: '10px 0',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: `${theme.lightBeige}`,
          },
          '&::-webkit-scrollbar-thumb': {
            background: `${theme.warmBrown}`,
            borderRadius: '4px',
          }
        }}>
          {
            data.map(section => (
              <div key={section.id} style={{ width: '300px' }}>
                <Droppable key={section.id} droppableId={section.id}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      elevation={0}
                      sx={{ 
                        width: '300px', 
                        padding: '16px', 
                        marginRight: '16px',
                        bgcolor: 'white',
                        borderRadius: '8px',
                        border: `1px solid ${theme.lightBeige}`,
                        boxShadow: '0 2px 8px rgba(162, 123, 92, 0.1)'
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                      }}>
                        <TextField
                          value={section.title}
                          onChange={(e) => updateSectionTitle(e, section.id)}
                          placeholder='Untitled'
                          variant='outlined'
                          sx={{
                            flexGrow: 1,
                            '& .MuiOutlinedInput-input': { 
                              padding: 0, 
                              color: theme.darkGreen,
                              fontWeight: 600 
                            },
                            '& .MuiOutlinedInput-notchedOutline': { border: 'unset ' },
                            '& .MuiOutlinedInput-root': { fontSize: '1rem' }
                          }}
                        />
                        <IconButton
                          size='small'
                          sx={{
                            color: theme.mediumGreen,
                            '&:hover': { 
                              color: theme.warmBrown, 
                              bgcolor: 'rgba(162, 123, 92, 0.1)' 
                            },
                            marginLeft: '4px'
                          }}
                          onClick={() => createTask(section.id)}
                        >
                          <AddOutlinedIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          sx={{
                            color: theme.mediumGreen,
                            '&:hover': { 
                              color: '#d32f2f', 
                              bgcolor: 'rgba(211, 47, 47, 0.1)' 
                            },
                            marginLeft: '4px'
                          }}
                          onClick={() => deleteSection(section.id)}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </Box>
                      {/* tasks */}
                      {
                        section.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  padding: '12px',
                                  marginBottom: '10px',
                                  cursor: snapshot.isDragging ? 'grab' : 'pointer!important',
                                  bgcolor: theme.lightBeige,
                                  color: theme.darkGreen,
                                  boxShadow: snapshot.isDragging ? 
                                    '0 8px 16px rgba(63, 79, 68, 0.2)' : 
                                    '0 1px 3px rgba(63, 79, 68, 0.1)',
                                  borderLeft: `4px solid ${theme.warmBrown}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    boxShadow: '0 4px 8px rgba(63, 79, 68, 0.15)',
                                    bgcolor: 'rgba(220, 215, 201, 0.7)'
                                  }
                                }}
                                onClick={() => setSelectedTask(task)}
                              >
                                <Typography fontWeight={500}>
                                  {task.title === '' ? 'Untitled' : task.title}
                                </Typography>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      }
                      {provided.placeholder}
                    </Paper>
                  )}
                </Droppable>
              </div>
            ))
          }
        </Box>
      </DragDropContext>
      
      <TaskModal
        task={selectedTask}
        boardId={boardId}
        open={selectedTask !== undefined}
        onClose={() => {
          console.log('Closing task modal');
          setSelectedTask(undefined);
        }}
        onUpdate={onUpdateTask}
        onDelete={onDeleteTask}
      />
    </Box>
  )
}

export default Kanban