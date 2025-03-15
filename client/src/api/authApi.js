import axiosClient from "./axiosClient"

const authApi = {
  signup: params => axiosClient.post('auth/signup', params),
  login: params => axiosClient.post('auth/login', params),
  verifyToken: () => axiosClient.post('auth/verify-token'),
  getAllUsers: () => axiosClient.get('auth/users'),
  updateUserRole: (userId, params) => axiosClient.put(`auth/users/${userId}`, params),
  forgotPassword: params => axiosClient.post('auth/forgot-password', params),
  resetPassword: (token, params) => axiosClient.post(`auth/reset-password/${token}`, params)
}

export default authApi
