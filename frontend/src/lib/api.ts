export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


export const getAuthToken = () => localStorage.getItem('admin_token');

export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
