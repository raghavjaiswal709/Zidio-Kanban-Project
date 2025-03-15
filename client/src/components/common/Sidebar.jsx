import { useSelector, useDispatch } from 'react-redux'
import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography, alpha } from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import assets from '../../assets/index'
import { useEffect, useState } from 'react'
import boardApi from '../../api/boardApi'
import { setBoards } from '../../redux/features/boardSlice'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import FavouriteList from './FavouriteList'

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',
  mediumGreen: '#3F4F44',
  warmBrown: '#A27B5C',
  lightBeige: '#DCD7C9',
  darkGrey: '#444444',      // Dark grey for text
  lighterGrey: '#666666'    // Lighter grey for secondary text
}

const Sidebar = () => {
  const user = useSelector((state) => state.user.value)
  const boards = useSelector((state) => state.board.value)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { boardId } = useParams()
  const location = useLocation()
  const [activeIndex, setActiveIndex] = useState(0)

  const sidebarWidth = 250

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getAll()
        dispatch(setBoards(res))
      } catch (err) {
        alert(err)
      }
    }
    getBoards()
  }, [dispatch])

  useEffect(() => {
    const activeItem = boards.findIndex(e => e.id === boardId)
    if (boards.length > 0 && boardId === undefined) {
      navigate(`/boards/${boards[0].id}`)
    }
    setActiveIndex(activeItem)
  }, [boards, boardId, navigate])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return
    const newList = [...boards]
    const [removed] = newList.splice(source.index, 1)
    newList.splice(destination.index, 0, removed)

    const activeItem = newList.findIndex(e => e.id === boardId)
    setActiveIndex(activeItem)
    dispatch(setBoards(newList))

    try {
      await boardApi.updatePositoin({ boards: newList })
    } catch (err) {
      alert(err)
    }
  }

  const addBoard = async () => {
    try {
      const res = await boardApi.create()
      const newList = [res, ...boards]
      dispatch(setBoards(newList))
      navigate(`/boards/${res.id}`)
    } catch (err) {
      alert(err)
    }
  }

  return (
    <Drawer
      container={window.document.body}
      variant='permanent'
      open={true}
      sx={{
        width: sidebarWidth,
        height: '100vh',
        '& > div': { borderRight: 'none' }
      }}
    >
      <List
        disablePadding
        sx={{
          width: sidebarWidth,
          height: '100vh',
          backgroundColor: theme.lightBeige,
          color: theme.darkGrey,
          borderRight: `1px solid ${alpha(theme.mediumGreen, 0.2)}`
        }}
      >
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <Typography variant='body2' fontWeight='700' color={theme.darkGrey}>
              {user.username}
            </Typography>
            <IconButton 
              onClick={logout}
              sx={{ 
                color: theme.darkGrey,
                '&:hover': { 
                  color: theme.warmBrown,
                  bgcolor: alpha(theme.warmBrown, 0.1) 
                }
              }}
            >
              <LogoutOutlinedIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <Box sx={{ paddingTop: '10px' }} />
        <FavouriteList />
        <Box sx={{ paddingTop: '10px' }} />
        
        {/* Admin Section */}
        {user.role === 'admin' && (
          <>
            <ListItem>
              <Box sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant='body2' fontWeight='700' color={theme.darkGrey}>
                  Admin
                </Typography>
              </Box>
            </ListItem>
            
            <ListItemButton
              component={Link}
              to="/admin/users"
              sx={{
                pl: '20px',
                bgcolor: location.pathname === '/admin/users' ? alpha(theme.mediumGreen, 0.2) : 'transparent',
                color: location.pathname === '/admin/users' ? theme.darkGreen : theme.darkGrey,
                fontWeight: location.pathname === '/admin/users' ? 700 : 400,
                '&:hover': {
                  bgcolor: alpha(theme.mediumGreen, 0.1)
                }
              }}
            >
              <Box sx={{ mr: 1, fontSize: '1.25rem' }}>👥</Box>
              <Typography
                variant='body2'
                fontWeight={location.pathname === '/admin/users' ? '700' : '400'}
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'inherit'
                }}
              >
                User Management
              </Typography>
            </ListItemButton>
          </>
        )}
        
        {/* Assignee Section */}
        {user.role === 'assignee' && (
          <ListItemButton
            component={Link}
            to="/assigned-tasks"
            sx={{
              pl: '20px',
              bgcolor: location.pathname === '/assigned-tasks' ? alpha(theme.mediumGreen, 0.2) : 'transparent',
              color: location.pathname === '/assigned-tasks' ? theme.darkGreen : theme.darkGrey,
              fontWeight: location.pathname === '/assigned-tasks' ? 700 : 400,
              '&:hover': {
                bgcolor: alpha(theme.mediumGreen, 0.1)
              }
            }}
          >
            <Box sx={{ mr: 1, fontSize: '1.25rem' }}>📋</Box>
            <Typography
              variant='body2'
              fontWeight={location.pathname === '/assigned-tasks' ? '700' : '400'}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'inherit'
              }}
            >
              My Tasks
            </Typography>
          </ListItemButton>
        )}
        
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant='body2' fontWeight='700' color={theme.darkGrey}>
              Private
            </Typography>
            <IconButton 
              onClick={addBoard}
              sx={{ 
                color: theme.darkGrey,
                '&:hover': { 
                  color: theme.warmBrown,
                  bgcolor: alpha(theme.warmBrown, 0.1) 
                }
              }}
            >
              <AddBoxOutlinedIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable key={'list-board-droppable-key'} droppableId={'list-board-droppable'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {
                  boards.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <ListItemButton
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          selected={index === activeIndex}
                          component={Link}
                          to={`/boards/${item.id}`}
                          sx={{
                            pl: '20px',
                            cursor: snapshot.isDragging ? 'grab' : 'pointer!important',
                            bgcolor: index === activeIndex ? alpha(theme.mediumGreen, 0.2) : 'transparent',
                            color: index === activeIndex ? theme.darkGreen : theme.darkGrey,
                            fontWeight: index === activeIndex ? 700 : 400,
                            '&:hover': {
                              bgcolor: alpha(theme.mediumGreen, 0.1)
                            },
                            '&.Mui-selected': {
                              bgcolor: alpha(theme.mediumGreen, 0.2),
                              '&:hover': {
                                bgcolor: alpha(theme.mediumGreen, 0.3)
                              }
                            }
                          }}
                        >
                          <Typography
                            variant='body2'
                            fontWeight={index === activeIndex ? '700' : '400'}
                            sx={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              color: 'inherit'
                            }}
                          >
                            {item.icon} {item.title}
                          </Typography>
                        </ListItemButton>
                      )}
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>
    </Drawer>
  )
}

export default Sidebar