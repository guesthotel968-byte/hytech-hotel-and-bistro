// Hytech Hotel & Bistro API client service

// If VITE_API_URL is set in environment (e.g. Render / Netlify), use it, otherwise use relative '/api'
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Rooms
  getRooms: (type) => request(`/rooms${type ? `?type=${encodeURIComponent(type)}` : ''}`),
  getRoomById: (id) => request(`/rooms/${id}`),
  createRoom: (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),

  // Extras
  getExtras: () => request('/extras'),
  createExtra: (data) => request('/extras', { method: 'POST', body: JSON.stringify(data) }),
  updateExtra: (id, data) => request(`/extras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExtra: (id) => request(`/extras/${id}`, { method: 'DELETE' }),

  // Vouchers
  getVouchers: () => request('/vouchers'),
  createVoucher: (data) => request('/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  toggleVoucherStatus: (id, status) => request(`/vouchers/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteVoucher: (id) => request(`/vouchers/${id}`, { method: 'DELETE' }),
  validateVoucher: (code, amount) => request('/vouchers/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),

  // Keys
  getKeys: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/keys${query ? `?${query}` : ''}`);
  },
  createKey: (data) => request('/keys', { method: 'POST', body: JSON.stringify(data) }),
  updateKey: (id, data) => request(`/keys/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKey: (id) => request(`/keys/${id}`, { method: 'DELETE' }),

  // Dining & Beverages
  getFoodItems: (category) => request(`/food-items${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  createFoodItem: (data) => request('/food-items', { method: 'POST', body: JSON.stringify(data) }),
  getFoodOrders: () => request('/food-orders'),
  createFoodOrder: (data) => request('/food-orders', { method: 'POST', body: JSON.stringify(data) }),
  updateFoodOrderStatus: (id, status) => request(`/food-orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Bookings
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings${query ? `?${query}` : ''}`);
  },
  getMyBookings: (email) => request(`/bookings/my?email=${encodeURIComponent(email)}`),
  getBookingByRef: (refId) => request(`/bookings/${refId}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBooking: (id, data) => request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Clients
  getClients: (search) => request(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  // Reviews
  getReviews: () => request('/reviews'),
  createReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Calendar
  getCalendar: (year, month) => request(`/calendar?year=${year}&month=${month}`),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats')
};
