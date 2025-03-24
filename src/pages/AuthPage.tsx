
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthFormProvider, useAuthForm } from '../contexts/AuthFormContext';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';
import AuthStatusMessage from '../components/auth/AuthStatusMessage';
import { useAuthFormValidation } from '../hooks/useAuthFormValidation';
import { useToast } from '../components/ui/use-toast';
import { MailCheck } from 'lucide-react';

const AuthFormContent = () => {
  const { state, actions } = useAuthForm();
  const { 
    isLogin, 
    email, 
    password,
    confirmPassword,
    fullName, 
    businessName,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
    fullNameTouched,
    businessNameTouched
  } = state;
  
  const { 
    setIsLogin, 
    setError, 
    setSuccess, 
    setIsLoading,
    resetTouchedStates,
    setEmailTouched,
    setPasswordTouched,
    setConfirmPasswordTouched,
    setFullNameTouched,
    setBusinessNameTouched
  } = actions;

  const { signIn, signUp, signOut, user, emailConfirmed, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use our validation hook
  const validation = useAuthFormValidation(
    isLogin,
    email,
    password,
    confirmPassword,
    fullName,
    businessName,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
    fullNameTouched,
    businessNameTouched
  );

  useEffect(() => {
    // Clear error when switching between login and signup
    setError(null);
    setSuccess(null);
    resetTouchedStates();
  }, [isLogin]);

  useEffect(() => {
    // If user is already logged in and email is verified, redirect to dashboard
    if (user && emailConfirmed) {
      navigate('/dashboard');
    }
  }, [user, emailConfirmed, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address to resend verification');
      return;
    }
    
    setIsLoading(true);
    await resendVerificationEmail(email);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Force validation on all fields
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!isLogin) {
      setConfirmPasswordTouched(true);
      setFullNameTouched(true);
      setBusinessNameTouched(true);
    }
    
    if (!validation.formIsValid) {
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { error, emailVerificationNeeded } = await signIn(email, password);
        
        if (error && !emailVerificationNeeded) {
          throw error;
        }
        
        // If emailVerificationNeeded, we'll show the verification UI via useEffect
        if (!error && !emailVerificationNeeded) {
          // Only show success message if email is verified
          setSuccess('Login successful! Redirecting to dashboard...');
        }
      } else {
        // Handle signup
        if (!fullName || !businessName) {
          throw new Error('Please fill in all fields');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const { error } = await signUp(email, password, fullName, businessName);
        if (error) throw error;
        
        // Show success message - the verification UI will be shown automatically
        setSuccess('Account created successfully! Please check your email to verify your account.');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  // Show email verification UI if user exists but email is not confirmed
  if (user && !emailConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <Link to="/" className="flex justify-center">
            <h1 className="text-3xl font-bold text-brand-dark-800">
              Churnex<span className="text-sm align-top">™</span>
            </h1>
          </Link>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-brand-green-100 flex items-center justify-center">
                  <MailCheck className="h-6 w-6 text-brand-green" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-brand-dark-900">Verify your email</h2>
              <p className="mt-2 text-sm text-brand-dark-500">
                We've sent a verification email to <span className="font-medium">{user.email}</span>.
                Please check your inbox and click the verification link.
              </p>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleResendVerification}
                disabled={state.isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 
                  ${state.isLoading ? 'bg-brand-green-300 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green-600'}`}
              >
                {state.isLoading ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => signOut()} 
                className="text-sm text-brand-dark-500 hover:text-brand-dark-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link to="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-brand-dark-800">
            Churnex<span className="text-sm align-top">™</span>
          </h1>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-brand-dark-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-brand-dark-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-brand-green hover:text-brand-green-600"
              >
                {isLogin ? 'Create one now' : 'Sign in'}
              </button>
            </p>
          </div>

          <AuthStatusMessage />

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isLogin ? <SignInForm /> : <SignUpForm />}

            <div>
              <button
                type="submit"
                disabled={state.isLoading || !validation.formIsValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 ${
                  state.isLoading || !validation.formIsValid
                    ? 'bg-brand-green-300 cursor-not-allowed'
                    : 'bg-brand-green hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green'
                }`}
              >
                {state.isLoading
                  ? 'Processing...'
                  : isLogin
                  ? 'Sign in'
                  : 'Create account'}
              </button>
            </div>
          </form>

          {!isLogin && (
            <div className="mt-6">
              <p className="text-xs text-center text-brand-dark-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="font-medium text-brand-green hover:text-brand-green-600">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-brand-green hover:text-brand-green-600">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AuthPage() {
  return (
    <AuthFormProvider>
      <AuthFormContent />
    </AuthFormProvider>
  );
}
