
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { handleCheckoutSuccess, CheckoutError } from '../utils/stripe';
import { useToast } from '../components/ui/use-toast';
import { CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  // Get the session ID from the URL
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Process the checkout success
    const processCheckoutSuccess = async () => {
      if (!sessionId) {
        console.error('Missing checkout session ID in URL parameters');
        setError('Missing checkout session ID. Please try again or contact support.');
        setIsProcessing(false);
        return;
      }
      
      if (!user) {
        console.error('No authenticated user found');
        setError('User authentication required. Please log in and try again.');
        setIsProcessing(false);
        return;
      }

      try {
        console.log(`Processing checkout success for session ${sessionId} and user ${user.id}`);
        const result = await handleCheckoutSuccess(sessionId, user.id);
        console.log('Checkout success result:', result);
        
        setSubscriptionDetails(result);
        
        if (result.success) {
          setPlan(result.plan);
          
          const planName = result.plan ? result.plan.charAt(0).toUpperCase() + result.plan.slice(1) : '';
          const status = result.isTrial ? 'trial' : 'active';
          
          console.log(`Subscription ${status}: ${planName} plan (${result.status})`);
          
          toast({
            title: result.isTrial ? "Trial Activated" : "Subscription Activated",
            description: `You have successfully subscribed to the ${planName} plan. ${
              result.isTrial ? 'Your free trial is now active.' : ''
            }`,
            variant: "success"
          });
          
          // Redirect to dashboard after 5 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 5000);
        } else {
          console.error('Subscription verification failed:', result);
          setError('Your subscription could not be verified. Please contact support if you believe this is an error.');
          
          // Log detailed information for debugging
          console.error('Subscription verification failed with details:', {
            plan: result.plan,
            status: result.status,
            accountType: result.accountType,
            success: result.success
          });
        }
      } catch (error) {
        console.error('Error processing checkout:', error);
        
        let errorMessage = 'There was an error processing your subscription. Please try again or contact support.';
        
        // Extract more specific error messages from CheckoutError
        if (error instanceof CheckoutError) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
        toast({
          title: "Checkout error",
          description: "There was a problem processing your subscription.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processCheckoutSuccess();
  }, [sessionId, user, navigate, toast]);

  const renderSubscriptionDetails = () => {
    if (!subscriptionDetails) return null;
    
    const trialInfo = subscriptionDetails.isTrial && subscriptionDetails.trialEndsAt ? (
      <p className="text-brand-dark-600 mt-2">
        Your free trial ends on {new Date(subscriptionDetails.trialEndsAt).toLocaleDateString()}.
      </p>
    ) : null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold mb-2">Subscription Details</h3>
        <p><span className="font-medium">Plan:</span> {subscriptionDetails.plan || 'None'}</p>
        <p><span className="font-medium">Status:</span> {subscriptionDetails.status}</p>
        <p><span className="font-medium">Account Type:</span> {subscriptionDetails.accountType}</p>
        {trialInfo}
      </div>
    );
  };

  if (isProcessing) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-brand-green border-t-transparent rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-brand-dark-900 mb-2">Processing your subscription...</h1>
          <p className="text-brand-dark-600">Please wait while we activate your subscription.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <div className="text-center">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="mb-4">{error}</p>
            <div className="text-sm text-red-600 p-3 bg-red-100 rounded mb-4">
              <p>Debug Info: Session ID: {sessionId || 'Not provided'}</p>
              <p>User ID: {user?.id || 'Not authenticated'}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center mx-auto px-6 py-3 bg-brand-dark-800 text-white rounded-md hover:bg-brand-dark-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <div className="text-center">
        <div className="mb-8">
          <CheckCircle className="h-20 w-20 text-brand-green mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-brand-dark-900 mb-4">Success!</h1>
          <p className="text-xl text-brand-dark-700 mb-2">
            Your {plan && plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active.
          </p>
          <p className="text-brand-dark-600 mb-4">
            You'll be redirected to your dashboard in a few seconds...
          </p>
          
          {renderSubscriptionDetails()}
        </div>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-brand-green text-white px-6 py-3 rounded-md hover:bg-brand-green-600 transition-colors shadow-md"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}
