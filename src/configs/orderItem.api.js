import axiosClient from './axiosClient'

const PREFIX = '/order-items'

const orderItemAPI = {
  getAll: () => axiosClient.get(PREFIX),
  getById: (id) => axiosClient.get(`${PREFIX}/${id}`),
  updateStatus: (id, status) => axiosClient.put(`${PREFIX}/${id}`, { status }),
}

export default orderItemAPI
