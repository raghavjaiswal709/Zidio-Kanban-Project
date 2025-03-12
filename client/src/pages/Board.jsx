import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined'
import StarOutlinedIcon from '@mui/icons-material/StarOutlined'
import { Box, IconButton, TextField, Paper, alpha } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import boardApi from '../api/boardApi'
import EmojiPicker from '../components/common/EmojiPicker'
import Kanban from '../components/common/Kanban'
import { setBoards } from '../redux/features/boardSlice'
import { setFavouriteList } from '../redux/features/favouriteSlice'

let timer
const timeout = 500

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',    // Dark background, primary text
  mediumGreen: '#3F4F44',  // Secondary backgrounds, buttons
  warmBrown: '#A27B5C',    // Accents, highlights
  lightBeige: '#DCD7C9',   // Text, borders
}

const Board = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { boardId } = useParams()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState([])
  const [isFavourite, setIsFavourite] = useState(false)
  const [icon, setIcon] = useState('')

  const boards = useSelector((state) => state.board.value)
  const favouriteList = useSelector((state) => state.favourites.value)

  useEffect(() => {
    const getBoard = async () => {
      try {
        const res = await boardApi.getOne(boardId)
        setTitle(res.title)
        setDescription(res.description)
        setSections(res.sections)
        setIsFavourite(res.favourite)
        setIcon(res.icon)
      } catch (err) {
        alert(err)
      }
    }
    getBoard()
  }, [boardId])

  const onIconChange = async (newIcon) => {
    clearTimeout(timer)
    let temp = [...boards]
    const index = temp.findIndex(e => e.id === boardId)
    temp[index] = { ...temp[index], icon: newIcon }

    if (isFavourite) {
      let tempFavourite = [...favouriteList]
      const favouriteIndex = tempFavourite.findIndex(e => e.id === boardId)
      tempFavourite[favouriteIndex] = { ...tempFavourite[favouriteIndex], icon: newIcon }
      dispatch(setFavouriteList(tempFavourite))
    }

    setIcon(newIcon)
    dispatch(setBoards(temp))
    try {
      await boardApi.update(boardId, { icon: newIcon })
    } catch (err) {
      alert(err)
    }
  }

  const updateTitle = async (e) => {
    clearTimeout(timer)
    const newTitle = e.target.value
    setTitle(newTitle)

    let temp = [...boards]
    const index = temp.findIndex(e => e.id === boardId)
    temp[index] = { ...temp[index], title: newTitle }

    if (isFavourite) {
      let tempFavourite = [...favouriteList]
      const favouriteIndex = tempFavourite.findIndex(e => e.id === boardId)
      tempFavourite[favouriteIndex] = { ...tempFavourite[favouriteIndex], title: newTitle }
      dispatch(setFavouriteList(tempFavourite))
    }

    dispatch(setBoards(temp))

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { title: newTitle })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const updateDescription = async (e) => {
    clearTimeout(timer)
    const newDescription = e.target.value
    setDescription(newDescription)
    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { description: newDescription })
      } catch (err) {
        alert(err)
      }
    }, timeout);
  }

  const addFavourite = async () => {
    try {
      const board = await boardApi.update(boardId, { favourite: !isFavourite })
      let newFavouriteList = [...favouriteList]
      if (isFavourite) {
        newFavouriteList = newFavouriteList.filter(e => e.id !== boardId)
      } else {
        newFavouriteList.unshift(board)
      }
      dispatch(setFavouriteList(newFavouriteList))
      setIsFavourite(!isFavourite)
    } catch (err) {
      alert(err)
    }
  }

  const deleteBoard = async () => {
    try {
      await boardApi.delete(boardId)
      if (isFavourite) {
        const newFavouriteList = favouriteList.filter(e => e.id !== boardId)
        dispatch(setFavouriteList(newFavouriteList))
      }

      const newList = boards.filter(e => e.id !== boardId)
      if (newList.length === 0) {
        navigate('/boards')
      } else {
        navigate(`/boards/${newList[0].id}`)
      }
      dispatch(setBoards(newList))
    } catch (err) {
      alert(err)
    }
  }

  return (
    <Box sx={{ 
      bgcolor: theme.darkGreen, 
      minHeight: '100vh', 
      color: theme.lightBeige 
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px',
        bgcolor: alpha(theme.mediumGreen, 0.9),
        borderBottom: `1px solid ${alpha(theme.lightBeige, 0.2)}`
      }}>
        <IconButton 
          variant='outlined' 
          onClick={addFavourite}
          sx={{ 
            color: isFavourite ? theme.warmBrown : alpha(theme.lightBeige, 0.7),
            '&:hover': { 
              bgcolor: alpha(theme.warmBrown, 0.1),
              color: theme.lightBeige
            }
          }}
        >
          {
            isFavourite ? (
              <StarOutlinedIcon />
            ) : (
              <StarBorderOutlinedIcon />
            )
          }
        </IconButton>
        <IconButton 
          variant='outlined' 
          onClick={deleteBoard}
          sx={{ 
            color: alpha(theme.lightBeige, 0.7),
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
        padding: '20px 50px', 
        bgcolor: alpha(theme.mediumGreen, 0.7), 
        boxShadow: `0 1px 3px ${alpha('#000000', 0.3)}`
      }}>
        <Paper 
          elevation={0} 
          sx={{ 
            padding: '15px', 
            mb: 2, 
            bgcolor: alpha(theme.mediumGreen, 0.8),
            color: theme.lightBeige,
            border: `1px solid ${alpha(theme.lightBeige, 0.1)}`,
            borderRadius: '4px'
          }}
        >
          <EmojiPicker icon={icon} onChange={onIconChange} />
          <TextField
            value={title}
            onChange={updateTitle}
            placeholder='Untitled'
            variant='outlined'
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { 
                padding: 0, 
                color: theme.lightBeige 
              },
              '& .MuiOutlinedInput-notchedOutline': { 
                border: 'unset' 
              },
              '& .MuiOutlinedInput-root': { 
                fontSize: '2rem', 
                fontWeight: '700' 
              },
              '& ::placeholder': { 
                color: alpha(theme.lightBeige, 0.5),
                opacity: 1
              }
            }}
          />
          <TextField
            value={description}
            onChange={updateDescription}
            placeholder='Add a description'
            variant='outlined'
            multiline
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { 
                padding: 0, 
                color: alpha(theme.lightBeige, 0.8) 
              },
              '& .MuiOutlinedInput-notchedOutline': { 
                border: 'unset' 
              },
              '& .MuiOutlinedInput-root': { 
                fontSize: '0.8rem' 
              },
              '& ::placeholder': { 
                color: alpha(theme.lightBeige, 0.4),
                opacity: 1
              }
            }}
          />
        </Paper>
        <Box>
          <Kanban data={sections} boardId={boardId} />
        </Box>
      </Box>
    </Box>
  )
}

export default Board
