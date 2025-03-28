
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../contexts/AuthFormContext';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import AuthStatusMessage from './AuthStatusMessage';
import { useAuthFormValidation } from '../../hooks/useAuthFormValidation';

const AuthForm: React.FC = () => {
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
    businessNameTouched,
    isLoading
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

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

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
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
        const { error } = await signIn(email, password);
        
        if (error) {
          throw error;
        }
        
        setSuccess('Login successful! Redirecting to dashboard...');
        // Redirect will happen via useEffect when user state updates
      } else {
        // Handle signup
        if (!fullName || !businessName) {
          throw new Error('Please fill in all fields');
        }
        
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        console.log('Starting signup process for:', email);
        const { error } = await signUp(email, password, fullName, businessName);
        if (error) throw error;
        
        // Show success message after successful signup
        setSuccess('Account created successfully! Redirecting to dashboard...');
        // Redirect will happen via useEffect when user state updates
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link to="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-brand-dark-800">
            Churnex<span className="text-sm align-top text-brand-green">™</span>
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
                disabled={isLoading || !validation.formIsValid}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 ${
                  isLoading || !validation.formIsValid
                    ? 'bg-brand-green-300 cursor-not-allowed'
                    : 'bg-brand-green hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green'
                }`}
              >
                {isLoading
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

export default AuthForm;
