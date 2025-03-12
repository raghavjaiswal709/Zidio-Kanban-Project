import { Backdrop, Fade, IconButton, Modal, Box, TextField, Typography, Divider, alpha } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import Moment from 'moment'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import taskApi from '../../api/taskApi'

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
  width: '50%',
  bgcolor: alpha(theme.mediumGreen, 0.95),
  border: `1px solid ${alpha(theme.lightBeige, 0.2)}`,
  boxShadow: `0 4px 20px ${alpha(theme.darkGreen, 0.5)}`,
  borderRadius: '8px',
  p: 1,
  height: '80%',
  color: theme.lightBeige,
  overflow: 'hidden'
}

let timer
const timeout = 500
let isModalClosed = false

const TaskModal = props => {
  const boardId = props.boardId
  const [task, setTask] = useState(props.task)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const editorWrapperRef = useRef()

  useEffect(() => {
    setTask(props.task)
    setTitle(props.task !== undefined ? props.task.title : '')
    setContent(props.task !== undefined ? props.task.content : '')
    if (props.task !== undefined) {
      isModalClosed = false
      updateEditorHeight()
    }
  }, [props.task])

  const updateEditorHeight = () => {
    setTimeout(() => {
      if (editorWrapperRef.current) {
        const box = editorWrapperRef.current
        box.querySelector('.ck-editor__editable_inline').style.height = (box.offsetHeight - 50) + 'px'
        
        // Apply theme styles to editor
        const editorElements = box.querySelectorAll('.ck.ck-editor__main, .ck-editor__editable')
        editorElements.forEach(el => {
          el.style.backgroundColor = alpha(theme.darkGreen, 0.4);
          el.style.color = theme.lightBeige;
          el.style.borderColor = alpha(theme.lightBeige, 0.2);
          el.style.borderRadius = '4px';
        });
        
        // Toolbar styling
        const toolbar = box.querySelector('.ck-toolbar')
        if (toolbar) {
          toolbar.style.backgroundColor = theme.darkGreen;
          toolbar.style.color = theme.lightBeige;
          toolbar.style.border = `1px solid ${alpha(theme.lightBeige, 0.2)}`;
          toolbar.style.borderRadius = '4px 4px 0 0';
        }
      }
    }, timeout)
  }

  const onClose = () => {
    isModalClosed = true
    props.onUpdate(task)
    props.onClose()
  }

  const deleteTask = async () => {
    try {
      await taskApi.delete(boardId, task.id)
      props.onDelete(task)
      setTask(undefined)
    } catch (err) {
      alert(err)
    }
  }

  const updateTitle = async (e) => {
    clearTimeout(timer)
    const newTitle = e.target.value
    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { title: newTitle })
      } catch (err) {
        alert(err)
      }
    }, timeout)

    task.title = newTitle
    setTitle(newTitle)
    props.onUpdate(task)
  }

  const updateContent = async (event, editor) => {
    clearTimeout(timer)
    const data = editor.getData()

    if (!isModalClosed) {
      timer = setTimeout(async () => {
        try {
          await taskApi.update(boardId, task.id, { content: data })
        } catch (err) {
          alert(err)
        }
      }, timeout);

      task.content = data
      setContent(data)
      props.onUpdate(task)
    }
  }

  return (
    <Modal
      open={task !== undefined}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ 
        timeout: 500,
        sx: { backdropFilter: 'blur(3px)', backgroundColor: alpha(theme.darkGreen, 0.7) }
      }}
    >
      <Fade in={task !== undefined}>
        <Box sx={modalStyle}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
            padding: '8px 16px',
            borderBottom: `1px solid ${alpha(theme.lightBeige, 0.1)}`
          }}>
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
            padding: { xs: '1rem 2rem 2rem', md: '2rem 5rem 3rem' },
            overflowY: 'auto'
          }}>
            <TextField
              value={title}
              onChange={updateTitle}
              placeholder='Untitled'
              variant='outlined'
              fullWidth
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-input': { 
                  padding: 0,
                  color: theme.lightBeige 
                },
                '& .MuiOutlinedInput-notchedOutline': { 
                  border: 'unset'
                },
                '& .MuiOutlinedInput-root': { 
                  fontSize: '2.5rem', 
                  fontWeight: '700'
                },
                marginBottom: '10px',
                '& ::placeholder': { 
                  color: alpha(theme.lightBeige, 0.5),
                  opacity: 1
                }
              }}
            />
            <Typography variant='body2' fontWeight='700' color={alpha(theme.warmBrown, 0.9)}>
              {task !== undefined ? Moment(task.createdAt).format('YYYY-MM-DD') : ''}
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
                onChange={updateContent}
                onFocus={updateEditorHeight}
                onBlur={updateEditorHeight}
                config={{
                  // Editor configuration options can go here
                  placeholder: 'Start typing here...'
                }}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  )
}

export default TaskModal
