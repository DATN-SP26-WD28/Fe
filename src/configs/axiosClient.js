import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'https://api.example.com/',
  timeout: 1000,
  headers: { 'X-Custom-Header': 'foobar' },
})

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const token = localStorage.getItem('userToken') // Example: Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor (basic error logging example)
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response.status === 401) {
      // Handle unauthorized errors globally, e.g., redirect to login
      console.log('Unauthorized access - redirecting to login...')
      // In a real app, you would use a navigation helper for redirection
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
