export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    LOGIN: { maxAttempts: 5, windowMs: 300000 }, // 5 attempts per 5 minutes
    SIGNUP: { maxAttempts: 3, windowMs: 300000 }, // 3 attempts per 5 minutes
    PASSWORD_RESET: { maxAttempts: 3, windowMs: 600000 }, // 3 attempts per 10 minutes
    API_CALLS: { maxAttempts: 100, windowMs: 60000 }, // 100 calls per minute
  },

  // Password requirements
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },

  // Input validation
  INPUT_LIMITS: {
    EMAIL_MAX_LENGTH: 254,
    NAME_MAX_LENGTH: 100,
    GENERAL_TEXT_MAX_LENGTH: 1000,
  },

  // Session management
  SESSION: {
    TOKEN_EXPIRY: 3600000, // 1 hour
    REFRESH_TOKEN_EXPIRY: 604800000, // 7 days
  },

  // API security
  API: {
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://www.gstatic.com",
      "https://www.googleapis.com",
    ],
    STYLE_SRC: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],
    FONT_SRC: [
      "'self'",
      "https://fonts.gstatic.com",
    ],
    IMG_SRC: [
      "'self'",
      "data:",
      "https:",
    ],
    CONNECT_SRC: [
      "'self'",
      "https://firebase.googleapis.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
    ],
    FRAME_ANCESTORS: ["'none'"],
  },

  // Allowed domains for external requests
  ALLOWED_DOMAINS: [
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
    "securetoken.googleapis.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
  ],

  // Security headers
  SECURITY_HEADERS: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // Error messages (generic to prevent information leakage)
  ERROR_MESSAGES: {
    GENERIC_ERROR: "An error occurred. Please try again.",
    AUTH_ERROR: "Authentication failed. Please check your credentials.",
    VALIDATION_ERROR: "Invalid input provided.",
    RATE_LIMIT_ERROR: "Too many requests. Please try again later.",
    NETWORK_ERROR: "Network error. Please check your connection.",
  },
};

// Security utility functions
export const SecurityUtils = {
  // Generate secure random string
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray);
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomArray[i] % chars.length);
    }
    return result;
  },

  // Hash sensitive data (for client-side storage)
  async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Validate URL for allowed domains
  isValidExternalUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return SECURITY_CONFIG.ALLOWED_DOMAINS.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  },

  // Sanitize HTML content
  sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  // Check if running in secure context
  isSecureContext(): boolean {
    return window.isSecureContext;
  },

  // Get security status
  getSecurityStatus(): {
    isSecureContext: boolean;
    hasHttps: boolean;
    hasValidCSP: boolean;
  } {
    return {
      isSecureContext: this.isSecureContext(),
      hasHttps: window.location.protocol === 'https:',
      hasValidCSP: 'securityPolicy' in document,
    };
  },
};

export default SECURITY_CONFIG;
