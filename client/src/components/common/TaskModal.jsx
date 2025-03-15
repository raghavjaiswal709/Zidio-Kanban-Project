import { Backdrop, Fade, IconButton, Modal, Box, TextField, Typography, Divider, alpha, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import Moment from 'moment'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import taskApi from '../../api/taskApi'
import { useSelector } from 'react-redux'
import authApi from '../../api/authApi'

import '../../css/custom-editor.css'

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',    // Primary dark color
  mediumGreen: '#3F4F44',  // Secondary color
  warmBrown: '#A27B5C',    // Accent color
  lightBeige: '#DCD7C9',   // Text/light backgrounds
}

const modalStyle = {
  outline: 'none',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%', md: '60%', lg: '50%' },
  bgcolor: alpha(theme.mediumGreen, 0.95),
  border: `1px solid ${alpha(theme.lightBeige, 0.2)}`,
  boxShadow: `0 4px 20px ${alpha(theme.darkGreen, 0.5)}`,
  borderRadius: '8px',
  p: 1,
  height: '80%',
  color: theme.lightBeige,
  overflow: 'hidden'
}

const timeout = 500
let isModalClosed = false

const TaskModal = props => {
  const boardId = props.boardId
  // Initialize task with default empty object to prevent undefined errors
  const [task, setTask] = useState(props.task || { title: '', content: '', assignee: '' })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [users, setUsers] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const userRole = useSelector((state) => state.user.value?.role || 'assignee')
  const editorWrapperRef = useRef()
  const timerRef = useRef(null)

  // Clear any pending timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (props.task) {
      setTask(props.task)
      setTitle(props.task.title || '')
      setContent(props.task.content || '')
      isModalClosed = false
      setTimeout(updateEditorHeight, 300) // Delay to ensure modal is fully rendered
    } else {
      // Initialize with default values when no task is provided
      setTask({ assignee: '', title: '', content: '' })
      setTitle('')
      setContent('')
    }
  }, [props.task])

  // Fetch users for assignee selection (admin only)
  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch users if we have a task and user is admin
      if (userRole === 'admin' && task) {
        try {
          const response = await authApi.getAllUsers()
          setUsers(response)
        } catch (error) {
          console.error("Failed to fetch users:", error)
        }
      }
    }
    
    fetchUsers()
  }, [task, userRole])

  const updateEditorHeight = () => {
    if (editorWrapperRef.current) {
      const box = editorWrapperRef.current
      const editorElement = box.querySelector('.ck-editor__editable_inline');
      if (editorElement) {
        editorElement.style.height = (box.offsetHeight - 50) + 'px'
      }
      
      // Apply theme styles to editor
      const editorElements = box.querySelectorAll('.ck.ck-editor__main, .ck-editor__editable')
      editorElements.forEach(el => {
        el.style.backgroundColor = alpha(theme.darkGreen, 0.4)
        el.style.color = theme.lightBeige
        el.style.borderColor = alpha(theme.lightBeige, 0.2)
        el.style.borderRadius = '4px'
      })
      
      // Toolbar styling
      const toolbar = box.querySelector('.ck-toolbar')
      if (toolbar) {
        toolbar.style.backgroundColor = theme.darkGreen
        toolbar.style.color = theme.lightBeige
        toolbar.style.border = `1px solid ${alpha(theme.lightBeige, 0.2)}`
        toolbar.style.borderRadius = '4px 4px 0 0'
      }
    }
  }

  // Save task to backend
  const saveTask = useCallback(async () => {
    if (!task || !task.id) return;
    
    setIsSaving(true);
    
    try {
      await taskApi.update(boardId, task.id, {
        title: title,
        content: content,
        assignee: task.assignee
      });
      
      // Update the task in parent component
      const updatedTask = { ...task, title, content };
      props.onUpdate(updatedTask);
      
      console.log("Task saved successfully:", updatedTask);
    } catch (err) {
      console.error("Failed to save task:", err);
    } finally {
      setIsSaving(false);
    }
  }, [boardId, task, title, content, props]);

  // Save and close modal
  const handleSaveAndClose = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    await saveTask();
    onClose();
  };

  const onClose = () => {
    isModalClosed = true;
    
    // Clear any pending timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    props.onClose();
  }

  const deleteTask = async () => {
    try {
      if (task && task.id) {
        await taskApi.delete(boardId, task.id)
        props.onDelete(task)
        setTask(undefined)
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  // Handle title changes - using separate function to debug
  const handleTitleChange = (e) => {
    console.log("Title change:", e.target.value);
    setTitle(e.target.value);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Only update task locally, save to backend will happen on save button click
    setTask(prev => ({ ...prev, title: e.target.value }));
  }

  const handleContentChange = (event, editor) => {
    if (isModalClosed) return;
    
    const data = editor.getData();
    console.log("Content change:", data.substring(0, 20) + "...");
    setContent(data);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Only update task locally, save to backend will happen on save button click
    setTask(prev => ({ ...prev, content: data }));
  }

  // Check if task exists before rendering modal content
  const isTaskDefined = task !== undefined && task !== null;

  return (
    <Modal
    open={props.open} // Use the explicit open prop
    onClose={onClose}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{ 
      timeout: 500,
      sx: { backdropFilter: 'blur(3px)', backgroundColor: alpha(theme.darkGreen, 0.7) }
    }}
    >
      <Fade in={isTaskDefined}>
        <Box sx={modalStyle}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            padding: '8px 16px',
            borderBottom: `1px solid ${alpha(theme.lightBeige, 0.1)}`
          }}>
            {/* Save Button */}
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSaveAndClose}
              disabled={isSaving}
              sx={{
                mr: 2,
                color: theme.lightBeige,
                bgcolor: alpha(theme.warmBrown, 0.7),
                '&:hover': {
                  bgcolor: theme.warmBrown
                },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {isSaving ? 'Saving...' : 'Save & Close'}
            </Button>
            
            {/* Delete Button */}
            <IconButton 
              variant='outlined' 
              onClick={deleteTask}
              sx={{ 
                color: alpha(theme.lightBeige, 0.8),
                '&:hover': { 
                  bgcolor: alpha('#f44336', 0.1),
                  color: '#f44336'
                }
              }}
            >
              <DeleteOutlinedIcon />
            </IconButton>
          </Box>
          <Box sx={{
            display: 'flex',
            height: 'calc(100% - 50px)',
            flexDirection: 'column',
            padding: { xs: '1rem 1rem 1.5rem', md: '2rem 3rem 2rem' },
            overflowY: 'auto'
          }}>
            {/* Title Input - Now with fixed onChange handler */}
            <TextField
              value={title}
              onChange={handleTitleChange}
              placeholder='Untitled'
              variant='outlined'
              fullWidth
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-input': { 
                  padding: '8px 12px',
                  color: theme.lightBeige,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  fontWeight: '700',
                  // Add a background to make it more obvious it's editable
                  backgroundColor: alpha(theme.darkGreen, 0.2),
                  borderRadius: '4px'
                },
                '& .MuiOutlinedInput-notchedOutline': { 
                  borderColor: alpha(theme.lightBeige, 0.2),
                  borderWidth: '1px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.lightBeige, 0.4)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.warmBrown
                },
                marginBottom: '15px',
                '& ::placeholder': { 
                  color: alpha(theme.lightBeige, 0.5),
                  opacity: 1
                }
              }}
            />
            
            {userRole === 'admin' && isTaskDefined && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControl fullWidth variant="outlined" sx={{ 
                  bgcolor: alpha(theme.darkGreen, 0.4),
                  borderRadius: '4px'
                }}>
                  <InputLabel 
                    id="assignee-label"
                    sx={{ color: alpha(theme.lightBeige, 0.7) }}
                  >
                    Assignee
                  </InputLabel>
                  <Select
                    labelId="assignee-label"
                    value={task?.assignee || ''}
                    onChange={(e) => {
                      if (!task) return
                      
                      const newAssignee = e.target.value;
                      setTask(prev => ({ ...prev, assignee: newAssignee }));
                    }}
                    label="Assignee"
                    sx={{ 
                      color: theme.lightBeige,
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.lightBeige, 0.2)
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.lightBeige, 0.3)
                      },
                      '.MuiSvgIcon-root': {
                        color: theme.lightBeige
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Unassigned</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
            
            <Typography variant='body2' fontWeight='700' color={alpha(theme.warmBrown, 0.9)}>
              {isTaskDefined && task.createdAt ? Moment(task.createdAt).format('YYYY-MM-DD') : ''}
            </Typography>
            
            <Divider sx={{ 
              margin: '1.5rem 0', 
              bgcolor: alpha(theme.warmBrown, 0.4) 
            }} />
            
            <Box
              ref={editorWrapperRef}
              sx={{
                position: 'relative',
                height: '80%',
                overflowX: 'hidden',
                overflowY: 'auto',
                borderRadius: '4px',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.darkGreen, 0.3),
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.warmBrown, 0.7),
                  borderRadius: '4px',
                }
              }}
            >
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={handleContentChange}
                onFocus={updateEditorHeight}
                onBlur={updateEditorHeight}
                config={{
                  placeholder: 'Start typing here...'
                }}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default TaskModal;
