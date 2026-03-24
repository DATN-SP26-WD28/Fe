import axiosInstance from './axiosClient';

const categoryAPI = {
  getAll: async (params = null) => {
    const { data } = await axiosInstance.get('/categories', { params });
    // map backend category schema to frontend-friendly shape
    if (!Array.isArray(data)) return []
    return data.map((c) => ({
      _id: c._id,
      name: c.category_name,
      description: c.description,
      image: c.image_url,
      status: c.status ? 'Active' : 'Inactive',
      raw: c,
    }));
  },
  create: async (payload) => {
    // map frontend payload to backend fields
    const body = {
      category_name: payload.name,
      description: payload.description,
      image_url: payload.image,
      status: typeof payload.status === 'boolean' ? payload.status : payload.status === 'Active',
    }
    const { data } = await axiosInstance.post('/categories', body);
    const c = data
    return {
      _id: c._id,
      name: c.category_name,
      description: c.description,
      image: c.image_url,
      status: c.status ? 'Active' : 'Inactive',
      raw: c,
    };
  },
  update: async (id, payload) => {
    const body = {
      category_name: payload.name,
      description: payload.description,
      image_url: payload.image,
      status: typeof payload.status === 'boolean' ? payload.status : payload.status === 'Active',
    }
    const { data } = await axiosInstance.put(`/categories/${id}`, body);
    const c = data
    return {
      _id: c._id,
      name: c.category_name,
      description: c.description,
      image: c.image_url,
      status: c.status ? 'Active' : 'Inactive',
      raw: c,
    };
  },
  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/categories/${id}`);
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/categories/${id}`);
    const c = data
    return {
      _id: c._id,
      name: c.category_name,
      description: c.description,
      image: c.image_url,
      status: c.status ? 'Active' : 'Inactive',
      raw: c,
    };
  },
};

export default categoryAPI;
