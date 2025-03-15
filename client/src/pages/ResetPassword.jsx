import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Button, TextField, Typography, Alert } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import authApi from '../api/authApi'
import { setUser } from '../redux/features/userSlice'

const ResetPassword = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useParams()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setConfirmPasswordError('')
    setError('')
    
    let err = false
    if (password.length < 8) {
      err = true
      setPasswordError('Password must be at least 8 characters')
    }
    
    if (password !== confirmPassword) {
      err = true
      setConfirmPasswordError('Passwords do not match')
    }

    if (err) return

    setIsSubmitting(true)
    
    try {
      const res = await authApi.resetPassword(token, { password })
      
      // Set user and token if login is automatic after reset
      if (res.user && res.token) {
        localStorage.setItem('token', res.token)
        dispatch(setUser(res.user))
        navigate('/')
      } else {
        // Navigate to login if not auto-login
        navigate('/login', { 
          state: { message: 'Password reset successful. Please login with your new password.' } 
        })
      }
    } catch (error) {
      const errors = error.data?.errors || []
      if (errors.length) {
        errors.forEach(e => {
          if (e.param === 'token') {
            setError('Invalid or expired reset link. Please request a new one.')
          } else if (e.param === 'password') {
            setPasswordError(e.msg)
          }
        })
      } else {
        setError('Failed to reset password. Please try again later.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Box
        component='form'
        sx={{ mt: 1 }}
        onSubmit={handleSubmit}
        noValidate
      >
        <Typography variant='h5' sx={{ mb: 3, textAlign: 'center' }}>
          Reset Password
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          margin='normal'
          required
          fullWidth
          id='password'
          label='New Password'
          name='password'
          type='password'
          disabled={isSubmitting}
          error={passwordError !== ''}
          helperText={passwordError}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          margin='normal'
          required
          fullWidth
          id='confirmPassword'
          label='Confirm Password'
          name='confirmPassword'
          type='password'
          disabled={isSubmitting}
          error={confirmPasswordError !== ''}
          helperText={confirmPasswordError}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant='outlined'
          fullWidth
          color='success'
          type='submit'
          loading={isSubmitting}
        >
          Reset Password
        </LoadingButton>

        <Button
          component={Link}
          to='/login'
          fullWidth
          sx={{ textTransform: 'none' }}
        >
          Back to Login
        </Button>
      </Box>
    </>
  )
}

export default ResetPassword

