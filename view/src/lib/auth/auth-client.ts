const API_BASE = '/api/auth';

export interface VolunteeringData {
  isInterest: boolean;
  skills: Array<{ name: string; expertise: string }>;
  causes: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  emailVerified: boolean;
  volunteering?: VolunteeringData;
}

export interface SendOtpResponse {
  success?: boolean;
  error?: string;
}

export interface VerifyOtpResponse {
  user: AuthUser;
  isNewUser: boolean;
}

export const authClient = {
  async sendOtp(email: string): Promise<SendOtpResponse> {
    const res = await fetch(`${API_BASE}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to send code');
    }
    return data;
  },

  async verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
    const res = await fetch(`${API_BASE}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        code: code.trim(),
      }),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Invalid or expired code');
    }
    return data;
  },

  async getSession(): Promise<AuthUser | null> {
    const res = await fetch(`${API_BASE}/me`, {
      credentials: 'include',
    });
    if (res.status === 401) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) return null;
    return data;
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },
};
