import 'react-native-url-polyfill/auto';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES = 30; // 30 messages per minute

// Improved rate limiting with better error handling
export const checkRateLimit = async (userId: string): Promise<{ allowed: boolean; message?: string }> => {
  if (!userId) {
    return { allowed: false, message: 'User ID is required for rate limiting' };
  }

  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'message')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }

    if (!data) {
      // Create new rate limit record
      const { error: insertError } = await supabase.from('rate_limits').insert({
        user_id: userId,
        type: 'message',
        count: 1,
        reset_at: new Date(Date.now() + RATE_LIMIT_WINDOW)
      });

      if (insertError) {
        throw insertError;
      }
      
      return { allowed: true };
    }

    if (new Date(data.reset_at) < new Date()) {
      // Reset expired rate limit
      const { error: updateError } = await supabase.from('rate_limits').upsert({
        user_id: userId,
        type: 'message',
        count: 1,
        reset_at: new Date(Date.now() + RATE_LIMIT_WINDOW)
      });

      if (updateError) {
        throw updateError;
      }
      
      return { allowed: true };
    }

    if (data.count >= MAX_MESSAGES) {
      const resetTime = new Date(data.reset_at);
      const timeLeft = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
      return { 
        allowed: false, 
        message: `Rate limit exceeded. Please try again in ${timeLeft} seconds.` 
      };
    }

    // Increment count
    const { error: incrementError } = await supabase.from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('user_id', userId)
      .eq('type', 'message');

    if (incrementError) {
      throw incrementError;
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow the message if we can't check the rate limit
    // This is a security decision - in production you might want to fail closed instead
    return { 
      allowed: true, 
      message: 'Rate limit check failed, but message allowed as fallback' 
    };
  }
};

// Error handling
export const DB_ERRORS = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
  INVALID_PARAMETER: 'PGRST116',
  PERMISSION_DENIED: '42501',
  UNDEFINED_TABLE: '42P01'
} as const;

export const handleDatabaseError = (error: PostgrestError | null): string => {
  if (!error) return 'Unknown error occurred';
  
  switch (error.code) {
    case DB_ERRORS.FOREIGN_KEY_VIOLATION:
      return 'Referenced record does not exist';
    case DB_ERRORS.UNIQUE_VIOLATION:
      return 'Record already exists';
    case DB_ERRORS.CHECK_VIOLATION:
      return 'Value violates check constraint';
    case DB_ERRORS.NOT_NULL_VIOLATION:
      return 'Required field is missing';
    case DB_ERRORS.INVALID_PARAMETER:
      return 'Invalid parameters provided';
    case DB_ERRORS.PERMISSION_DENIED:
      return 'Permission denied';
    case DB_ERRORS.UNDEFINED_TABLE:
      return 'Table does not exist';
    default:
      return error.message || 'An unexpected database error occurred';
  }
};

// Add better error handling
export const handleSupabaseError = (error: any): string => {
  if (error?.code === '23505') return 'Duplicate entry';
  if (error?.code === 'PGRST301') return 'Authentication required';
  if (error?.code === '23503') return 'Referenced record not found';
  return 'An unexpected error occurred';
};

// Add type-safe database operations
export type Tables = Database['public']['Tables'];

// Add response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Chatroom functions
export const joinChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatroom_memberships')
      .insert({
        chatroom_id: chatroomId,
        user_id: userId
      });

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

export const leaveChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatroom_memberships')
      .delete()
      .eq('chatroom_id', chatroomId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// User functions
export const fetchUserRole = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, return default role
        return 'user';
      }
      throw error;
    }

    return data?.role || 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default to 'user' role on error
  }
};

// Session management
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
      const { data: { session: newSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;
      return newSession;
    }
    return session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    throw error;
  }
};

// Add session timeout management
export const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

export const setupSessionTimeout = (onTimeout: () => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(onTimeout, SESSION_TIMEOUT);
  };
  
  // Set up activity listeners
  const setupActivityListeners = () => {
    if (typeof window !== 'undefined') {
      ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, resetTimeout);
      });
    }
  };
  
  // Clean up function
  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (typeof window !== 'undefined') {
      ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    }
  };
  
  // Initialize
  resetTimeout();
  setupActivityListeners();
  
  return cleanup;
};

// Secure token storage
export const secureTokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },
  
  async getRefreshToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.refresh_token || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }
};