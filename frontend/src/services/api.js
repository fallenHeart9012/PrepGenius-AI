const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Optional auto-logout on unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    throw new Error(data.message || 'API request failed.');
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => 
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handleResponse),

  login: (payload) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Profile
  getProfile: () =>
    fetch(`${BASE_URL}/users/profile`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateProfile: (payload) =>
    fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  updatePassword: (payload) =>
    fetch(`${BASE_URL}/users/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  // Interviews
  startInterview: (payload) =>
    fetch(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  getInterviews: () =>
    fetch(`${BASE_URL}/interviews`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getInterviewDetails: (id) =>
    fetch(`${BASE_URL}/interviews/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  submitAnswer: (interviewId, payload) =>
    fetch(`${BASE_URL}/interviews/${interviewId}/answer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }).then(handleResponse),

  completeInterview: (interviewId) =>
    fetch(`${BASE_URL}/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Analytics
  getAnalytics: () =>
    fetch(`${BASE_URL}/analytics/overview`, {
      headers: getAuthHeaders()
    }).then(handleResponse)
};
