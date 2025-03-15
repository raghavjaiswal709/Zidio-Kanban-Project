import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Button, TextField, Typography, Alert } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import authApi from '../api/authApi'
import { resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure } from '../redux/features/userSlice'

const ForgotPassword = () => {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')
    setError('')
    
    let err = false
    if (!email.trim()) {
      err = true
      setEmailError('Please enter your email')
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      err = true
      setEmailError('Invalid email format')
    }

    if (err) return

    setIsSubmitting(true)
    dispatch(resetPasswordRequest())
    
    try {
      const res = await authApi.forgotPassword({ email })
      dispatch(resetPasswordSuccess())
      setSuccess(true)
      setEmail('')
    } catch (error) {
      dispatch(resetPasswordFailure())
      const errors = error.data?.errors || []
      if (errors.length) {
        errors.forEach(e => {
          if (e.param === 'email') {
            setEmailError(e.msg)
          }
        })
      } else {
        setError('Failed to send reset email. Please try again later.')
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
          Forgot Password
        </Typography>

        {success && (
          <Alert severity='success' sx={{ mb: 3 }}>
            Password reset email sent! Please check your inbox.
          </Alert>
        )}

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          margin='normal'
          required
          fullWidth
          id='email'
          label='Email'
          name='email'
          disabled={isSubmitting || success}
          error={emailError !== ''}
          helperText={emailError}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant='outlined'
          fullWidth
          color='success'
          type='submit'
          loading={isSubmitting}
          disabled={success}
        >
          Send Reset Link
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

export default ForgotPassword
