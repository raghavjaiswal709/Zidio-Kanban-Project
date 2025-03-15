import axios from 'axios'
import queryString from 'query-string'

// const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1/'
const baseUrl = 'https://zidio-kanban-project.vercel.app/api/v1/';
const axiosClient = axios.create({
  baseURL: baseUrl,
  paramsSerializer: params => queryString.stringify(params)
})

axiosClient.interceptors.request.use(async (config) => {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }
})

axiosClient.interceptors.response.use((response) => {
  if (response && response.data) return response.data
  return response
}, (err) => {
  if (err.response) {
    // The request was made and the server responded with an error status
    console.error('API Error Response:', err.response);
    throw err.response;
  } else if (err.request) {
    // The request was made but no response was received
    console.error('API No Response:', err.request);
    throw { data: { message: 'No response from server' } };
  } else {
    // Something happened in setting up the request
    console.error('API Request Error:', err.message);
    throw { data: { message: err.message } };
  }
})

export default axiosClient
