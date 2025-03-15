import axiosClient from "./axiosClient"

const authApi = {
  signup: params => axiosClient.post('auth/signup', params),
  login: params => axiosClient.post('auth/login', params),
  verifyToken: () => axiosClient.post('auth/verify-token'),
  getAllUsers: () => axiosClient.get('auth/users'),
  updateUserRole: (userId, params) => axiosClient.put(`auth/users/${userId}`, params)
}

export default authApi
