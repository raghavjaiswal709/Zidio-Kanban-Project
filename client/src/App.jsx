import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './css/custom-scrollbar.css'
import CssBaseLine from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import Home from './pages/Home'
import Board from './pages/Board'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setUser } from './redux/features/userSlice'
import authUtils from './utils/authUtils'

function App() {
  const dispatch = useDispatch()
  const { darkMode } = useSelector((state) => state.darkMode)

  const theme = createTheme({
    palette: { mode: darkMode ? 'dark' : 'light' }
  })

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authUtils.isAuthenticated()
      if (user) {
        dispatch(setUser(user))
      }
    }
    checkAuth()
  }, [dispatch])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseLine />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<AuthLayout />}>
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<Signup />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route path='reset-password/:token' element={<ResetPassword />} />
          </Route>
          <Route path='/' element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path='boards' element={<Home />} />
            <Route path='boards/:boardId' element={<Board />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
