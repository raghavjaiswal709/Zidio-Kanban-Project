import { Box, Button, TextField, Typography, Paper, alpha, Alert } from '@mui/material'
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

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [usernameErrText, setUsernameErrText] = useState('')
  const [passwordErrText, setPasswordErrText] = useState('')
  const [generalError, setGeneralError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUsernameErrText('')
    setPasswordErrText('')
    setGeneralError('')

    const data = new FormData(e.target)
    const username = data.get('username').trim()
    const password = data.get('password').trim()

    let err = false

    if (username === '') {
      err = true
      setUsernameErrText('Please fill this field')
    }
    if (password === '') {
      err = true
      setPasswordErrText('Please fill this field')
    }

    if (err) return

    setLoading(true)

    try {
      const res = await authApi.login({ username, password })
      localStorage.setItem('token', res.token)
      navigate('/')
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error structures
      if (err && err.data && err.data.errors && Array.isArray(err.data.errors)) {
        // Standard validation errors from the backend
        err.data.errors.forEach(e => {
          if (e.param === 'username') {
            setUsernameErrText(e.msg)
          }
          if (e.param === 'password') {
            setPasswordErrText(e.msg)
          }
        })
      } else if (err && err.status === 401) {
        // Authentication error
        setGeneralError('Invalid username or password')
      } else if (err && err.status >= 500) {
        // Server error
        setGeneralError('Server error. Please try again later.')
      } else {
        // Unknown error format or network error
        setGeneralError('Unable to connect to the server. Please check your connection.')
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
        backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.darkGreen, 0.95)}, ${alpha(theme.mediumGreen, 0.9)})`,
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
          Welcome Back
        </Typography>
        
        <Box
          component='form'
          sx={{ mt: 1 }}
          onSubmit={handleSubmit}
          noValidate
        >
          {generalError && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, backgroundColor: alpha('#f44336', 0.1), color: '#f44336' }}
            >
              {generalError}
            </Alert>
          )}
          
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
            Sign In
          </LoadingButton>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
            <Button
              component={Link}
              to='/forgot-password'
              sx={{ 
                textTransform: 'none',
                color: theme.lightBeige,
                '&:hover': {
                  color: theme.warmBrown,
                  backgroundColor: 'transparent'
                },
                fontSize: '0.85rem',
                padding: 0
              }}
            >
              Forgot password?
            </Button>
            
            <Button
              component={Link}
              to='/signup'
              sx={{ 
                textTransform: 'none',
                color: theme.lightBeige,
                '&:hover': {
                  color: theme.warmBrown,
                  backgroundColor: 'transparent'
                },
                fontSize: '0.85rem',
                padding: 0
              }}
            >
              Don't have an account? Sign up
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login
