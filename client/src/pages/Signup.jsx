import { Box, Button, TextField, Typography, Paper, alpha, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingButton from '@mui/lab/LoadingButton'
import authApi from '../api/authApi'

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',    // Primary dark color
  mediumGreen: '#3F4F44',  // Secondary color
  warmBrown: '#A27B5C',    // Accent color
  lightBeige: '#DCD7C9',   // Text/light backgrounds
}

const Signup = () => {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [usernameErrText, setUsernameErrText] = useState('')
  const [passwordErrText, setPasswordErrText] = useState('')
  const [confirmPasswordErrText, setConfirmPasswordErrText] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [role, setRole] = useState('assignee')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear all previous error messages
    setUsernameErrText('')
    setPasswordErrText('')
    setConfirmPasswordErrText('')
    setGeneralError('')

    const data = new FormData(e.target)
    const username = data.get('username').trim()
    const password = data.get('password').trim()
    const confirmPassword = data.get('confirmPassword').trim()
    const selectedRole = data.get('role')

    let err = false

    // Client-side validation
    if (username === '') {
      err = true
      setUsernameErrText('Please fill this field')
    } else if (username.length < 8) {
      err = true
      setUsernameErrText('Username must be at least 8 characters')
    }

    if (password === '') {
      err = true
      setPasswordErrText('Please fill this field')
    } else if (password.length < 8) {
      err = true
      setPasswordErrText('Password must be at least 8 characters')
    }

    if (confirmPassword === '') {
      err = true
      setConfirmPasswordErrText('Please fill this field')
    } else if (password !== confirmPassword) {
      err = true
      setConfirmPasswordErrText('Confirm password not match')
    }

    if (err) return

    setLoading(true)

    try {
      // Log the data being sent to help debug
      console.log("Sending signup data:", { username, role: selectedRole })
      
      const res = await authApi.signup({
        username,
        password,
        confirmPassword,
        role: selectedRole
      })
      
      // If successful, store token and navigate
      localStorage.setItem('token', res.token)
      navigate('/')
    } catch (err) {
      console.error('Signup error:', err)
      
      // Log detailed error information
      if (err.response) {
        console.error('Response data:', err.response.data)
        console.error('Status code:', err.response.status)
        console.error('Headers:', err.response.headers)
        
        // Handle specific validation errors in response
        if (err.response.data && err.response.data.errors) {
          const serverErrors = err.response.data.errors
          
          serverErrors.forEach(error => {
            if (error.param === 'username') {
              setUsernameErrText(error.msg)
            } else if (error.param === 'password') {
              setPasswordErrText(error.msg)
            } else if (error.param === 'confirmPassword') {
              setConfirmPasswordErrText(error.msg)
            } else if (error.param === 'role') {
              setGeneralError(`Role error: ${error.msg}`)
            }
          })
        } else if (err.response.data && err.response.data.message) {
          // Handle general error message
          setGeneralError(err.response.data.message)
        } else {
          setGeneralError('Validation failed. Please check your input and try again.')
        }
      } else if (err.request) {
        console.error('Request made but no response received')
        setGeneralError('No response from server. Please try again later.')
      } else {
        console.error('Error setting up request:', err.message)
        setGeneralError('An error occurred during signup. Please try again later.')
      }
      
      // Special handling for the data format in your specific error
      if (err.data && err.data.errors) {
        const serverErrors = err.data.errors
        serverErrors.forEach(error => {
          if (error.param === 'username') {
            setUsernameErrText(error.msg)
          } else if (error.param === 'password') {
            setPasswordErrText(error.msg)
          } else if (error.param === 'confirmPassword') {
            setConfirmPasswordErrText(error.msg)
          } else if (error.param === 'role') {
            setGeneralError(`Role error: ${error.msg}`)
          }
        })
      } else if (err.data && err.data.message) {
        setGeneralError(err.data.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.darkGreen,
        backgroundImage: `linear-gradient(135deg, ${theme.darkGreen} 0%, ${theme.mediumGreen} 100%)`,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          borderRadius: 2,
          maxWidth: '450px',
          width: '90%',
          backgroundColor: alpha(theme.mediumGreen, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.lightBeige, 0.1)}`,
          boxShadow: `0 8px 32px ${alpha(theme.darkGreen, 0.4)}`,
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: theme.lightBeige, 
            textAlign: 'center',
            mb: 3,
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          Create Account
        </Typography>
        
        {/* General error message */}
        {generalError && (
          <Typography
            color="error"
            variant="body2"
            sx={{
              textAlign: 'center',
              mb: 2,
              p: 1,
              backgroundColor: alpha('#f44336', 0.1),
              borderRadius: '4px'
            }}
          >
            {generalError}
          </Typography>
        )}
        
        <Box
          component='form'
          sx={{ mt: 1 }}
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            margin='normal'
            required
            fullWidth
            id='username'
            label='Username'
            name='username'
            disabled={loading}
            error={usernameErrText !== ''}
            helperText={usernameErrText}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: alpha(theme.lightBeige, 0.3) },
                '&:hover fieldset': { borderColor: alpha(theme.lightBeige, 0.5) },
                '&.Mui-focused fieldset': { borderColor: theme.warmBrown },
                color: theme.lightBeige,
              },
              '& .MuiInputLabel-root': { 
                color: alpha(theme.lightBeige, 0.7),
                '&.Mui-focused': { color: theme.warmBrown }
              },
              '& .MuiFormHelperText-root': {
                color: theme.lightBeige,
                '&.Mui-error': { color: '#f44336' }
              }
            }}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            id='password'
            label='Password'
            name='password'
            type='password'
            disabled={loading}
            error={passwordErrText !== ''}
            helperText={passwordErrText}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: alpha(theme.lightBeige, 0.3) },
                '&:hover fieldset': { borderColor: alpha(theme.lightBeige, 0.5) },
                '&.Mui-focused fieldset': { borderColor: theme.warmBrown },
                color: theme.lightBeige,
              },
              '& .MuiInputLabel-root': { 
                color: alpha(theme.lightBeige, 0.7),
                '&.Mui-focused': { color: theme.warmBrown }
              },
              '& .MuiFormHelperText-root': {
                color: theme.lightBeige,
                '&.Mui-error': { color: '#f44336' }
              }
            }}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            id='confirmPassword'
            label='Confirm Password'
            name='confirmPassword'
            type='password'
            disabled={loading}
            error={confirmPasswordErrText !== ''}
            helperText={confirmPasswordErrText}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: alpha(theme.lightBeige, 0.3) },
                '&:hover fieldset': { borderColor: alpha(theme.lightBeige, 0.5) },
                '&.Mui-focused fieldset': { borderColor: theme.warmBrown },
                color: theme.lightBeige,
              },
              '& .MuiInputLabel-root': { 
                color: alpha(theme.lightBeige, 0.7),
                '&.Mui-focused': { color: theme.warmBrown }
              },
              '& .MuiFormHelperText-root': {
                color: theme.lightBeige,
                '&.Mui-error': { color: '#f44336' }
              }
            }}
          />
          <FormControl 
            fullWidth 
            margin='normal'
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: alpha(theme.lightBeige, 0.3) },
                '&:hover fieldset': { borderColor: alpha(theme.lightBeige, 0.5) },
                '&.Mui-focused fieldset': { borderColor: theme.warmBrown },
                color: theme.lightBeige,
              },
              '& .MuiInputLabel-root': { 
                color: alpha(theme.lightBeige, 0.7),
                '&.Mui-focused': { color: theme.warmBrown }
              },
              '& .MuiSelect-icon': {
                color: theme.lightBeige
              }
            }}
          >
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="assignee">Assignee</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <LoadingButton
            sx={{ 
              mt: 3, 
              mb: 2,
              bgcolor: theme.warmBrown,
              color: theme.lightBeige,
              '&:hover': { 
                bgcolor: alpha(theme.warmBrown, 0.8),
                boxShadow: `0 4px 8px ${alpha(theme.darkGreen, 0.3)}`
              },
              transition: 'all 0.3s ease',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'none',
              borderRadius: '4px',
              padding: '10px 0'
            }}
            variant='contained'
            fullWidth
            type='submit'
            loading={loading}
            loadingPosition="center"
          >
            Create Account
          </LoadingButton>
        </Box>
        <Button
          component={Link}
          to='/login'
          sx={{ 
            textTransform: 'none',
            color: theme.lightBeige,
            display: 'block',
            textAlign: 'center',
            margin: '0 auto',
            '&:hover': {
              color: theme.warmBrown,
              backgroundColor: 'transparent'
            },
            fontSize: '0.9rem'
          }}
        >
          Already have an account? Login
        </Button>
      </Paper>
    </Box>
  )
}

export default Signup
