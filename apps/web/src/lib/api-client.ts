import type {
  Opportunity,
  OpportunityWithComputed,
  CreateOpportunityRequest,
  OpportunityFilters,
  Participation,
  ParticipationWithDetails,
} from '@justadrop/types';
import { getAuthToken, setAuthData, clearAuthData, setRegistrationEmail, type UserType, type StoredUser } from './auth-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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

  const data = await response.json().catch(() => ({ message: 'Request failed' }));

  if (!response.ok) {
    throw new ApiError(
      data.message || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data;
}

// Helper to build query params from filters
function buildQueryParams(filters?: Record<string, any>): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// ============ Auth API ============

interface LoginResponse {
  token: string;
  user: StoredUser;
}

interface RegisterResponse {
  message: string;
  user?: StoredUser;
}

export const authApi = {
  /**
   * Login for any user type (volunteer, organization, admin)
   */
  login: async (
    userType: UserType,
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<LoginResponse> => {
    const response = await apiRequest<LoginResponse>(`/auth/${userType}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store auth data
    setAuthData(response.token, response.user, userType, remember);

    return response;
  },

  /**
   * Register a volunteer
   */
  registerVolunteer: async (data: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    state: string;
    pincode: string;
    interests: string[];
    skills?: string;
    availability: string;
    bio?: string;
    experience?: string;
    motivation?: string;
  }): Promise<RegisterResponse> => {
    const response = await apiRequest<RegisterResponse>('/auth/volunteer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store email for resend functionality
    setRegistrationEmail(data.email);

    return response;
  },

  /**
   * Register an organization
   */
  registerOrganization: async (data: {
    name: string;
    email: string;
    password: string;
    description: string;
    organizationType: string;
    yearEstablished: string;
    registrationNumber: string;
    organizationSize: string;
    registrationCertificateUrl: string;
    panUrl?: string;
    certificate80gUrl?: string;
    certificate12aUrl?: string;
    addressProofUrl?: string;
    csrApprovalCertificateUrl?: string;
    fcraRegistrationUrl?: string;
    city: string;
    state: string;
    country: string;
    causes: string[];
    website?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
    preferredVolunteerType: string[];
    csrEligible: boolean;
    fcraRegistered: boolean;
    ageRestrictions?: string;
    genderRestrictions?: string;
    requiredSkills?: string[];
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactDesignation: string;
  }): Promise<RegisterResponse> => {
    const response = await apiRequest<RegisterResponse>('/auth/organization/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store email for resend functionality
    setRegistrationEmail(data.email);

    return response;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/auth/verify-email/${token}`, {
      method: 'GET',
    });
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<{ user: StoredUser }> => {
    return apiRequest<{ user: StoredUser }>('/auth/me');
  },

  /**
   * Logout - clears auth data
   */
  logout: (): void => {
    clearAuthData();
  },
};

// ============ Opportunity API ============

export const opportunitiesApi = {
  list: async (filters?: OpportunityFilters) => {
    return apiRequest<{ opportunities: OpportunityWithComputed[]; total: number }>(
      `/opportunities${buildQueryParams(filters)}`
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

// ============ Participation API ============

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
    return apiRequest<{ participations: ParticipationWithDetails[] }>(
      `/participations/my-participations${buildQueryParams({ status })}`
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

// ============ Volunteers API ============

export const volunteersApi = {
  list: async (filters?: Record<string, any>) => {
    return apiRequest<{ volunteers: any[]; total: number }>(
      `/volunteers${buildQueryParams(filters)}`
    );
  },

  get: async (id: string) => {
    return apiRequest<{ volunteer: any }>(`/volunteers/${id}`);
  },
};

// ============ Organizations API ============

export const organizationsApi = {
  list: async (filters?: Record<string, any>) => {
    return apiRequest<{ organizations: any[]; total: number }>(
      `/organizations${buildQueryParams(filters)}`
    );
  },

  get: async (id: string) => {
    return apiRequest<{ organization: any }>(`/organizations/${id}`);
  },
};
