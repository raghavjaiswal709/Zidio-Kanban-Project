import { createSlice } from '@reduxjs/toolkit'

const initialState = { value: {} }

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.value = action.payload
    },
    resetPasswordRequest: (state) => {
      state.passwordResetRequested = true
    },
    resetPasswordSuccess: (state) => {
      state.passwordResetSuccess = true
      state.passwordResetRequested = false
    },
    resetPasswordFailure: (state) => {
      state.passwordResetSuccess = false
      state.passwordResetRequested = false
    },
    clearResetState: (state) => {
      state.passwordResetRequested = false
      state.passwordResetSuccess = false
    }
  }
})

export const { 
  setUser, 
  resetPasswordRequest, 
  resetPasswordSuccess, 
  resetPasswordFailure,
  clearResetState
} = userSlice.actions

export default userSlice.reducer
