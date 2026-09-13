import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('autoclean_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized (Session Expired/Revoked)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xoá token nếu backend báo lỗi 401 (Hết hạn hoặc bị huỷ)
      localStorage.removeItem('autoclean_token');

      // Không reload nếu đang ở form đăng nhập/đăng ký
      const configUrl = error.config?.url || '';
      if (!configUrl.includes('/auth/login') && !configUrl.includes('/auth/register')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);





// AI Price Preview API
export const previewPrice = async (data: {
  vehicleType: string;
  timeSlot: string;
  bookingDate: string;
  basePrice: number;
}) => {
  const response = await api.post('/bookings/preview-price', data);
  return response.data;
};
export default api;
