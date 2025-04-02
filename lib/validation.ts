// Input validation utilities

/**
 * Validates a string against length constraints
 */
export const validateString = (
  value: string | null | undefined,
  options: { 
    minLength?: number; 
    maxLength?: number; 
    required?: boolean;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): { valid: boolean; message?: string } => {
  const { 
    minLength = 0, 
    maxLength = 9007199254740991, // Number.MAX_SAFE_INTEGER value hardcoded for compatibility
    required = false,
    pattern,
    patternMessage
  } = options;

  // Check if value exists
  if (!value) {
    return { 
      valid: !required, 
      message: required ? 'This field is required' : undefined 
    };
  }

  // Check min length
  if (value.length < minLength) {
    return { 
      valid: false, 
      message: `Must be at least ${minLength} characters` 
    };
  }

  // Check max length
  if (value.length > maxLength) {
    return { 
      valid: false, 
      message: `Must be no more than ${maxLength} characters` 
    };
  }

  // Check pattern
  if (pattern && !pattern.test(value)) {
    return { 
      valid: false, 
      message: patternMessage || 'Invalid format' 
    };
  }

  return { valid: true };
};

/**
 * Validates an email address
 */
export const validateEmail = (email: string | null | undefined): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email address' };
  }

  return { valid: true };
};

/**
 * Validates a username
 */
export const validateUsername = (username: string | null | undefined): { valid: boolean; message?: string } => {
  if (!username) {
    return { valid: false, message: 'Username is required' };
  }

  // Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return { 
      valid: false, 
      message: 'Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens' 
    };
  }

  return { valid: true };
};

/**
 * Validates a password
 */
export const validatePassword = (password: string | null | undefined): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return { 
      valid: false, 
      message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character' 
    };
  }

  return { valid: true };
};

/**
 * Sanitizes a string to prevent XSS attacks
 */
export const sanitizeString = (value: string): string => {
  if (!value) return '';
  
  // Replace HTML special characters with their entity equivalents
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates and sanitizes message content
 */
export const validateMessageContent = (content: string | null | undefined): { 
  valid: boolean; 
  message?: string;
  sanitized?: string;
} => {
  const validation = validateString(content, { 
    required: true, 
    minLength: 1, 
    maxLength: 2000 
  });

  if (!validation.valid) {
    return validation;
  }

  // If valid, return sanitized content
  return { 
    valid: true, 
    sanitized: sanitizeString(content as string) 
  };
};
