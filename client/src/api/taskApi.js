import axiosClient from './axiosClient'

const taskApi = {
  create: (boardId, params) => axiosClient.post(`boards/${boardId}/tasks`, params),
  updatePosition: (boardId, params) => axiosClient.put(
    `boards/${boardId}/tasks/update-position`,
    params
  ),
  delete: (boardId, taskId) => axiosClient.delete(`boards/${boardId}/tasks/${taskId}`),
  update: (boardId, taskId, params) => axiosClient.put(
    `boards/${boardId}/tasks/${taskId}`,
    params
  ),
  getAssignedTasks: () => axiosClient.get('tasks/assigned')
}

export default taskApi