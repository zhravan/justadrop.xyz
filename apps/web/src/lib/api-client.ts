import type {
  Opportunity,
  OpportunityWithComputed,
  CreateOpportunityRequest,
  OpportunityFilters,
  Participation,
  ParticipationWithDetails,
} from '@justadrop/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  // Check localStorage first (remember me)
  let token = localStorage.getItem('authToken');
  // If not in localStorage, check sessionStorage
  if (!token) {
    token = sessionStorage.getItem('authToken');
  }
  return token;
};

// Helper to handle API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Opportunity API
export const opportunitiesApi = {
  list: async (filters?: OpportunityFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return apiRequest<{ opportunities: OpportunityWithComputed[]; total: number }>(
      `/opportunities?${params.toString()}`
    );
  },

  get: async (id: string) => {
    return apiRequest<{ opportunity: OpportunityWithComputed }>(
      `/opportunities/${id}`
    );
  },

  create: async (data: CreateOpportunityRequest) => {
    return apiRequest<{ opportunity: Opportunity }>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<CreateOpportunityRequest>) => {
    return apiRequest<{ opportunity: Opportunity }>(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  },
};

// Participation API
export const participationsApi = {
  apply: async (opportunityId: string, message?: string) => {
    return apiRequest<{ participation: Participation }>(
      `/participations/opportunities/${opportunityId}/participate`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      }
    );
  },

  myParticipations: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiRequest<{ participations: ParticipationWithDetails[] }>(
      `/participations/my-participations${params}`
    );
  },

  myOpportunities: async () => {
    return apiRequest<{ opportunities: OpportunityWithComputed[] }>(
      '/participations/my-opportunities'
    );
  },

  getParticipants: async (opportunityId: string) => {
    return apiRequest<{ participants: ParticipationWithDetails[] }>(
      `/participations/opportunities/${opportunityId}/participants`
    );
  },

  updateStatus: async (participationId: string, status: 'accepted' | 'rejected') => {
    return apiRequest<{ participation: Participation }>(
      `/participations/${participationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },

  cancel: async (participationId: string) => {
    return apiRequest<{ message: string }>(`/participations/${participationId}`, {
      method: 'DELETE',
    });
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      user: { id: string; email: string; type: 'admin' | 'volunteer' | 'organization' };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Note: Token storage is now handled by AuthContext
    // This is kept for backward compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  },

  getProfile: async () => {
    return apiRequest<{
      user: { id: string; email: string; type: 'admin' | 'volunteer' | 'organization' };
    }>('/auth/me');
  },
};
