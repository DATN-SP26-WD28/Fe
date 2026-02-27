// import axiosClient from '../axiosClient';

const categoryAPI = {
  getAll: (params = null) => {
    // return axiosClient.get('/category', { params });
    // Fake API
    return fetch('/src/data/categories.placeholder.json').then(res => res.json());
  },
  create: (data) => {
    // return axiosClient.post('/category', data);
    // Fake API
    return Promise.resolve({ ...data, key: `c${Date.now()}` });
  },
  update: (id, data) => {
    // return axiosClient.patch(`/category/${id}`, data);
    // Fake API
    return Promise.resolve({ ...data, key: id });
  },
  delete: (id) => {
    // return axiosClient.delete(`/category/${id}`);
    // Fake API
    return Promise.resolve({ key: id });
  },
  getById: (id) => {
    // return axiosClient.get(`/category/${id}`);
    // Fake API
    return fetch('/src/data/categories.placeholder.json')
      .then(res => res.json())
      .then(data => data.find(item => item.key === id));
  },
};

export default categoryAPI;
