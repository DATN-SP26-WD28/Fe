import axiosClient from './axiosClient';

export const registerUser = async (userData) => {
    const formattedData = {
        username: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: 'customer'
    };

    const response = await axiosClient.post('/auth/register', formattedData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axiosClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
    });
    return response.data;
};

export const getMe = async () => {
  const response = await axiosClient.get('/users/me');
  return response.data.data; // Trả về thẳng object user
};