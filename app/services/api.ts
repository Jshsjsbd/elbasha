interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    this.initializeCSRF();
  }

  private async initializeCSRF() {
    try {
      const response = await fetch(`${this.baseUrl}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
      }
    } catch (error) {
      console.warn('CSRF token initialization failed:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF token if available
    if (this.csrfToken) {
      (headers as Record<string, string>)['X-CSRF-Token'] = this.csrfToken;
    }

    // Add authentication header if user is logged in
    const auth = import('firebase/auth');
    const { getAuth } = await auth;
    const { auth: firebaseAuth } = await import('../firebase');
    const user = firebaseAuth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // User management
  async signup(userData: { name: string; email: string; uid: string; emailVerified: boolean }) {
    return this.makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateProfile(email: string, newName: string) {
    return this.makeRequest('/account/update-name', {
      method: 'PUT',
      body: JSON.stringify({ email, newName }),
    });
  }

  async changePassword(email: string, currentPassword: string, newPassword: string) {
    return this.makeRequest('/account/change-password', {
      method: 'PUT',
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
  }

  async deleteAccount(email: string, password: string) {
    return this.makeRequest('/account/delete', {
      method: 'DELETE',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyEmail(email: string) {
    return this.makeRequest('/account/verify-email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }

  // Dashboard and game data
  async getDashboard(email: string) {
    return this.makeRequest('/dashboard', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async checkLevelAccess(email: string, level: number) {
    return this.makeRequest('/level-access', {
      method: 'POST',
      body: JSON.stringify({ email, level }),
    });
  }

  async getScoreboard() {
    return this.makeRequest('/scoreboard');
  }

  // IP check (server-side only)
  async checkIP() {
    return this.makeRequest('/ip-check');
  }
}

export const apiService = new ApiService();
export default apiService;
