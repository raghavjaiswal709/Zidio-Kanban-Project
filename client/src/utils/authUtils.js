import authApi from "../api/authApi"

const authUtils = {
  isAuthenticated: async () => {
    const token = localStorage.getItem('token')
    if (!token) return false
    try {
      const res = await authApi.verifyToken()
      return res.user
    } catch {
      return false
    }
  },
  
  isAdmin: (user) => {
    return user && user.role === 'admin';
  },
  
  canManageTask: (user, task) => {
    if (!user || !task) return false;
    return user.role === 'admin' || 
           (task.assignee && task.assignee === user._id);
  }
}

export default authUtils
