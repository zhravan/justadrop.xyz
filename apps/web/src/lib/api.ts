const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getAuthToken(): string | null {
  // Check localStorage first (remember me)
  let token = localStorage.getItem('authToken');
  
  // If not in localStorage, check sessionStorage
  if (!token) {
    token = sessionStorage.getItem('authToken');
  }
  
  return token;
}

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}
