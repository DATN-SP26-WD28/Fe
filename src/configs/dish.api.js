import axiosInstance from './axiosClient';

const mapBackendDishToFrontend = (d) => {
  if (!d) return null;
  const price = d.price == null ? 0 : Number(d.price);
  const categoryObj = d.category_id && typeof d.category_id === 'object' ? d.category_id : null;
  return {
    _id: d._id,
    name: d.dish_name,
    description: d.description,
    price,
    status: d.status,
    image: d.image_url,
    category: categoryObj ? { _id: categoryObj._id || categoryObj.id, name: categoryObj.category_name || categoryObj.name } : (d.category_id || null),
    raw: d,
  };
};

const dishAPI = {
  getAll: async (params = null) => {
    const { data } = await axiosInstance.get('/dishes', { params });
    if (!Array.isArray(data)) return [];
    return data.map(mapBackendDishToFrontend);
  },
  create: async (payload) => {
    const body = {
      dish_name: payload.name,
      category_id: payload.categoryId || (payload.category && (payload.category._id || payload.category.id)),
      description: payload.description,
      price: payload.price != null ? String(payload.price) : undefined,
      status: payload.status || 'available',
      image_url: payload.image,
    };
    const { data } = await axiosInstance.post('/dishes', body);
    return mapBackendDishToFrontend(data);
  },
  update: async (id, payload) => {
    const body = {
      dish_name: payload.name,
      category_id: payload.categoryId || (payload.category && (payload.category._id || payload.category.id)),
      description: payload.description,
      price: payload.price != null ? String(payload.price) : undefined,
      status: payload.status || 'available',
      image_url: payload.image,
    };
    const { data } = await axiosInstance.put(`/dishes/${id}`, body);
    return mapBackendDishToFrontend(data);
  },
  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/dishes/${id}`);
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/dishes/${id}`);
    return mapBackendDishToFrontend(data);
  },
};

export default dishAPI;
