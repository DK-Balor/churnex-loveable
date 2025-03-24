
import React from 'react';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  selectedPlan: string | null;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ onClick, disabled, isLoading, selectedPlan }) => {
  const isFree = selectedPlan === 'free';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center ${
        isLoading || disabled
          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
          : 'bg-brand-green text-white hover:bg-brand-green-600'
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : isFree ? (
        'Activate Free Plan'
      ) : (
        'Continue to Checkout'
      )}
    </button>
  );
};

export default CheckoutButton;
