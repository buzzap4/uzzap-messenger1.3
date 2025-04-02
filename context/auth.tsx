import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, fetchUserRole } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import { Alert } from 'react-native';

interface AuthContextType {
  session: Session | null;
  userRole: string | undefined;
  loading: boolean;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userRole: undefined,
  loading: true,
  signOut: async () => {},
  completeOnboarding: async () => {},
  authError: null,
  clearAuthError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const clearAuthError = () => setAuthError(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setAuthError(`Session check error: ${error.message}`);
          return;
        }

        if (session) {
          setSession(session);
          try {
            const role = await fetchUserRole(session.user.id);
            setUserRole(role || undefined);
          } catch (roleError) {
            setAuthError(`Failed to fetch user role: ${roleError instanceof Error ? roleError.message : 'Unknown error'}`);
          }
        }
      } catch (e) {
        setAuthError(`Unexpected error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      try {
        if (session) {
          setSession(session);
          try {
            const role = await fetchUserRole(session.user.id);
            setUserRole(role || undefined);
          } catch (roleError) {
            setAuthError(`Failed to fetch user role: ${roleError instanceof Error ? roleError.message : 'Unknown error'}`);
          }
        } else {
          setSession(null);
          setUserRole(undefined);
        }
      } catch (e) {
        setAuthError(`Auth state change error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }

      if (!session) {
        router.replace('/sign-in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const lastSegment = segments[segments.length - 1] || '';
    const isAuthScreen = ['sign-in', 'sign-up'].includes(lastSegment);

    if (!session && !isAuthScreen) {
      router.replace('/sign-in');
    } else if (session && isAuthScreen) {
      router.replace('/');
    }
  }, [session, loading, segments, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/sign-in');
    } catch (error) {
      const errorMessage = `Error signing out: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setAuthError(errorMessage);
      Alert.alert('Sign Out Error', errorMessage);
    }
  };

  const completeOnboarding = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', session?.user?.id);
      
      if (error) throw error;
      router.replace('/');
    } catch (error) {
      const errorMessage = `Error completing onboarding: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setAuthError(errorMessage);
      Alert.alert('Onboarding Error', errorMessage);
      throw error;
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      userRole, 
      loading, 
      signOut, 
      completeOnboarding,
      authError,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);