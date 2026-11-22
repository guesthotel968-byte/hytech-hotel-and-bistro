// Hytech Hotel & Bistro API client service

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  /^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname) ||
  window.location.hostname.endsWith('.local')
);

const RENDER_BACKEND = 'https://hytech-hotel-and-bistro.onrender.com/api';

// Use environment VITE_API_URL if defined, otherwise localhost /api, or fallback to live Render backend
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : (isLocalhost ? '/api' : RENDER_BACKEND);

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
    // If request to direct Render failed and we're on Netlify, try relative /api proxy as fallback
    if (!isLocalhost && !endpoint.startsWith('http') && API_BASE === RENDER_BACKEND) {
      try {
        const fallbackRes = await fetch(`/api${endpoint}`, { ...options, headers });
        if (fallbackRes.ok) return await fallbackRes.json();
      } catch (e) {}
    }
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
  getFoodItems: (category, onlyAvailable = false) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (onlyAvailable) params.append('only_available', 'true');
    const q = params.toString();
    return request(`/food-items${q ? `?${q}` : ''}`);
  },
  createFoodItem: (data) => request('/food-items', { method: 'POST', body: JSON.stringify(data) }),
  updateFoodItem: (id, data) => request(`/food-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleFoodItem: (id) => request(`/food-items/${id}/toggle`, { method: 'PUT' }),
  deleteFoodItem: (id) => request(`/food-items/${id}`, { method: 'DELETE' }),
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
  updateProfile: (data) => request('/clients/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Auth & Account
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Reviews
  getReviews: () => request('/reviews'),
  createReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Calendar (Optionally filter by room, returns ONLY admin-confirmed bookings + admin blocks)
  getCalendar: (year, month, roomId = null, roomName = null) => {
    let url = `/calendar?year=${year}&month=${month}`;
    if (roomId) url += `&room_id=${roomId}`;
    if (roomName) url += `&room_name=${encodeURIComponent(roomName)}`;
    return request(url);
  },
  toggleCalendarDate: (data) => request('/calendar/toggle-date', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats')
};
