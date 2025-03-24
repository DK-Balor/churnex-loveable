
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { 
  getSubscriptionPlans, 
  createCheckoutSession, 
  handleCheckoutSuccess,
  CheckoutError
} from '../utils/stripe';

export interface CheckoutMessage {
  type: 'success' | 'error';
  text: string;
}

export const useCheckoutProcess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<CheckoutMessage | null>(null);

  // Check if this is a return from a checkout session or if there was a cancellation
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('cancelled');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
        
        // Set the default selected plan (Scale)
        const defaultPlan = plansData.find(p => p.name === 'Scale');
        if (defaultPlan) {
          setSelectedPlan(defaultPlan.id);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription plans. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchPlans();

    // Show message if checkout was cancelled
    if (canceled) {
      setMessage({
        type: 'error',
        text: "Checkout was cancelled. Please try again when you're ready."
      });
    }
  }, [canceled, toast]);

  useEffect(() => {
    // Handle checkout success
    const processCheckoutSuccess = async () => {
      if (sessionId && user) {
        setIsLoading(true);
        try {
          const result = await handleCheckoutSuccess(sessionId, user.id);
          if (result.success) {
            const planName = result.plan ? result.plan.charAt(0).toUpperCase() + result.plan.slice(1) : '';
            
            setMessage({
              type: 'success',
              text: `Successfully subscribed to the ${planName} plan! Redirecting to dashboard...`
            });
            
            toast({
              title: "Subscription activated",
              description: `You have successfully subscribed to the ${planName} plan.`,
              variant: "success",
            });
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            setMessage({
              type: 'error',
              text: 'Subscription was not found. Please contact support if you believe this is an error.'
            });
          }
        } catch (error) {
          console.error('Error processing checkout:', error);
          
          let errorMessage = 'There was an error processing your subscription. Please try again or contact support.';
          
          // Extract more specific error messages from CheckoutError
          if (error instanceof CheckoutError) {
            errorMessage = error.message;
          }
          
          setMessage({
            type: 'error',
            text: errorMessage
          });
          
          toast({
            title: "Checkout error",
            description: "There was a problem processing your subscription.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    processCheckoutSuccess();
  }, [sessionId, user, toast, navigate]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !user) {
      toast({
        title: "Error",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setMessage(null); // Clear any previous messages
    
    try {
      console.log('Creating checkout session for plan:', selectedPlan);
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      
      const { url } = await createCheckoutSession(selectedPlan);
      
      if (url) {
        console.log('Redirecting to Stripe checkout URL:', url);
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        console.error('No checkout URL returned from createCheckoutSession');
        throw new CheckoutError('No checkout URL returned', 'no_checkout_url');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Log detailed error information
      if (error instanceof CheckoutError) {
        console.error('CheckoutError details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      } else if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error type:', error);
      }
      
      let errorMessage = 'Failed to create checkout session. Please try again.';
      
      // Extract more specific error messages from CheckoutError
      if (error instanceof CheckoutError) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    plans,
    selectedPlan,
    isLoading,
    message,
    handleSelectPlan,
    handleCheckout
  };
};
