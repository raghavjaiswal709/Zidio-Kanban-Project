import { Box } from '@mui/material'
import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import authUtils from '../../utils/authUtils'
import Loading from '../common/Loading'
import assets from '../../assets'

// Custom theme colors
const theme = {
  darkGreen: '#2C3930',    // Primary dark color
  mediumGreen: '#3F4F44',  // Secondary color
  warmBrown: '#A27B5C',    // Accent color
  lightBeige: '#DCD7C9',   // Text/light backgrounds
}

const AuthLayout = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await authUtils.isAuthenticated()
      if (!isAuth) {
        setLoading(false)
      } else {
        navigate('/')
      }
    }
    checkAuth()
  }, [navigate])

  return (
    loading ? (
      <Loading fullHeight />
    ) : (
      <Box 
        sx={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.darkGreen,
          backgroundImage: `linear-gradient(135deg, ${theme.darkGreen} 0%, ${theme.mediumGreen} 100%)`,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Optional decorative elements */}
        <Box 
          sx={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Uncomment and replace path if you want to use a logo */}
          {/* <img 
            src={assets.images.logoDark} 
            style={{ width: '80px', marginBottom: '10px' }} 
            alt='app logo' 
          /> */}
          <Box 
            component="span" 
            sx={{ 
              color: theme.lightBeige, 
              fontSize: '1.5rem', 
              fontWeight: 600,
              letterSpacing: '1px'
            }}
          >
            Task Manager
          </Box>
        </Box>
        
        {/* Content area */}
        <Box 
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}
        >
          <Outlet />
        </Box>
        
        {/* Optional background decoration */}
        <Box 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30%',
            background: `linear-gradient(to top, ${theme.darkGreen}55, transparent)`,
            zIndex: 1
          }}
        />
      </Box>
    )
  )
}

export default AuthLayout
