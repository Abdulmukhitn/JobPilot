import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      axiosInstance.post('/auth/login/', credentials),
    register: (userData: { email: string; password: string; name: string }) =>
      axiosInstance.post('/auth/register/', userData),
    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    },
  },
  jobs: {
    getAll: () => axiosInstance.get('/jobs/'),
    getById: (id: number) => axiosInstance.get(`/jobs/${id}/`),
    search: (query: string) => axiosInstance.get(`/jobs/search/?query=${query}`),
    match: (resumeId: number) => axiosInstance.post(`/jobs/match/${resumeId}/`),
  },
  resumes: {
    getAll: () => axiosInstance.get('/resumes/'),
    getById: (id: number) => axiosInstance.get(`/resumes/${id}/`),
    upload: (formData: FormData) =>
      axiosInstance.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    update: (id: number, data: any) => axiosInstance.put(`/resumes/${id}/`, data),
    delete: (id: number) => axiosInstance.delete(`/resumes/${id}/`),
  },
};

export default api;
