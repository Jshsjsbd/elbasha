// export class ValidationService {
//   // Email validation
//   static isValidEmail(email: string): boolean {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email) && email.length <= 254;
//   }

//   // Password validation
//   static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
//     const errors: string[] = [];
    
//     if (password.length < 8) {
//       errors.push('Password must be at least 8 characters long');
//     }
    
//     if (password.length > 128) {
//       errors.push('Password must be less than 128 characters');
//     }
    
//     if (!/[A-Z]/.test(password)) {
//       errors.push('Password must contain at least one uppercase letter');
//     }
    
//     if (!/[a-z]/.test(password)) {
//       errors.push('Password must contain at least one lowercase letter');
//     }
    
//     if (!/\d/.test(password)) {
//       errors.push('Password must contain at least one number');
//     }
    
//     if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
//       errors.push('Password must contain at least one special character');
//     }
    
//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }

//   // Name validation
//   static isValidName(name: string): { isValid: boolean; errors: string[] } {
//     const errors: string[] = [];
    
//     if (!name || name.trim().length === 0) {
//       errors.push('Name is required');
//     }
    
//     if (name.length > 100) {
//       errors.push('Name must be less than 100 characters');
//     }
    
//     // Check for potentially dangerous characters
//     if (/[<>\"'&]/.test(name)) {
//       errors.push('Name contains invalid characters');
//     }
    
//     // Check for excessive whitespace
//     if (/\s{2,}/.test(name)) {
//       errors.push('Name contains excessive whitespace');
//     }
    
//     return {
//       isValid: errors.length === 0,
//       errors
//     };
//   }

//   // Level validation
//   static isValidLevel(level: number): boolean {
//     return Number.isInteger(level) && level >= 1 && level <= 100;
//   }

//   // Sanitize string input
//   static sanitizeString(input: string): string {
//     if (typeof input !== 'string') {
//       return '';
//     }
    
//     return input
//       .trim()
//       .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
//       .replace(/\s+/g, ' ') // Normalize whitespace
//       .substring(0, 1000); // Limit length
//   }

//   // Sanitize email
//   static sanitizeEmail(email: string): string {
//     if (typeof email !== 'string') {
//       return '';
//     }
    
//     return email.trim().toLowerCase().substring(0, 254);
//   }

//   // Validate and sanitize form data
//   static validateFormData(data: Record<string, any>): {
//     isValid: boolean;
//     errors: Record<string, string[]>;
//     sanitizedData: Record<string, any>;
//   } {
//     const errors: Record<string, string[]> = {};
//     const sanitizedData: Record<string, any> = {};

//     for (const [key, value] of Object.entries(data)) {
//       const sanitizedValue = this.sanitizeString(String(value));
//       sanitizedData[key] = sanitizedValue;

//       // Validate based on field type
//       switch (key) {
//         case 'email':
//           if (!this.isValidEmail(sanitizedValue)) {
//             errors[key] = ['Invalid email format'];
//           }
//           break;
        
//         case 'password':
//           const passwordValidation = this.isValidPassword(sanitizedValue);
//           if (!passwordValidation.isValid) {
//             errors[key] = passwordValidation.errors;
//           }
//           break;
        
//         case 'name':
//         case 'newName':
//           const nameValidation = this.isValidName(sanitizedValue);
//           if (!nameValidation.isValid) {
//             errors[key] = nameValidation.errors;
//           }
//           break;
        
//         case 'level':
//           const levelNum = parseInt(sanitizedValue);
//           if (!this.isValidLevel(levelNum)) {
//             errors[key] = ['Invalid level number'];
//           }
//           sanitizedData[key] = levelNum;
//           break;
//       }
//     }

//     return {
//       isValid: Object.keys(errors).length === 0,
//       errors,
//       sanitizedData
//     };
//   }

//   // Rate limiting helper
//   private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  
//   static isRateLimited(identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
//     const now = Date.now();
//     const record = this.requestCounts.get(identifier);
    
//     if (!record || now > record.resetTime) {
//       this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
//       return false;
//     }
    
//     if (record.count >= maxRequests) {
//       return true;
//     }
    
//     record.count++;
//     return false;
//   }
// }

// export default ValidationService;
