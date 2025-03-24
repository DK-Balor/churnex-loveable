
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://atobskmygodtszvfmtww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2Jza215Z29kdHN6dmZtdHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjcwODMsImV4cCI6MjA1ODQwMzA4M30.y7Z4DYunMGOba6AgbSrYY6j_SqOrm1XRIAfTSmcw6EY';

// Session expiry in seconds (24 hours)
export const SESSION_EXPIRY = 24 * 60 * 60;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: true // Enable this to see detailed auth logs
  }
});

// Add a helper function to handle email verification
export const sendVerificationCode = async (email: string) => {
  try {
    console.log('Sending verification code to:', email);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) {
      console.error('Error sending verification code:', error);
      return { error };
    }
    
    console.log('Verification code sent successfully');
    return { error: null };
  } catch (error) {
    console.error('Exception sending verification code:', error);
    return { error: error as Error };
  }
};
