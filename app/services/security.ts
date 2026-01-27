import crypto from "crypto";

/**
 * Security utilities for the application
 */

export interface SecurityConfig {
  rateLimits: {
    [key: string]: {
      maxAttempts: number;
      windowMs: number;
    };
  };
  inputLimits: {
    [key: string]: number;
  };
  csrfTokenExpiry: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  rateLimits: {
    LOGIN: { maxAttempts: 5, windowMs: 300000 }, // 5 per 5 min
    APPLICATION_SUBMIT: { maxAttempts: 3, windowMs: 3600000 }, // 3 per hour
    API: { maxAttempts: 100, windowMs: 60000 }, // 100 per minute
  },
  inputLimits: {
    USERNAME: 32,
    EMAIL: 254,
    ANSWER: 2000,
    APPLICATION_DATA: 50000,
  },
  csrfTokenExpiry: 3600000, // 1 hour
};

class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((time) => now - time < windowMs);

    if (recentAttempts.length >= limit) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Validate input length
 */
export function validateInputLength(
  value: string,
  fieldName: string,
  maxLength?: number
): { valid: boolean; error?: string } {
  const limit = maxLength || DEFAULT_CONFIG.inputLimits[fieldName] || 1000;

  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (value.length > limit) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${limit} characters`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(
  token: string,
  storedToken: string
): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}

/**
 * Hash sensitive data
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Discord ID format
 */
export function validateDiscordId(id: string): boolean {
  return /^\d{17,19}$/.test(id);
}

/**
 * Validate Minecraft username format
 */
export function validateUsernameFormat(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,16}$/.test(username);
}

/**
 * Create secure headers for responses
 */
export function getSecureHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.discordapp.com; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self' https:",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  };
}

/**
 * Validate application data size
 */
export function validateApplicationDataSize(
  data: unknown,
  maxSize: number = DEFAULT_CONFIG.inputLimits.APPLICATION_DATA
): boolean {
  const jsonString = JSON.stringify(data);
  return jsonString.length <= maxSize;
}

/**
 * Rate limit key generator for IP-based limiting
 */
export function generateRateLimitKey(
  identifier: string,
  endpoint: string
): string {
  return `${identifier}:${endpoint}`;
}
