import axios from 'axios';

const API_URL = 'http://localhost:8888';

export const registerUser = async (userData) => {
    const formattedData = {
        username: userData.fullname,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: 'customer' 
    };

    const response = await axios.post(`${API_URL}/auth/register`, formattedData);
    return response.data;
};