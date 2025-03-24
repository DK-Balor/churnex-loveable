
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';
import { AuthContextType } from '../types/auth';
import { checkSessionExpiry, updateUserActivity, trackUserLogin } from '../utils/authUtils';
import { useProfile } from '../hooks/useProfile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState<boolean>(true);
  const { toast } = useToast();
  const { profile, isProfileLoading, updateProfile } = useProfile(user);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Handle session expiry
        if (session && checkSessionExpiry(session)) {
          console.log('Session expired, signing out');
          supabase.auth.signOut();
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
            variant: "default",
          });
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if email is confirmed
        if (session?.user) {
          setEmailConfirmed(session.user.email_confirmed_at !== null);
        }
        
        setIsLoading(false);
        
        // Update user activity when session changes
        if (session?.user) {
          updateUserActivity(session.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: `You're now signed in as ${session?.user?.email}`,
          });
          
          // Track login when user signs in
          if (session?.user) {
            trackUserLogin(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        } else if (event === 'USER_UPDATED') {
          // Check if email is confirmed after update
          if (session?.user && session.user.email_confirmed_at) {
            setEmailConfirmed(true);
            toast({
              title: "Email verified",
              description: "Your email has been successfully verified.",
            });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session check:', session?.user?.email);
      
      // Check if the existing session has expired
      if (session && checkSessionExpiry(session)) {
        console.log('Existing session expired, signing out');
        supabase.auth.signOut();
        toast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
          variant: "default",
        });
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if email is confirmed for existing session
      if (session?.user) {
        setEmailConfirmed(session.user.email_confirmed_at !== null);
      }
      
      setIsLoading(false);
      
      // Update user activity on initial load if user is logged in
      if (session?.user) {
        updateUserActivity(session.user.id);
      }
    });

    // Set up an interval to check for session expiry every minute
    const checkInterval = setInterval(() => {
      if (session && checkSessionExpiry(session)) {
        console.log('Session expired during active use, signing out');
        supabase.auth.signOut();
        toast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
          variant: "default",
        });
      }
    }, 60 * 1000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(checkInterval);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          // Set session expiry to 24 hours
          expiresIn: 24 * 60 * 60
        }
      });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific error for unverified email
        if (error.message.includes('Email not confirmed')) {
          setEmailConfirmed(false);
          // Don't show toast here since we'll show the verification UI instead
          return { error, emailVerificationNeeded: true };
        }
        
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error, data };
    } catch (error) {
      console.error('Sign in exception:', error);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const verifyEmail = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      
      if (error) {
        console.error('Email verification error:', error);
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      setEmailConfirmed(true);
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Email verification exception:', error);
      toast({
        title: "Verification error",
        description: "An unexpected error occurred during email verification.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        console.error('Error resending verification email:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
      
      return { error: null };
    } catch (error) {
      console.error('Exception resending verification email:', error);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, businessName: string) => {
    try {
      console.log('Signing up user:', email);
      const response = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName
          },
          emailRedirectTo: window.location.origin + '/auth?verified=true',
          // Set session expiry to 24 hours
          expiresIn: 24 * 60 * 60
        }
      });

      if (response.error) {
        console.error('Sign up error:', response.error);
        toast({
          title: "Signup failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else if (response.data.user) {
        console.log('User created:', response.data.user.id);
        setEmailConfirmed(false);
        
        // Create the user profile
        await supabase.from('user_metadata').insert([{
          id: response.data.user.id,
          full_name: fullName,
          business_name: businessName,
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7-day trial
          last_login_at: new Date().toISOString(),
          login_count: 1
        }]);
        
        // No toast here as we'll show the verification UI directly
      }

      return { error: response.error, data: response.data };
    } catch (error) {
      console.error('Sign up exception:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred during sign up.",
        variant: "destructive",
      });
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isProfileLoading,
    emailConfirmed,
    signIn,
    signUp,
    signOut,
    resendVerificationEmail,
    verifyEmail,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
